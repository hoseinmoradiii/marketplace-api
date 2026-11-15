# Marketplace API

A marketplace API built with **NestJS 12**, **TypeORM + PostgreSQL**, **Redis**, and **JWT auth via mobile OTP**.

## Features

- **OTP authentication** — mobile number + 6-digit OTP (HMAC-hashed, stored in Redis with TTL, attempt limits, and resend cooldown). Access + refresh JWT pair.
- **Users** — profile lookup, full-name update, mobile change (triggers re-verification OTP), account deletion.
- **Products** — create, browse active feed, list own products (paginated, status filter), mark sold, cancel.
- **Offers** — buyers offer on active products (amount ≥ price), sellers accept/reject, buyers withdraw. Accepting reserves the product and auto-rejects competing pending offers — all in one DB transaction with row locks.
- **Swagger UI** — auto-generated docs at `/swagger` (disabled when `NODE_ENV=production`).

## Tech stack

NestJS · TypeScript (ESM) · TypeORM · PostgreSQL · Redis (ioredis) · Passport JWT · class-validator · Swagger · Docker Compose · Vitest

## Project structure

```
src/
├── main.ts                     # bootstrap: helmet, validation pipe, filters, swagger (non-prod)
├── app.module.ts
├── data-source.ts              # TypeORM CLI data source (migrations)
├── configs/                    # typeorm, swagger config
├── common/                     # core entity, outbox entity, logger, filters, enums
└── modules/
    ├── auth/                   # OTP send/verify, token service, JWT strategies & guards, dtos
    ├── user/                   # profile endpoints, UserEntity, repository
    ├── redis/                  # Redis module/service
    ├── product/                # ProductEntity, repository, service, controller, dtos, enums
    └── offer/                  # OfferEntity, repository, service, controller, dtos, enums
```

## Getting started

### Prerequisites

- Node.js 22+
- PostgreSQL and Redis running locally (or use Docker Compose — see below)

### Environment

```bash
cp .env.example .env
```

Fill in `DB_*`, `REDIS_*`, `PORT`, `NODE_ENV`, and generate secrets:

```bash
openssl rand -hex 32   # use for ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, OTP_SECRET
```

### Install & run

```bash
npm install
npm run start:dev
```

Swagger UI: `http://localhost:<PORT>/swagger`

### Docker (full stack)

```bash
docker compose up -d --build
```

Starts `app` + `postgres` + `redis`. Compose overrides `DB_HOST=db`, `REDIS_HOST=redis`, and `NODE_ENV` defaults to `development`. Host ports: app `3003`, db `5433`, redis `6380` (chosen to avoid clashes with other local services).

## Tests

```bash
npm run test          # unit tests (vitest)
npm run test:e2e      # e2e tests
npm run lint          # oxlint
npm run build         # production build -> dist/
npm run start:prod    # node dist/main
```

## Database migrations (production)

`NODE_ENV=production` disables `synchronize`, so schema changes must go through migrations:

```bash
npm run build
npm run migration:generate -- -n AddSomething   # generates src/migrations/*.ts
npm run migration:run                            # applies migrations (uses dist/data-source.js)
npm run migration:revert
```

## API overview

All endpoints require `Authorization: Bearer <accessToken>` unless noted. In non-production environments the OTP is returned in the response body (until an SMS provider is integrated).

### Auth — `/auth`

| Method | Path                        | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| POST   | `/auth/send-otp`            | Send login OTP to a mobile number (60s cooldown) |
| POST   | `/auth/verify-otp`          | Verify OTP → `{ accessToken, refreshToken }`     |
| POST   | `/auth/resend-access-token` | Exchange refresh token for a new access token    |
| POST   | `/auth/resend-otp`          | Resend OTP                                       |
| POST   | `/auth/logout`              | Invalidate stored token hashes (access token)    |

### User — `/user` (refresh-token guarded)

