<div align="center">

# 🧠 CompIntel — Compensation Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth.js-v5-purple?style=for-the-badge&logo=auth0&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

<p align="center">
  <strong>Level-normalized compensation intelligence for tech professionals in India & globally.</strong><br/>
  Compare offers fairly. Know your percentile. Negotiate with confidence.
</p>

<p align="center">
  <a href="#-demo">View Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a>
</p>

</div>

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img width="1363" height="608" alt="Landing Page" src="https://github.com/user-attachments/assets/b81f36a1-ea39-43b6-8ee0-0b3459429def" />
      <img width="1365" height="611" alt="image" src="https://github.com/user-attachments/assets/bb7d98bf-ad60-426d-a3f0-faefd60205fd" />
      <br/><sub><b>🏠 Landing Page — Hero + Live Data Preview</b></sub>
    </td>
    <td align="center" width="50%">
      <img width="1363" height="611" alt="image" src="https://github.com/user-attachments/assets/6c041f85-1d0c-486b-ace6-c20ce8135d01" />
      <img width="1360" height="608" alt="image" src="https://github.com/user-attachments/assets/5fdb0dc1-b76a-40f0-8ab6-4fc175ecfb13" />
      <br/><sub><b>🔍 Compensation Explorer — Filter by Level, Role, Company</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img width="1362" height="609" alt="image" src="https://github.com/user-attachments/assets/fa18d695-fd29-4562-b962-f76a3f6344ae" />
      <img width="1366" height="605" alt="image" src="https://github.com/user-attachments/assets/c90dc396-9ad9-449c-93ec-3838dab93fba" />
      <br/><sub><b>⚖️ Offer Comparison Tool — Side-by-Side with TC Breakdown</b></sub>
    </td>
    <td align="center" width="50%">
      <img width="1063" height="598" alt="image" src="https://github.com/user-attachments/assets/fb9d54b8-d2a6-4b41-9312-6b1903809ce5" />
      
      <br/><sub><b>📝 Anonymous Submission — 5-Step Guided Form</b></sub>
    </td>
  </tr>
</table>


---

## 🎯 The Problem We Solve

Most salary platforms fail because they treat **"Senior Software Engineer"** as one data point.

But a Senior SWE at Google is `L5`, at Meta it's `E5`, at Amazon it's `SDE-III` — and the compensation difference can be **2–3×**. Job titles mean nothing without level context.

**CompIntel** solves this with:
- 🏗️ A **Universal Level System** (L1–L9) that maps company-specific ladders to a common scale
- 📊 Real **percentile bands** (p25/p50/p75/p90) per level
- 💰 Full **Total Comp** breakdown: Base + Bonus + Annualized Equity
- 🌍 **India + Global** data: INR ↔ USD normalized, IT services vs product companies

---

## ✨ Features

### 🔍 Compensation Explorer
- Browse **192+ verified records** across 10 major companies
- Filter by **Universal Level** (L1–L9), **Role Track**, **Location Tier**, **YOE**
- Real-time percentile distribution chart (p25 → p90)
- Sort by Total TC, Base, Equity, YOE

### ⚖️ Offer Comparison Tool
- Compare up to **4 offers** side-by-side
- **Automatic level-mismatch detection** — flags when you compare an L4 vs L6
- Full TC breakdown with equity annualization (4-year vesting, 1-year cliff)
- Currency normalization: USD ↔ INR

### 📝 Anonymous Submission (5-Step Wizard)
- **Step 1** — Company + Role  
- **Step 2** — Universal Level Selection  
- **Step 3** — Compensation details (Base, Bonus %, Equity)  
- **Step 4** — Context (YOE, Education, Location)  
- **Step 5** — Review & Submit  
- Zero PII required. Fully anonymous by default.

### 🏢 Company Level Ladders
- Dedicated pages per company: `/company/google`, `/company/meta`, etc.
- Full level mapping with Universal Level equivalents
- Historical TC data per level

