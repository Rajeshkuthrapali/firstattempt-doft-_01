-- AlterTable: Add unique constraint on (promo_id, user_id) to prevent duplicate promo usage per user
CREATE UNIQUE INDEX "orders_promo_id_user_id_key" ON "orders"("promo_id", "user_id");

