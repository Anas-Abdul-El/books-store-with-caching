# books-store-with-caching

A books-store REST API built with **Express 5 + TypeScript + Prisma + Redis + BullMQ**, written to practise a
strictly layered architecture (`route → controller → service → repo`), Zod validation on every
request, JWT auth with an admin role, Redis caching with explicit invalidation on writes, and
background email processing with BullMQ queues.

Checkout is transactional: placing an order re-reads the cart inside a Prisma transaction, checks
the stock, writes the order with its items, decrements the books and empties the cart — all or
nothing. Emails (verification and password resets) are processed asynchronously via BullMQ workers.

---

## Stack

| Concern            | Choice                                                              |
| ------------------ | ------------------------------------------------------------------- |
| Runtime            | Node 26, pnpm 11                                                    |
| Framework          | Express 5                                                            |
| Language           | TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| ORM                | Prisma 7 with the `@prisma/adapter-pg` driver adapter (no Rust engine) |
| Database           | PostgreSQL 18                                                        |
| Cache              | Redis 7 (`node-redis`)                                               |
| Background Jobs    | BullMQ 6 (`bullmq`)                                                  |
| Validation         | Zod 4, one schema per route                                          |
| Auth               | `jsonwebtoken` (access / refresh / verification tokens), `bcrypt`     |
| Mail               | `nodemailer` (processed via background queue)                        |
| Security headers   | `helmet`                                                             |
| Dev runner         | `tsx watch`                                                          |
| Testing            | Node.js built-in test runner (`node:test`) with `tsx` loader          |

---

## Architecture

One request walks exactly this chain, and every layer has a single job:

```
HTTP request
   │
   ▼
routes/<entity>Router.ts     wires the route, no logic
   │   authHandler("public" | "private")      → 401 / 403
   │   validatorMiddleware(schema, location)  → 400, and writes the *parsed* data back
   │   catchAsync(controller.fn)              → forwards rejections to Express
   ▼
controllers/<entity>.controller.ts   req → service → res.   No business rules, no Prisma.
   ▼
services/<entity>.services.ts       business rules + Redis cache + AppError mapping + queue jobs.
   ▼
repo/<entity>.repo.ts               the only place that talks to Prisma.
   ▼
PostgreSQL
```

For emails: services enqueue jobs to a BullMQ queue; a dedicated worker processes them asynchronously using Nodemailer, so HTTP requests never block on SMTP I/O.

Rules the layers follow:

- **The client is never trusted for identity or money.** The owner of a cart/order is always
  `req.userId`, which `authHandler` takes from the access token, never from a param or a body.
  Prices and quantities are re-read from the database.
- **Repos throw nothing but Prisma errors.** Business failures come back as a result object and the
  service turns them into `AppError`s, so `404`s and `400`s are decided in one layer only.
- **Every exported function and every Zod schema carries JSDoc** (description, flow, `@param`,
  `@returns`, `@throws`), so the code is the documentation.
- **Background processing for I/O-heavy tasks.** Email sending (verification and password resets) is
  offloaded to BullMQ workers with retries, backoff, and automatic cleanup of completed/failed jobs.

### Project structure

```
src/
├── controllers/       one controller per entity, exports a default object
├── services/          caching + business rules + AppError + queueing jobs
├── repo/              Prisma only
├── routes/            one router per entity + index.ts mounting them under /api
├── validation/        Zod schemas + the inferred types (one file per entity)
├── middlewares/       authHandler, validatorMiddleware, errorHandler, notFound
├── utils/             AppError, catchAsync, token, hash, sort/filter/cache-key helpers
├── jobs/              BullMQ job definitions and queue setup (email jobs)
├── workers/           BullMQ worker implementations (email worker)
├── libs/              prisma client, redis client, nodemailer transporter
├── types/             express.d.ts (Request.userId augmentation), type augmentations
└── generated/prisma/  Prisma client output (generated, never edited)
prisma/schema.prisma   the data model
prisma7.config.ts      Prisma config (schema path, migrations path, datasource url)
compose.yaml           app + postgres + redis
```

---

## Getting started

### 1. Prerequisites

- Node 26+, pnpm 11
- A reachable PostgreSQL and Redis — either local, or via `docker compose up -d postgres redis`

### 2. Install

```bash
pnpm install
```

### 3. Environment

`.env` is git-ignored. Every variable the code reads:

