# 🚀 MEGA PROMPT — Link Indexing SaaS (OmegaIndexer-style)

You are a **senior full-stack SaaS architect and engineer**.
Your task is to design and build a complete production-ready SaaS application similar in concept to OmegaIndexer (a URL indexing acceleration platform).

Do NOT produce toy code. Think like you are building a real SaaS that can scale to thousands of users and millions of URLs.

---

# 🧠 PRODUCT DESCRIPTION

We are building a SaaS called:

> **“IndexFlow” (working name)**

It is a **URL indexing automation and discovery acceleration platform**.

Users upload URLs, and the system:

* queues them
* processes them in batches
* submits them through multiple indexing discovery methods
* tracks status
* retries failures
* shows analytics

IMPORTANT:
This is NOT guaranteed Google indexing. It is a **crawl discovery optimization system**.

---

# 🎯 CORE FEATURES

## 1. Authentication System

* Email/password login
* JWT authentication
* Password hashing (bcrypt)
* User roles: `user`, `admin`
* Session handling

---

## 2. SaaS Dashboard

* Clean modern UI (like Stripe / Vercel)
* Upload URLs (CSV + manual input)
* Create indexing campaigns
* View campaign status
* View URL-level status
* Credit balance system

---

## 3. Campaign System

Each campaign includes:

* name
* user_id
* list of URLs
* status: pending / processing / completed / paused
* scheduling rules (drip feed per day)
* created_at

---

## 4. URL Processing System (CORE ENGINE)

Each URL goes through lifecycle:

* queued
* processing
* submitted
* crawled (unknown confirmation)
* failed
* retried

You MUST design:

* queue system
* retry logic (max retries = 3)
* rate limiting
* batching system

---

## 5. Indexing Engine (Multi-channel submission system)

Implement modular “indexing strategies”:

### Strategy 1: Ping system

* simulate RSS/ping submission endpoints

### Strategy 2: Sitemap feeder system

* generate sitemap-like feeds

### Strategy 3: API-based submission layer

* mock Google Search Console API integration structure (do not assume real approval)

### Strategy 4: Buffer network system

* internal linking simulation pages (for crawl discovery)

All strategies must be:

* pluggable modules
* extensible architecture (Strategy Pattern)

---

## 6. Queue System

Use:

* Redis + BullMQ (Node.js) OR Celery (Python)

Must support:

* job scheduling
* retry
* concurrency control
* dead letter queue

---

## 7. Billing System

* Credit-based system
* 1 URL = 1 credit
* Stripe integration
* plans:

  * Starter
  * Pro
  * Agency

---

## 8. Admin Panel

* view users
* view system health
* monitor queue size
* manual retry jobs
* disable abusive users

---

## 9. API System (VERY IMPORTANT)

Provide REST API:

* POST /campaign
* POST /urls/upload
* GET /campaign/:id
* GET /status/:url
* POST /api-key/generate

API must support:

* API key authentication
* rate limiting per key

---

# 🏗️ TECH STACK (MANDATORY)

Frontend:

* Next.js (App Router)
* TailwindCSS
* ShadCN UI
* React Query

Backend:

* Node.js (NestJS preferred OR Express if simpler)
* OR FastAPI (Python allowed if better structured)

Database:

* PostgreSQL

Queue:

* Redis + BullMQ (or Celery if Python)

Storage:

* AWS S3 or local dev fallback

Auth:

* JWT + refresh tokens

---

# 🧱 DATABASE DESIGN

Design full schema:

Tables:

* users
* campaigns
* urls
* url_status_logs
* credits_wallet
* payments
* api_keys
* jobs_queue_logs

Include:

* indexes
* foreign keys
* timestamps
* soft deletes

---

# ⚙️ SYSTEM ARCHITECTURE

Provide:

1. High-level architecture diagram (text-based)
2. Data flow:
   User → Campaign → Queue → Worker → Indexing Engine → Status Update
3. Microservice boundaries (if needed)
4. Failure handling system

---

# 🧠 WORKER SYSTEM LOGIC

Workers must:

* pull jobs from queue
* apply indexing strategies
* log each attempt
* update DB status
* retry failed URLs
* respect rate limits

---

# 📊 ANALYTICS MODULE

Dashboard must show:

* total URLs submitted
* success rate
* failure rate
* processing speed
* campaign performance
* time-to-discovery estimate

---

# 🔐 SECURITY REQUIREMENTS

* prevent abuse/spam uploads
* rate limit API
* validate URLs
* sanitize inputs
* prevent SQL injection
* protect queue system

---

# 🎨 UI/UX REQUIREMENTS

* modern SaaS design (Stripe-like)
* dark mode
* responsive
* clean tables
* progress bars for campaigns
* real-time status updates (WebSockets preferred)

---

# 🚀 OUTPUT EXPECTATION FROM YOU (AI)

You MUST generate:

1. Full project folder structure
2. Backend code (production-level)
3. Frontend dashboard (Next.js)
4. Database schema (SQL or Prisma)
5. Queue system implementation
6. Worker system logic
7. API routes
8. Example env files
9. Deployment instructions (Docker preferred)
10. Scalability recommendations

---

# ⚠️ IMPORTANT CONSTRAINTS

* Do NOT oversimplify
* Do NOT give pseudo-code only
* Assume production deployment
* Use modular architecture
* Write clean, scalable code
* Think like a SaaS founder building for real revenue

---

#BONUS FEATURES (if possible)

* multi-user teams
* reseller API system
* webhook callbacks for URL status updates
* Chrome extension for URL submission
* bulk scraping/import tools
* AI-based “index likelihood scoring”