| Method | Path                  | Description                                                |
| ------ | --------------------- | ---------------------------------------------------------- |
| GET    | `/user/whoAmI`        | Current user profile (tokens never exposed)                |
| PATCH  | `/user/full-name`     | Update full name                                           |
| POST   | `/user/change-mobile` | Change mobile → sets `mobileVerified=false`, sends new OTP |
| DELETE | `/user`               | Soft-delete account                                        |

### Products — `/products` (access-token guarded)

| Method | Path                   | Description                                             |
| ------ | ---------------------- | ------------------------------------------------------- |
| POST   | `/products`            | Create product `{ title, description, price }`          |
| GET    | `/products`            | Browse all ACTIVE products (paginated: `page`, `limit`) |
| GET    | `/products/my`         | Own products, paginated + optional `status` filter      |
| GET    | `/products/my/active`  | Own active products (`take`, `skip`)                    |
| PATCH  | `/products/:id/sell`   | Mark own product SOLD                                   |
| PATCH  | `/products/:id/cancel` | Cancel own product                                      |

### Offers — `/offers` (access-token guarded)

| Method | Path                         | Description                                                                           |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| POST   | `/offers`                    | Send offer `{ productId, amount }` — product must be ACTIVE, amount ≥ price           |
| POST   | `/offers/:id/accept`         | Seller accepts → offer ACCEPTED, product RESERVED, other pending offers auto-REJECTED |
| POST   | `/offers/:id/reject`         | Seller rejects a pending offer                                                        |
| POST   | `/offers/:id/withdraw`       | Buyer withdraws own pending offer                                                     |
| GET    | `/offers/my`                 | Offers sent by current user — filter by `status`, `sellerId`, paginated               |
| GET    | `/offers/product/:productId` | Offers on own product — filter by `status`, paginated                                 |

## Flows

### Authentication

```
client                          api                              redis/db
  │  POST /auth/send-otp           │                                 │
  │  { mobile }                    │── store HMAC(otp), TTL 300s ───▶│
  │◀── { mobile, otp* } ───────────│   (*otp only outside prod)      │
  │  POST /auth/verify-otp         │                                 │
  │  { mobile, submittedOtp }      │── verify hash, max 5 attempts ─▶│
  │◀── { accessToken, refreshToken }│                                │
  │                                │── store SHA256(token) hashes ──▶│ users
```

Access tokens guard product/offer endpoints; refresh tokens guard user endpoints and token renewal. Logout clears the stored hashes, invalidating both.

### Product lifecycle

```
create ──▶ ACTIVE ──offer accepted──▶ RESERVED ──sell──▶ SOLD
   │           │                            │
   └──cancel──▶ CANCELLED                   └── (reserved products can't be cancelled)
```

- Only `ACTIVE` products accept offers and appear in the public feed.
- `sell`/`cancel` use atomic conditional updates — a concurrent status change returns `400 product status changed, please retry` instead of corrupting state.

### Offer lifecycle

```
            createOffer (buyer, ACTIVE product, amount >= price)
                              │
                            PENDING ──┬── seller accept ──▶ ACCEPTED (product → RESERVED,
                              │       │                    other pending offers → REJECTED)
                              ├── seller reject ──▶ REJECTED
                              └── buyer withdraw ──▶ WITHDRAWN
```

- One PENDING offer per buyer per product (enforced by a partial unique index + pre-check → `409`).
- `accept` runs in a transaction with `SELECT ... FOR UPDATE` locks on the offer and product rows, so two sellers/buyers can't race the same offer or product.
- Status transitions are atomic conditional updates (`UPDATE ... WHERE status='PENDING'`).

## Environment notes

| Variable                                       | Notes                                                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                     | `development` enables TypeORM `synchronize` + Swagger + OTP-in-response. `production` disables all three. |
| `OTP_SECRET`                                   | HMAC key for OTP hashing — required                                                                       |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT signing secrets — required, keep distinct                                                             |
| `DB_*` / `REDIS_*`                             | Connection settings                                                                                       |

## License

UNLICENSED — internship project.