| Variable                     | Used for                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| `PORT`                       | HTTP port (the code falls back to `3220`)                    |
| `DATABASE_URL`               | Prisma connection string, e.g. `postgresql://user:pass@host:5432/db` |
| `REDIS_URL`                  | e.g. `redis://localhost:6379`                                 |
| `ACCESS_TOKEN_SECRET`        | Signs and verifies access tokens (1 h)                        |
| `REFRESH_TOKEN_SECRET`       | Signs and verifies refresh tokens (7 d)                       |
| `VERIFICATION_TOKEN_SECRET`  | Signs and verifies email/password-reset tokens (1 h)          |
| `FRONTEND_URL`               | Base of the password-reset/verification links sent by mail    |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | SMTP configuration for Nodemailer |

`POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` are only read by `compose.yaml` to start
the database container.

### 4. Create the database

Schema changes have been made (cascades, indexes). Run migrations to create/update the schema:

```bash
pnpm exec prisma migrate dev --name init   # creates the tables/migrations
pnpm exec prisma generate                  # (re)generate the client into src/generated/prisma
```

### 5. Run

```bash
pnpm dev      # tsx watch src/index.ts (also starts the email worker)
pnpm build    # type-checks and emits to dist/
pnpm start    # node dist/src/index.js (also starts the email worker)
```

Or the whole stack:

```bash
docker compose up --build
```

### Scripts

| Script        | Does                                        |
| ------------- | ------------------------------------------- |
| `pnpm dev`    | watch mode on `src/index.ts`                |
| `pnpm build`  | type-checks and emits to `dist/`            |
| `pnpm start`  | runs the built output                       |
| `pnpm test`   | runs tests with Node's built-in test runner + `tsx` |
| `pnpm typecheck` | runs `tsc --noEmit`                        |

---

## Background Jobs (BullMQ)

Email sending is handled asynchronously via BullMQ to keep API responses fast and resilient to SMTP failures.

- **Queue**: `email` queue defined in `src/jobs/email.job.ts`
- **Worker**: Email worker in `src/workers/emailWorker.ts` (or `src/jobs/email.job.ts`), started automatically on app boot in `src/index.ts`
- **Retries**: Up to 5 attempts with exponential backoff (1s, 2s, 4s...)
- **Job cleanup**: Completed jobs removed after 1 hour (max 100), failed jobs removed after 24 hours (max 100)
- **Concurrency**: 2 concurrent email jobs

**Jobs enqueued:**
- Account verification emails (`POST /auth/sendVerificationCode`)
- Password reset emails (`POST /user/sendPasswordresetCode`)

The worker logs job completions/failures to stdout for observability.

---

## API

All routes are mounted under `/api`. Access levels:

- **public** — any authenticated user (a valid access token, any role)
- **admin** — `authHandler("private")`, the `role` claim must be `admin`
- **open** — no `authHandler` on the route

### Auth — `/api/auth`

| Method | Path                       | Access | Body / Notes                                     |
| ------ | -------------------------- | ------ | ------------------------------------------------ |
| POST   | `/auth/login`              | open   | `{ email, password }` → returns `{ accessToken, email, username }` and sets an httpOnly `refreshToken` cookie (7 d) |
| POST   | `/auth/register`           | open   | `{ firstName, lastName, email, password }`       |
| POST   | `/auth/refresh`            | open   | reads the `refreshToken` cookie → `{ accessToken }` |
| POST   | `/auth/logout`             | public | verifies the `refreshToken` cookie, clears it    |
| POST   | `/auth/sendVerificationCode` | open | `{ email }` (email queued via BullMQ)            |
| POST   | `/auth/verifyVerificationCode` | open | `{ token }`                                      |

### Users — `/api/user`

| Method | Path                                | Access | Params / Body                                        |
| ------ | ----------------------------------- | ------ | ---------------------------------------------------- |
| GET    | `/user/:id`                         | public | `:id` (uuid)                                         |
| GET    | `/user/users`                       | admin  | —                                                    |
| POST   | `/user/sendPasswordresetCode`       | admin  | `{ email }` (email queued via BullMQ)                 |
| POST   | `/user/verifyPasswordresetCode`     | admin  | `{ oldPassword, newPassword, token }`                 |

### Books — `/api/book`

