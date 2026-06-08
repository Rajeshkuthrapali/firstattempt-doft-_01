# Lumière Candles 🕯️

A modern e-commerce web application for premium candles. Features a **Vite + React SPA** frontend and an **Express + Prisma** backend with Razorpay (primary) and Stripe (secondary) payment processing.

---

## Architecture

This project follows a **modular monolith** structure with two main directories:

```
Lumiere/
├── frontend/   # Vite + React SPA (this directory)
└── server/     # Express + Prisma API
```

The frontend is a single-page application that communicates with the backend via REST APIs. The backend handles authentication, order management, payment processing, and marketing integration.

---

## Tech Stack

### Frontend

| Category      | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | React 19, TypeScript                    |
| Build Tool    | Vite 6                                  |
| Styling       | Tailwind CSS v4, shadcn/ui              |
| Animation     | GSAP 3, @gsap/react                     |
| State Mgmt    | Zustand 5                               |
| Routing       | React Router v7                         |
| HTTP Client   | Custom `fetch`-based API client         |
| Icons         | Lucide React                            |

### Backend

| Category      | Technology                              |
| ------------- | --------------------------------------- |
| Runtime       | Node.js 22+                             |
| Framework     | Express 5, TypeScript                   |
| ORM           | Prisma 6 + PostgreSQL                   |
| Auth          | JWT (jsonwebtoken) + bcrypt, refresh token rotation |
| Validation    | Zod 3                                   |
| Payments      | Razorpay (primary), Stripe (secondary)  |
| Security      | Helmet, CSP, csrf-csrf, express-rate-limit |

---

## Setup

### Prerequisites

- **Node.js** 22+
- **PostgreSQL** 16+ (or Neon serverless Postgres)
- **npm** 10+

### Clone & Install

```bash
git clone <repo-url>
cd Lumiere

# Frontend dependencies
npm install
```

### Frontend

```bash
npm run dev
# Starts at http://localhost:5173
```

### Backend

Open a second terminal:

```bash
cd server
cp .env.example .env   # Edit with your values
npm install
npx prisma migrate dev  # Create database tables
npx tsx prisma/seed.ts   # Seed with test data
npm run dev              # Starts at http://localhost:4000
```

---

## Environment Variables

Copy `.env.example` to `.env` in both the root and `server/` directories.

### Root (Frontend)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Optional | Backend API base URL (default: `http://localhost:4000/api`) |
| `VITE_RAZORPAY_KEY_ID` | Required | Razorpay publishable key for client-side checkout |

### Server

See `server/.env.example` for all required variables.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 32+ character secret for JWT signing |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay API secret |
| `STRIPE_SECRET_KEY` | Optional | Stripe API key |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS |

---

## Project Structure

```
Lumiere/
├── public/              # Static assets
├── src/
│   ├── __tests__/       # Unit tests (Vitest)
│   ├── assets/          # Images, fonts
│   ├── components/      # Reusable UI components
│   │   └── ui/          # shadcn/ui components
│   ├── data/            # Static data / content
│   ├── design/          # Design tokens, brand assets
│   ├── lib/
│   │   ├── api/         # API client, request helpers
│   │   └── store/       # Zustand stores (auth, cart)
│   ├── pages/           # Route-level page components
│   └── stores/          # Legacy stores (kept for compatibility)
├── server/
│   ├── prisma/          # Schema, migrations, seed
│   ├── src/
│   │   ├── config/      # Environment config
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── routes/      # Express route definitions
│   │   ├── services/    # Business logic (auth, payments, email)
│   │   └── types/       # Zod schemas, TypeScript types
│   └── tests/           # Backend tests
├── e2e/                 # Playwright E2E tests
├── scripts/             # Load test scripts (k6)
└── .github/workflows/   # CI pipeline
```

---

## Available Scripts

### Frontend (root)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on :5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint on `src/` |
| `npm test` | Vitest (watch mode) |
| `npm run test:run` | Vitest (single run) |
| `npm run test:e2e` | Playwright E2E tests |

### Backend (server/)

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload on :4000 |
| `npm run build` | TypeScript compile |
| `npm start` | Start production server |
| `npm test` | Run tests (Vitest) |
| `npm run lint` | ESLint on `src/` |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:generate` | Regenerate Prisma client |

---

## Database

The project uses **PostgreSQL** with Prisma as the ORM.

```bash
cd server

# Create and apply migrations
npx prisma migrate dev

# Seed with sample data
npx tsx prisma/seed.ts

# Browse data
npx prisma studio

# Production migration
npx prisma migrate deploy
```

### Models

- **User** — Customer and admin accounts
- **Product** — Candle products with pricing, descriptions, images
- **Variant** — Product variants (size, scent, etc.)
- **Collection** — Product groupings (seasonal, signature, etc.)
- **Category** — Product categories
- **Cart** / **CartItem** — Shopping cart
- **Wishlist** / **WishlistItem** — User wishlists
- **Order** — Customer orders with status state machine
- **Payment** — Payment records with gateway tracking
- **PromoCode** — Discount codes with usage limits
- **RefreshToken** — JWT refresh token rotation
- **WebhookEvent** — Idempotent webhook event tracking

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (revoke refresh token) |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Get order |
| POST | `/api/payments/initiate` | Initiate payment |
| POST | `/api/payments/verify` | Verify payment signature |
| POST | `/api/payments/razorpay/create-order` | Create Razorpay order |
| POST | `/api/payments/webhooks/razorpay` | Razorpay webhook |
| POST | `/api/payments/webhooks/stripe` | Stripe webhook |
| POST | `/api/payments/admin/refund` | Admin refund (Stripe) |
| POST | `/api/marketing/track` | Track marketing event |
| POST | `/api/marketing/send-email` | Send transactional email |

---

## Testing

### Unit Tests (Vitest)

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

Covers: components, stores, cart logic.

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Critical paths: navigation, cart flow, checkout, accessibility.

### Load Tests (k6 via Docker)

```bash
# Storefront load test
docker run --rm -i grafana/k6 run - \
  -e BASE_URL=http://host.docker.internal:5173 \
  < scripts/storefront-load-test.js

# Checkout flow load test
docker run --rm -i grafana/k6 run - \
  -e BASE_URL=http://host.docker.internal:4000/api \
  < scripts/checkout-load-test.js
```

---

## CI Pipeline

The `.github/workflows/ci.yml` runs on push to `main` and `feature/p1-enhancements`:

1. **Unit Tests** — Lint + Vitest
2. **E2E Tests** — Playwright (Chromium + WebKit)
3. **Validate Artifacts** — Parse test reports, fail on failures
4. **Build** — Vite production build
5. **Lighthouse** — Performance audit (all categories ≥ 90)
6. **Load Tests** — Docker k6 storefront + checkout
7. **Deploy Staging** — Vercel preview (on `main` push)
8. **Deploy Production** — Vercel production (on `v*` tag)

---

## Contributing

1. Branch from `main` using the pattern `feature/your-feature-name`.
2. Make changes, write/update tests, ensure lint passes.
3. Run `npm run test:run` and `npm run test:e2e` to verify.
4. Submit a pull request against `main`.

### Code Style

- TypeScript strict mode — avoid `any` where possible
- Components use functional + hooks patterns
- Backend follows layered architecture: routes → controllers → services
- Imports ordered: built-in → external → internal
- Prettier + ESLint run on commit via lint-staged
