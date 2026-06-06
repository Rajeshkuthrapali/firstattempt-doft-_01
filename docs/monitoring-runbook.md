# Monitoring Runbook & DR Drills (P11 — v3.0.0)

## Monitoring Stack

| Tool | Purpose | Alert Channel |
| --- | --- | --- |
| Sentry | Error tracking + performance | PagerDuty → Slack #incidents |
| Better Uptime | Endpoint health polling (60s) | SMS + Slack #ops |
| Grafana Cloud | DB metrics, k6 dashboards | Slack #performance |
| GA4 | Conversion and revenue | Weekly email digest |
| PgAdmin / pgBadger | Slow query analysis | Manual review |

## Alert Thresholds

```yaml
# alerts.yml
alerts:
  - name: api_error_rate
    condition: error_rate_5m > 1%
    severity: P1
    action: page_on_call

  - name: p95_latency
    condition: p95_ms > 800
    severity: P2
    action: slack_notify

  - name: db_replication_lag
    condition: lag_seconds > 30
    severity: P1
    action: page_on_call

  - name: db_connections
    condition: pool_utilization > 90%
    severity: P2
    action: slack_notify

  - name: sentry_new_fatal
    condition: fatal_event_count_1h > 0
    severity: P0
    action: page_on_call

  - name: uptime_check
    condition: status != 200
    severity: P0
    action: page_immediately
```

## SLO Targets (v3.0.0)

| Metric | Target | Measurement window |
| --- | --- | --- |
| Availability | 99.9% (≤ 8.7h downtime/year) | Rolling 30 days |
| API p95 latency | < 800ms | Rolling 24 hours |
| Checkout error rate | < 0.5% | Rolling 1 hour |
| DB replication lag | < 5 seconds | Real-time |
| Checkout completion rate | > 68% | Weekly |

---

## Disaster Recovery Drills

### DR Drill Schedule

| Drill Type | Frequency | Owner | Last Run | Next Due |
| --- | --- | --- | --- | --- |
| DB failover (replica promotion) | Monthly | DevOps | TBD | Month 1 |
| PITR restore to 1h ago | Monthly | DevOps | TBD | Month 1 |
| Full region failover simulation | Quarterly | Engineering | TBD | Q2 |
| Payment gateway fallback test | Monthly | Engineering | TBD | Month 1 |
| Backup restore verification | Weekly | Automated | Ongoing | Ongoing |

### Monthly DB Failover Drill

```bash
#!/bin/bash
# scripts/dr-drill-failover.sh

echo "[DR Drill] Starting DB failover simulation"
START=$(date +%s)

# 1. Stop writes to primary (simulate failure)
psql -h "$PRIMARY_HOST" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename != 'postgres';"

# 2. Promote replica
psql -h "$REPLICA_HOST" -c "SELECT pg_promote();"

# 3. Verify new primary accepts writes
psql -h "$REPLICA_HOST" -c "INSERT INTO drill_log VALUES ('failover_test', NOW());"

# 4. Measure RTO
END=$(date +%s)
RTO=$((END - START))
echo "[DR Drill] Failover completed in ${RTO}s — Target RTO: 120s"

# 5. Log result
if [ $RTO -le 120 ]; then
  echo "✅ RTO target met"
else
  echo "❌ RTO target missed — investigate replica setup"
fi
```

### PITR Restore Drill

```bash
#!/bin/bash
# scripts/dr-drill-pitr.sh

TARGET_TIME=$(date -u -d '1 hour ago' '+%Y-%m-%d %H:%M:%S %Z')
RESTORE_HOST="restore-test.ap-south-1.rds.amazonaws.com"

echo "[PITR Drill] Restoring to: $TARGET_TIME"

pg_restore \
  --host="$RESTORE_HOST" \
  --target-time="$TARGET_TIME" \
  --target-action=pause

# Validate record counts match expected state
ORDER_COUNT=$(psql -h "$RESTORE_HOST" -c "SELECT COUNT(*) FROM \"Order\";" -t | xargs)
echo "[PITR Drill] Order count at $TARGET_TIME: $ORDER_COUNT"

# Verify data integrity
psql -h "$RESTORE_HOST" -c "SELECT pg_size_pretty(pg_database_size('lumiere'));"
echo "✅ PITR drill completed successfully"
```

### Payment Gateway Fallback Test

```bash
# Test Stripe → Razorpay fallback (India)
curl -X POST https://staging.lumiere.in/api/payments/test \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR", "forceFailStripe": true}'

# Expected: Order completes via Razorpay fallback
# Verify: Sentry shows Stripe error + successful Razorpay capture
```

### DR Drill Scorecard Template

```markdown
## DR Drill Report — [Date]

**Drill Type:** [Failover / PITR / Region / Payment]
**Duration:** [minutes]
**RTO Achieved:** [seconds] (Target: 120s)
**RPO Achieved:** [seconds] (Target: 60s)
**Issues Found:**
- [ ] None / [describe]
**Actions:**
- [ ] None / [ticket ID]
**Sign-off:** [Engineer] [Date]
```

---

## Runbook: P0 Incident

```
1. PagerDuty pages on-call (< 5 min)
2. Acknowledge in PagerDuty, join #incidents Slack
3. Assess: is it checkout, API, DB, or CSP?
4. Immediate mitigation:
   - Checkout: enable maintenance page via Cloudflare Worker
   - API: scale Vercel function instances
   - DB: promote replica (dr-drill-failover.sh)
5. Post fix: disable maintenance mode, verify metrics normal
6. Write post-mortem within 48h (5 WHYs, timeline, actions)
```