| Method | Path           | Access | Params / Body                                                              |
| ------ | -------------- | ------ | -------------------------------------------------------------------------- |
| GET    | `/book/`       | open   | `?filter=&filterValue=&sort=&sortOrder=&limit=&authorId=&catagoryId=`        |
| GET    | `/book/:id`    | open   | `:id` (number)                                                              |
| POST   | `/book/`       | admin  | `{ title, price, releaseDate, description, stockCount, author, catagory }`  |
| PATCH  | `/book/:id`    | admin  | any subset of the fields above                                             |
| DELETE | `/book/:id`    | admin  | —                                                                          |

`catagory` / `catagoryId` keep their historical spelling: the query params are part of the public
API, so they are not renamed (the internal TypeScript variables are spelled `category`).

### Authors — `/api/author`

| Method | Path              | Access | Params / Body                             |
| ------ | ----------------- | ------ | ----------------------------------------- |
| GET    | `/author/:id`     | open   | `:id`                                     |
| GET    | `/author/authors` | open   | `?sort=&sortOrder=&limit=`                |
| POST   | `/author/`        | admin  | `{ name, description? }`                  |
| PATCH  | `/author/:id`     | admin  | any subset of the fields above            |
| DELETE | `/author/:id`     | admin  | —                                         |

### Categories — `/api/category`

| Method | Path              | Access | Params / Body                 |
| ------ | ----------------- | ------ | ----------------------------- |
| GET    | `/category/:id`   | open   | `:id`                         |
| GET    | `/category/`      | open   | `?sort=&sortOrder=&limit=`    |
| POST   | `/category/`      | admin  | `{ name, description? }`      |
| PATCH  | `/category/:id`   | admin  | any subset of the fields above |
| DELETE | `/category/:id`   | admin  | —                             |

### Cart — `/api/cart`, `/api/cartItems`

| Method | Path                        | Access | Body / Notes                                        |
| ------ | --------------------------- | ------ | --------------------------------------------------- |
| GET    | `/cart/`                    | public | the cart of `req.userId` with its items and books   |
| GET    | `/cartItems/`               | admin  | `?sort=&sortOrder=&limit=` (every cart item)        |
| POST   | `/cartItems/`               | public | `{ bookId, quantity? }` — creates/merges into cart, checks stock |
| PATCH  | `/cartItems/:cartItemId`    | public | `{ quantity }`, ownership-scoped, 400 over the stock |
| DELETE | `/cartItems/:cartItemId`    | public | ownership-scoped                                    |

Updating a cart item re-reads the price from the book, so a client can never change what a book
costs, and a cart item belonging to somebody else answers `404` (not `403`), so ids cannot be
probed.

### Orders — `/api/orders`

| Method | Path                  | Access | Body / Notes                                          |
| ------ | --------------------- | ------ | ----------------------------------------------------- |
| GET    | `/orders/`            | admin  | `?sort=&sortOrder=&limit=`                            |
| POST   | `/orders/`            | public | `{ address }` — everything else comes from the cart   |
| PATCH  | `/orders/:orderId`    | admin  | `{ address }` (quantity and price are derived)        |
| DELETE | `/orders/:orderId`    | admin  | deletes the order and its items                       |

Listings that match nothing answer `204 Empty` (an `AppError`, not an empty array).

---

## Caching

Every read-heavy service checks Redis before PostgreSQL, and every write drops the keys it
invalidated. Keys are built by a small helper per entity, so equal queries always share one entry.

| Entity      | Key                                                        | Storage | TTL     |
| ----------- | ---------------------------------------------------------- | ------- | ------- |
| Book (one)  | hash `books`, field `book:<id>`                            | hash    | 90 min  |
| Books (all) | `books:filter=…:sort=…:limit=…`                           | string  | 90 min  |
| Author (one)| hash `authors`, field `author:<id>`                        | hash    | 90 min  |
| Authors (all)| `authors:sort=…:sortOrder=…:limit=…`                      | string  | 90 min  |
| Category (one) | hash `categories`, field `category:<id>`                 | hash    | 90 min  |
| Categories (all) | `categories:sort=…:sortOrder=…:limit=…`               | string  | 90 min  |
| User (one)  | hash `users`, field `user:<id>`                            | hash    | 60 min  |
| Users (all) | list `usersId` + the `users` hash                         | list    | 60 min  |
| Cart        | `cart:<userId>`                                            | string  | 90 min  |
| Cart items  | `cartItems:sort=…:sortOrder=…:limit=…`                    | string  | 90 min  |
| Orders      | `orders:sort=…:sortOrder=…:limit=…`                        | string  | 90 min  |

