# DOFT Candles — Payment Server

Express + Prisma backend for the Lumière Candles e-commerce application.

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Express 5 + TypeScript
- **ORM**: Prisma 6 + PostgreSQL
- **Payments**: Razorpay, Stripe
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Security**: Helmet, csrf-csrf, express-rate-limit

## Getting Started

```bash
cp .env.example .env   # Configure your environment
npm install
npx prisma migrate dev  # Create database tables
npx tsx prisma/seed.ts   # Seed with test data
npm run dev              # Start dev server on :4000
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | 32+ character secret for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `STRIPE_SECRET_KEY` | Stripe API key (optional) |
| `FRONTEND_URL` | Frontend origin for CORS |

## API Endpoints

- `GET  /api/health` — Health check
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout (revoke refresh token)
- `GET  /api/auth/me` — Current user info
- `POST /api/orders` — Create order
- `GET  /api/orders` — List orders
- `GET  /api/orders/:id` — Get order
- `POST /api/payments/initiate` — Initiate payment
- `POST /api/payments/verify` — Verify payment
- `POST /api/payments/razorpay/create-order` — Create Razorpay order
- `POST /api/payments/webhooks/razorpay` — Razorpay webhook
- `POST /api/payments/webhooks/stripe` — Stripe webhook
- `POST /api/payments/admin/refund` — Admin refund (Stripe)
- `POST /api/marketing/track` — Track marketing event
- `POST /api/marketing/send-email` — Send transactional email

## Database

- Run migrations: `npx prisma migrate dev`
- Seed data: `npx tsx prisma/seed.ts`
- Browse data: `npx prisma studio`
- Production: `npx prisma migrate deploy`

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | TypeScript compile |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database |
