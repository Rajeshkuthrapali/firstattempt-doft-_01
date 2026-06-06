# PostgreSQL Enterprise Features (P8 — v2.7.0)

## Sharding Strategy

### Rationale

As Lumière expands globally, a single PostgreSQL instance cannot serve
low-latency reads across India, US, UK, and UAE. Horizontal sharding
distributes data by geography for localized performance.

### Architecture: Citus-Based Sharding

```
┌──────────────────────────────────────────┐
│            Citus Coordinator             │
│     (Query routing + distribution)       │
└──────┬────────────┬────────────┬─────────┘
       │            │            │
   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
   │ Shard │   │ Shard │   │ Shard │
   │  IN   │   │  US   │   │  EU   │
   │ (Asia)│   │(Amer.)│   │(EMEA) │
   └───────┘   └───────┘   └───────┘
```

### Implementation

```sql
-- Install Citus extension
CREATE EXTENSION IF NOT EXISTS citus;

-- Distribute Order table by region
SELECT create_distributed_table('"Order"', 'region');

-- Distribute Customer table by region
SELECT create_distributed_table('"Customer"', 'region');

-- Co-locate Order and Customer on same shard
SELECT create_distributed_table('"Order"', 'customerId',
  colocate_with => '"Customer"');

-- Reference tables (replicated to all shards)
SELECT create_reference_table('"Product"');
SELECT create_reference_table('"LoyaltyTier"');
```

### Shard Key Selection

| Table | Shard Key | Rationale |
| --- | --- | --- |
| `Customer` | `region` | Locality — queries are regional |
| `Order` | `customerId` | Co-located with customer shard |
| `Product` | reference | Small table, replicated globally |
| `LoyaltyTier` | reference | Config data, replicated globally |

### Performance Targets

| Metric | Single Instance | With Citus Sharding |
| --- | --- | --- |
| Read latency (same region) | 18ms p95 | **6ms p95** |
| Write throughput | 2,000 TPS | **8,000 TPS** |
| Max concurrent connections | 200 | **800** |

---

## Automated Backup & Disaster Recovery

### Continuous Archiving (WAL)

```bash
# postgresql.conf
archive_mode = on
archive_command = 'aws s3 cp %p s3://lumiere-wal-backups/%f'
wal_level = replica
max_wal_senders = 5
```

### Automated Backup Schedule

| Type | Frequency | Retention | Tool |
| --- | --- | --- | --- |
| Base backup | Daily 02:00 UTC | 30 days | `pg_basebackup` |
| WAL archiving | Continuous | 7 days | `archive_command` |
| Logical backup | Weekly Sun 03:00 | 90 days | `pg_dump` |
| Cross-region replica | Real-time | Always on | Streaming replication |

### Backup Script

```bash
#!/bin/bash
# /opt/lumiere/scripts/backup.sh
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/lumiere"
S3_BUCKET="s3://lumiere-db-backups"

# Base backup
pg_basebackup -D "$BACKUP_DIR/$TIMESTAMP" -Ft -z -P \
  -h localhost -U backup_user

# Upload to S3
aws s3 sync "$BACKUP_DIR/$TIMESTAMP" "$S3_BUCKET/$TIMESTAMP/"

# Cleanup local (keep 3 days)
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -mtime +3 -exec rm -rf {} +

echo "[Backup] Completed: $TIMESTAMP"
```

### Point-in-Time Recovery (PITR)

```bash
# Restore to specific timestamp
pg_restore \
  --target-time="2026-03-26 12:00:00 UTC" \
  --target-action=promote \
  /backups/lumiere/20260326_020000

# Verify recovery
psql -c "SELECT COUNT(*) FROM \"Order\";"
psql -c "SELECT MAX(\"createdAt\") FROM \"Order\";"
```

### Disaster Recovery Runbook

1. **Detection**: Automated alerts via PgBouncer health checks + Sentry
2. **Assessment**: Check `pg_is_in_recovery()`, WAL lag, replication status
3. **Failover**: Promote standby replica to primary (`pg_ctl promote`)
4. **DNS Update**: Switch `DATABASE_URL` to new primary endpoint
5. **Validation**: Run smoke tests (order creation, product fetch, loyalty check)
6. **Post-incident**: Root cause analysis, update runbook, test restore