Invalidation uses a pattern scan (`clearCacheByPattern`) or an exact drop (`clearCacheByKey`):

| Write                       | Drops                                          |
| --------------------------- | ---------------------------------------------- |
| cart item add/update/delete | `cartItems:*` + `cart:<userId>`                |
| order create                | `orders:*` + `cartItems:*` + `cart:<userId>`   |
| order update/delete         | `orders:*`                                     |

Helpers: `src/utils/clearCache.ts`, `src/utils/*CacheKey.ts`.

---

## Auth and roles

- `authHandler("public" | "private")` is a factory returning a middleware. It reads
  `req.headers.authorization`, verifies the token with the **access** secret, puts `userId` and
  `role` on the request, and answers `401` (missing/invalid token) or `403` (role not allowed).
- `role` is a Prisma `enum Role { user admin }` on `User`, defaulting to `user`.
- Both the access and the refresh token carry `{ userId, role }`, and `authRepo.getUserById`
  selects the role, so a refreshed access token keeps the right role.
- Passwords are hashed with bcrypt (`src/utils/hash.ts`); the three token kinds are signed with
  three different secrets so a refresh token cannot be replayed as an access token.
- `validatorMiddleware` works correctly with Express 5 (req.query is a getter; the middleware
  uses `Object.defineProperty` to safely inject parsed values).

---

## The checkout transaction

`POST /api/orders` takes only the delivery address. Everything else is derived inside one
`prisma.$transaction` in `src/repo/order.repo.ts`:

1. Load the cart of `req.userId` with its items and their books.
2. Fail with `cart_not_found` (404) when the user has no cart.
3. Fail with `empty_cart` (400) when the cart holds no items.
4. Fail with `out_of_stock` (400) when any line asks for more than the stock of its book — nothing
   is written, so a partial order can never exist.
5. Create the order, with the totals computed from the **current** book prices (not the prices
   cached in the cart).
6. Create one `OrderItem` per cart item.
7. Decrement `Book.stockCount` for every book.
8. Delete the cart items and reset `Cart.quantity` / `Cart.price` to `0`.

The repository returns a result object (`cart_not_found` / `empty_cart` / `out_of_stock` / `order`)
rather than throwing, so the service stays the only place that decides an HTTP status.

`Order.userId` and `OrderItem.bookId` are plain indexes (not `@unique`), otherwise a user could
place one order ever and a book could be sold once ever. `CartItem.bookId` is indexed (not globally
unique), allowing multiple users to have the same book in their carts.

---

## Data model

`User` (with `role`, `cart`, `orders`) · `Session` · `Book` (`stockCount`, author, category) ·
`Author` · `Category` · `Cart` (one per user) · `CartItem` · `Order` · `OrderItem`.

OnDelete cascades: `CartItem.book`, `OrderItem.book`, and user relations cascade appropriately so
deletions don't get blocked by foreign keys while preserving business invariants.

```bash
pnpm exec prisma studio   # browse the data
```

---

## Testing

The project uses Node's built-in test runner with the `tsx` loader (zero extra dependencies):

```bash
pnpm test        # runs all *.test.ts files
pnpm typecheck   # runs tsc --noEmit
```

Tests cover utilities (cache keys, filters, sorts, token signing/verification), validation schemas
(including query param coercion for Express 5), middlewares (authHandler, validatorMiddleware,
errorHandler, notFound). All tests pass in isolation.

**Note:** `tsc --noEmit` does not validate Prisma `data` keys in the generated client's input types
for this generated setup. Pay extra attention to field names in Prisma update/create calls.

---

## Notes

- **Cookies parser**: The `cookies-parser` dependency currently present is a different package; the
  Express `cookie-parser` middleware is not registered (deferred by design). Endpoints that read
  `req.cookies` (e.g. `/auth/refresh`, `/auth/logout`) expect the proper middleware if enabled.
- **Environment**: `.env` may point to Docker hostnames (e.g. `postgres`, `redis`). Ensure Redis is
  reachable for BullMQ queues/workers and caching; without Redis, background email jobs will wait
  for connection and cached reads will fall back to the database.
- **Migrations**: Schema changes were made in this iteration; run `prisma migrate dev` before starting
  the app against a fresh database.