# Performance & Scalability Report (P3)

## Concurrency Validation (200+ VUs)
We upgraded our `k6` stress testing scripts to validate concurrent checkout flow performance with 200+ Virtual Users.
- **Ramp-up:** 1.5 minutes to 200 VUs
- **Sustained:** 1 minute at 200 VUs
- **Thresholds Verified:** `p95 < 800ms`, `error_rate < 0.5%`

To run locally against your API:
```bash
docker run --rm -i --network=host grafana/k6 run - < scripts/concurrent-checkout-load-test.js
```

## Database Optimization
High-traffic endpoints have been secured against N+1 bottlenecks and slow scans:
1. **Product Filters:** Added `@@index([status])` and `@@index([scentFamily])` in `prisma/schema.prisma` for fast catalog retrieval.
2. **Order Lookups:** Added `@@index([customerId])` and `@@index([createdAt])` to speed up historical queries and reporting dashboard views.
3. **Cart/Checkout Validation:** Added `@@index([productId])` in OrderItems for real-time stock/price enforcement.

## CDN Edge Caching Strategies
For a globally scalable luxury catalog, we rely heavily on Edge CDN routing:
- **Sanity CMS Content:** Configured `sanityClient` with `useCdn: true` for the blog to ensure edge caching on rich text and assets.
- **Vite Static Assets:** The JS/CSS bundles are structurally compiled with immutable hash names for indefinite CDN edge caching.
- **Image Optimization:** All UGC or managed photography via Cloudinary uses auto-formatting (`f_auto`, `q_auto`) ensuring the lightest possible payloads at the edge without manual re-compression.

## Next Steps for P4
- Implementation of GraphQL layer for frontend payload optimizations
- Regional read-replicas for the Prisma sqlite/postgreSQL backbone if scale moves beyond single-tenant usage.
