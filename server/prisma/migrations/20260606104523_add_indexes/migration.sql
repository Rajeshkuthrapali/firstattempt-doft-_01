-- CreateIndex
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cart_items_variant_id_idx" ON "cart_items"("variant_id");

-- CreateIndex
CREATE INDEX "orders_promo_id_idx" ON "orders"("promo_id");

-- CreateIndex
CREATE INDEX "variants_product_id_idx" ON "variants"("product_id");