### 🔐 Authentication
- OAuth via **Google** and **GitHub**
- Auto-promote admin emails to `ADMIN` role
- Protected routes: Submit, Admin panel

### 👨‍💼 Admin Panel
- Review and approve/reject submissions
- Moderate data quality
- Role-based access control

---

## 🗺️ Universal Level System

The core intellectual innovation — every company's levels mapped to L1–L9:

| Universal | Title | Google | Meta | Amazon | Microsoft | Flipkart |
|-----------|-------|--------|------|--------|-----------|---------|
| **L1** | Intern | Intern | Intern | Intern | Intern | Intern |
| **L2** | Junior / Entry | L3 | E3 | SDE-I | 59 | SDE-1 |
| **L3** | Mid-Level | L4 | E4 | SDE-II | 60 | SDE-2 |
| **L4** | Senior | L5 | E5 | SDE-III | 63/64 | SDE-3 |
| **L5** | Staff / Lead | L6 | E6 | Principal | 65/66 | Staff |
| **L6** | Senior Staff | L7 | E7 | Sr. Principal | 67 | — |
| **L7** | Principal | L8 | E8 | Distinguished | Partner | — |
| **L8** | Fellow / VP | L9 | E9 | Fellow | Dist. Eng. | — |
| **L9** | Dist. Fellow / SVP | L10 | E10 | Senior Fellow | — | — |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14 (App Router) | Server Components, API Routes, Middleware |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Database** | PostgreSQL (Neon Serverless) | Scalable, serverless-friendly |
| **ORM** | Prisma 5 | Type-safe queries, schema migrations |
| **Auth** | Auth.js v5 (NextAuth) | OAuth (Google, GitHub), JWT sessions |
| **Styling** | Tailwind CSS 3 | Utility-first, dark mode |
| **State** | TanStack Query v5 | Server state, caching, pagination |
| **Validation** | Zod v4 | Runtime schema validation |
| **State Mgmt** | Zustand | Client-side UI state |
| **Testing** | Vitest + Playwright | Unit + E2E tests |
| **Deployment** | Docker + Vercel-ready | CI/CD, containerized |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  /explore   │  │  /compare   │  │    /submit     │  │
│  │  (Server)   │  │  (Client)   │  │    (Client)    │  │
│  └──────┬──────┘  └──────┬──────┘  └───────┬────────┘  │
│         │                │                  │           │
│  ┌──────▼──────────────────────────────────▼────────┐  │
│  │              API Routes (/api/v1/*)               │  │
│  │   compensation • companies • compare • stats      │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │            Prisma ORM + Business Logic            │  │
│  │  level-normalization • compensation-calculator    │  │
│  │  comparison-engine • api-response                 │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │
              ┌───────────▼──────────┐
              │  Neon PostgreSQL DB  │
              │  (Serverless Postgres)│
              └──────────────────────┘
```

### Project Structure

```
compensation-intelligence/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── explore/page.tsx          # Compensation explorer
│   ├── compare/page.tsx          # Offer comparison
│   ├── submit/page.tsx           # Anonymous submission
│   ├── company/[slug]/page.tsx   # Company level pages
│   ├── auth/signin/page.tsx      # Sign in page
│   └── api/v1/                   # REST API routes
│       ├── compensation/         # CRUD + filtering
│       ├── companies/            # Company list
│       ├── compare/              # Comparison engine
│       ├── levels/               # Level ladder data
│       └── stats/                # Aggregate stats
│
├── components/
│   ├── Navbar.tsx                # Session-aware nav (Server Component)
│   ├── UserMenu.tsx              # Avatar dropdown (Client Component)
│   └── ui/                       # Design system components
│
├── features/compensation/ui/
│   ├── ExploreClient.tsx         # Filter + results table
│   ├── ComparePageClient.tsx     # Side-by-side comparison
│   └── SubmitForm.tsx            # 5-step submission wizard
│
├── lib/
│   ├── auth.ts                   # NextAuth config (Node.js)
│   ├── prisma.ts                 # Prisma singleton
│   ├── level-normalization.ts    # L1–L9 mapping engine
│   ├── compensation-calculator.ts # TC, equity, USD normalization
│   └── api-response.ts           # Standardized response envelope
│
├── auth.config.ts                # Edge-safe auth config (middleware)
├── middleware.ts                 # Auth protection + rate limiting
└── prisma/
    ├── schema.prisma             # DB schema
    └── seed.ts                   # 192 realistic seed records
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- Google OAuth credentials (optional — for social login)
- GitHub OAuth credentials (optional)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/compensation-intelligence.git
cd compensation-intelligence
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secret-here"

# Google OAuth (console.cloud.google.com)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# GitHub OAuth (github.com/settings/developers)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Admin emails (auto-promoted to ADMIN role)
ADMIN_EMAILS="your@email.com"

NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed with 192 realistic compensation records
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live! 🎉

---

## 🐳 Docker Setup

Run the full stack locally with Docker Compose:

```bash
# Copy env file
cp .env.example .env.local
# (edit with your values)

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
```

---

## 📡 API Reference

All endpoints return the standard envelope:

```json
{
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "pageSize": 20, "total": 192, "totalPages": 10 }
}
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/compensation` | List records with filters + pagination |
| `POST` | `/api/v1/compensation` | Submit new compensation record |
| `GET` | `/api/v1/compensation/:id` | Get single record |
| `GET` | `/api/v1/companies` | List all companies with level counts |
| `GET` | `/api/v1/compare` | Compare 2–4 compensation records |
| `GET` | `/api/v1/levels` | Get universal level definitions |
| `GET` | `/api/v1/stats` | Aggregate stats (p25/p50/p75/p90) |

### Example — Filter Compensation Records

```bash
GET /api/v1/compensation?level=L4&company=google&location=bangalore-in&page=1&pageSize=20&sortBy=totalCompUsd&sortOrder=desc
```

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Type checking
npm run typecheck

# Lint
npm run lint
```

---

## 🗃️ Database Schema

```
User ─────────────────── Account (OAuth)
  │
  └──── Compensation ─── Company ──── CompanyLevel
              │         
              ├──── Location (city, country, tier)
              └──── RoleTaxonomy (track, family, specialization)
```

Key design decisions:
- **`universalLevel`** — the L1–L9 enum stored on every record for fast cross-company queries
- **`baseSalaryUsd`** — always stored in USD alongside local currency for aggregation
- **`equityAnnualUsd`** — pre-computed annualized equity (total / vestingYears)
- **`totalCompUsd`** — base + bonus + annualizedEquity, always in USD

---

## 🔒 Security

- **Edge Middleware** — route protection runs at the CDN edge (no DB round-trip)
- **JWT Sessions** — stateless, no session table queries on every request
- **Rate Limiting** — 60 req/min per IP on all API routes
- **Zod Validation** — all API inputs validated against strict schemas
- **Anonymous Submissions** — no PII linkage by default
- **Role-Based Access** — `USER` / `MODERATOR` / `ADMIN` enforced at API level

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in the Vercel dashboard. Use Neon for the database (free tier works great).

### Environment Variables for Production

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Pooled Neon connection string |
| `DIRECT_DATABASE_URL` | ✅ | Direct connection (for migrations) |
| `AUTH_SECRET` | ✅ | Random 32-byte secret |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth client secret |
| `NEXTAUTH_URL` | ✅ | Your production URL |
| `ADMIN_EMAILS` | optional | Comma-separated admin emails |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built with ❤️ as an internship selection project demonstrating:
- Full-stack Next.js 14 App Router expertise
- Production-grade database design (Prisma + PostgreSQL)
- Authentication patterns (OAuth, JWT, Edge Runtime)
- Type-safe API design (Zod, TypeScript end-to-end)
- Real-world feature: Level normalization across 10 companies

---

<div align="center">

**If this project helped you, please ⭐ star it on GitHub!**

<sub>Built with Next.js · Prisma · PostgreSQL · Auth.js · TailwindCSS</sub>

</div>
