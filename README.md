# IndexFlow SaaS

Production-ready baseline for a URL indexing SaaS with:
- `app`: Next.js dashboard
- `backend`: Express + Prisma + BullMQ API/worker

## What is implemented
- JWT auth (register/login/me/profile/password change)
- Credit-based campaign creation and URL queueing
- Background URL processing with retry handling
- Live dashboard analytics, campaigns, URLs, API keys, billing overview
- Admin users + system health endpoints/pages
- Strict request validation and centralized API error handling

## Local setup

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

### 2) Worker (separate terminal)
```bash
cd backend
npm run worker
```

### 3) Frontend
```bash
cd app
cp .env.example .env.local
npm install
npm run dev
```

App runs on `http://localhost:3000`, API on `http://localhost:4000`.

## Build and quality checks
```bash
cd backend && npm run typecheck && npm run build
cd app && npm run lint && npm run build
```

## Environment variables
- Backend: see `backend/.env.example`
- Frontend: see `app/.env.example`

## Production notes
- Run API and worker as separate services (`npm run start` for API, compiled worker process for queue consumer).
- Set strong secrets and rotate any leaked credentials before deployment.
- Configure `CORS_ORIGINS` to your production domain(s).
- Point `DATABASE_URL` and `REDIS_URL` to managed production services.
- Stripe checkout endpoint is stubbed (`501`) until live Stripe product pricing is configured.

## API quick list
- Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/change-password`
- Campaigns: `/campaigns`, `/campaigns/:id/status`, `/campaigns/:id`
- URLs: `/urls`, `/urls/:id/retry`, `/urls/retry-failed`
- API keys: `/api-keys`
- Billing: `/billing/overview`, `/billing/plans`
- Admin: `/admin/users`, `/admin/users/:id/active`, `/admin/system`
- Health: `/health`
