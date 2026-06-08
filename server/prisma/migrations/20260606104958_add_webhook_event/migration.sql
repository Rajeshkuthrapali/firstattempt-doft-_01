-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_idempotency_key_key" ON "webhook_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "webhook_events_gateway_idx" ON "webhook_events"("gateway");

-- CreateIndex
CREATE INDEX "webhook_events_processed_at_idx" ON "webhook_events"("processed_at");
