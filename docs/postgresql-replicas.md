# PostgreSQL Read Replicas & Failover (P9 — v2.8.0)

## Read Replica Architecture

```
┌─────────────────────────┐
│     Application Layer   │
│   (Prisma + pgbouncer)  │
└──────┬──────────┬───────┘
       │          │
    Writes      Reads
       │          │
┌──────▼──────┐  ┌▼────────────────┐
│  Primary    │  │  Read Replicas  │
│  (Write)    │──│  (Streaming)    │
│  Mumbai     │  │ ┌──────────────┐│
└─────────────┘  │ │ Mumbai (R1)  ││
                 │ │ Virginia (R2)││
                 │ │ London (R3)  ││
                 │ └──────────────┘│
                 └─────────────────┘
```

## Prisma Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")         // Primary (writes)
  directUrl = env("DIRECT_URL")           // Direct for migrations
}

// In application code, use read-replica routing:
// const readClient = new PrismaClient({ datasourceUrl: process.env.READ_REPLICA_URL })
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@primary.ap-south-1.rds.amazonaws.com:5432/lumiere"
READ_REPLICA_URL="postgresql://user:pass@replica.ap-south-1.rds.amazonaws.com:5432/lumiere"
READ_REPLICA_US="postgresql://user:pass@replica.us-east-1.rds.amazonaws.com:5432/lumiere"
READ_REPLICA_EU="postgresql://user:pass@replica.eu-west-1.rds.amazonaws.com:5432/lumiere"
```

## Read/Write Routing

```typescript
// lib/db.ts
const PRIMARY_DB = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
const REPLICAS = {
  "ap-south-1": new PrismaClient({ datasourceUrl: process.env.READ_REPLICA_URL }),
  "us-east-1":  new PrismaClient({ datasourceUrl: process.env.READ_REPLICA_US }),
  "eu-west-1":  new PrismaClient({ datasourceUrl: process.env.READ_REPLICA_EU }),
};

function getReadClient(region: string) {
  return REPLICAS[region] || REPLICAS["ap-south-1"];
}

// Writes always go to primary
async function createOrder(data) { return PRIMARY_DB.order.create({ data }); }

// Reads go to nearest replica
async function getProducts(region: string) {
  return getReadClient(region).product.findMany();
}
```

## Replica Lag Monitoring

```sql
-- Check replication lag on replica
SELECT
  pg_last_wal_receive_lsn() AS received,
  pg_last_wal_replay_lsn() AS replayed,
  pg_last_wal_receive_lsn() - pg_last_wal_replay_lsn() AS lag_bytes,
  EXTRACT(EPOCH FROM now() - pg_last_xact_replay_timestamp()) AS lag_seconds;
```

### Alerting Thresholds

| Metric | Warning | Critical | Action |
| --- | --- | --- | --- |
| Replication lag | > 5 seconds | > 30 seconds | Page on-call |
| Replica connections | > 80% pool | > 95% pool | Scale replica |
| Query latency (p95) | > 50ms | > 200ms | Investigate query plans |

---

## Automated Failover

### Health Check Script

```bash
#!/bin/bash
# /opt/lumiere/scripts/health-check.sh
PRIMARY_HOST="primary.ap-south-1.rds.amazonaws.com"
REPLICA_HOST="replica.ap-south-1.rds.amazonaws.com"

# Check primary connectivity
if ! pg_isready -h "$PRIMARY_HOST" -t 5; then
  echo "[ALERT] Primary unreachable — initiating failover"
  
  # Promote replica
  psql -h "$REPLICA_HOST" -c "SELECT pg_promote();"
  
  # Update DNS (via Route53 / Cloudflare API)
  aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890 \
    --change-batch '{
      "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "db.lumiere.com",
          "Type": "CNAME",
          "TTL": 60,
          "ResourceRecords": [{"Value": "'$REPLICA_HOST'"}]
        }
      }]
    }'
  
  # Notify team
  curl -X POST "$SLACK_WEBHOOK" \
    -d '{"text": "🚨 DB Failover executed: promoted replica to primary"}'
fi
```

### Failover Testing Schedule

| Test | Frequency | Method |
| --- | --- | --- |
| Replica promotion | Monthly | Manual promote + DNS switch |
| Connection failover | Weekly | Kill primary connections, verify routing |
| PITR restore | Monthly | Restore to 1-hour-old snapshot |
| Full DR simulation | Quarterly | Simulate region outage, promote cross-region |
