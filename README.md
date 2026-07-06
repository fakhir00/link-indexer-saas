# IndexFlow SaaS

Closed-beta URL discovery automation SaaS with:

- `app`: Next.js dashboard and landing page
- `backend`: Express + Prisma + BullMQ API and worker
- Admin-provisioned users, credit allocation, campaigns, URL queues, API keys, analytics and system health

IndexFlow optimizes crawl discovery. It does not guarantee search-engine indexing.

## Local Setup

### 1. Backend API

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

### 2. Worker

Run in a second terminal:

```bash
cd backend
npm run worker
```

### 3. Frontend

```bash
cd app
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3000`
API: `http://localhost:4000`

## First Admin

Public signup is disabled by default. Create or reset the first admin with:

```bash
cd backend
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='change-me-strong' npm run seed:admin
```

Admins can create users and assign credits from `/dashboard/admin/users`.

## Indexing Providers

Local development can use deterministic dry-run processing if you explicitly enable it:

```env
INDEXING_DRY_RUN=true
```

For live processing, leave dry-run disabled and configure one or more providers:

```env
INDEXING_DRY_RUN=false
PING_ENDPOINTS="https://provider.example/ping?url={url}"
INDEXNOW_KEY="..."
INDEXNOW_HOST="example.com"
INDEXNOW_KEY_LOCATION="https://example.com/<key>.txt"
```

With `INDEXING_DRY_RUN=false`, campaign creation and retries require a configured live provider. For IndexNow, the submitted URL host must match `INDEXNOW_HOST`, and the key must be hosted at `https://<host>/<key>.txt` unless `INDEXNOW_KEY_LOCATION` points somewhere else.

## API Keys

Users can create API keys in the dashboard. Campaign, URL and analytics endpoints accept:

```http
X-API-Key: if_live_sk_...
```

or:

```http
Authorization: Bearer if_live_sk_...
```

Account, admin and settings endpoints require JWT login.

## Build And Checks

```bash
cd backend && npm run typecheck && npm run build
cd app && npm run lint && npm run build
```

## Production Notes

- Run API and worker as separate services.
- Set strong `JWT_SECRET`, database and Redis credentials.
- Keep `ALLOW_PUBLIC_SIGNUPS=false` for closed-beta deployments.
- Configure `CORS_ORIGINS` to the production app origin.
- Use managed PostgreSQL and Redis.
- Run `npm run prisma:deploy` during backend release.


Deploying to Vercel
