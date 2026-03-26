# PostgreSQL Migration Plan

## Context

The current Lumière platform uses **SQLite** via Prisma for development speed.
For production scalability — concurrent connections, row-level locking, and
full-text search — we plan to migrate to **PostgreSQL**.

## Migration Steps

### Phase 1: Schema Translation

1. Update `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`.
2. Update connection string in `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/lumiere?schema=public"
   ```
3. Run `npx prisma migrate dev --name init-postgres` to generate the PostgreSQL migration SQL.
4. Validate all `@@index` directives translate correctly (they do natively in PG).

### Phase 2: Data Migration

1. Export SQLite data via `sqlite3 dev.db .dump > backup.sql`.
2. Transform INSERT statements for PG syntax (datetime format, boolean literals).
3. Import to PG via `psql -d lumiere -f backup-pg.sql`.
4. Validate row counts match across all tables.

### Phase 3: Connection Pooling

1. Deploy **PgBouncer** or use Prisma Accelerate for connection pooling.
2. Set `connection_limit` in Prisma datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL") // For migrations
   }
   ```
3. Target: sustain 200+ concurrent read connections with sub-10ms p95 query latency.

### Phase 4: Production Cutover

1. Deploy PG instance on managed provider (Supabase / Neon / Railway).
2. Run parallel reads against both SQLite and PG for 24h canary validation.
3. Switch `DATABASE_URL` to PG, remove SQLite dev.db from production.
4. Monitor Prisma query metrics via Admin Logs dashboard.

## Rollback Strategy

- Keep SQLite backup for 7 days post-migration.
- If PG issues arise, revert `DATABASE_URL` to SQLite connection string.
- Prisma schema changes are backwards-compatible for this migration.
