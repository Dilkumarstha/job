# HireHub — Full-Stack Job Portal

A full-stack job portal built with **Next.js 16 (App Router)**, **MongoDB Atlas**, **Auth.js**, and **Tailwind CSS v4**.

Three user roles: **JobSeeker**, **Company**, and **SuperAdmin**, each with a dedicated dashboard and feature set.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.x (App Router, TypeScript) |
| Database | MongoDB Atlas (free tier) via Mongoose |
| Auth | Auth.js v5 (NextAuth) — Credentials + JWT |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Validation | Zod + React Hook Form |
| Password hashing | bcryptjs |
| File uploads | Local `public/uploads/` (swap-ready for S3/Cloudinary) |

---

## Prerequisites

- **Node.js 20.9+** (required by Next.js 16)
- A **MongoDB Atlas** account with a free-tier cluster
- `npm` (or `pnpm` / `yarn` / `bun`)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd job
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Description | How to get it |
|----------|-------------|---------------|
| `MONGODB_URI` | MongoDB Atlas connection string | Atlas dashboard → Connect → Drivers |
| `NEXTAUTH_SECRET` | JWT signing secret | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (leave as `http://localhost:3000` for local dev) | — |

### 3. Create upload directories

```bash
mkdir -p public/uploads/resumes public/uploads/logos
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Seeding Demo Data

The seed script populates your database with realistic dummy data for testing:

- 1 SuperAdmin
- 3 Companies (2 approved, 1 pending)
- 10 JobSeekers with profiles
- 15 Jobs (mix of active, expired, closed)
- 20 Applications
- 10 Saved jobs
- 5 Company follows

**Run the seed script:**

```bash
npm run seed
```

The script is idempotent — safe to run multiple times (it skips records that already exist).

**Default SuperAdmin credentials** (created by seed):
- Email: `admin@hirehub.local`
- Password: `Admin123!`

> Change the SuperAdmin password immediately after first login.

---

## Environment Variables Reference

See `.env.example` for all variables with descriptions. Summary:

```bash
MONGODB_URI=           # MongoDB Atlas URI
NEXTAUTH_SECRET=       # JWT secret (generate: openssl rand -base64 32)
NEXTAUTH_URL=          # App URL (http://localhost:3000 for local)

# Optional upload size limits (bytes)
UPLOAD_RESUME_MAX_BYTES=5242880   # 5 MB default
UPLOAD_LOGO_MAX_BYTES=2097152     # 2 MB default
```

**Adding cloud storage** (future): Add `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (or Cloudinary equivalents) to `.env.local` and swap `src/lib/upload.ts` implementation. No other files need to change.

---

## Project Structure

```
src/
├─ app/
│   ├─ (public)/        # Landing, login, signup pages
│   ├─ (seeker)/        # JobSeeker dashboard + features
│   ├─ (company)/       # Company dashboard + job management
│   ├─ (admin)/         # SuperAdmin panel
│   └─ api/             # Route handlers (auth, notifications, uploads)
├─ actions/             # Server Actions (form mutations)
├─ components/          # Shared React components
├─ lib/
│   ├─ db.ts            # Mongoose connection helper
│   ├─ auth.ts          # Auth.js config
│   ├─ matchScore.ts    # Job ranking algorithm
│   ├─ upload.ts        # File upload abstraction
│   └─ validations/     # Zod schemas
├─ models/              # Mongoose models
└─ proxy.ts             # RBAC enforcement (Next.js 16 proxy)

scripts/
└─ seed.ts              # Database seed script
```

---

## User Roles & Access

| Route Group | Role Required | Key Features |
|------------|--------------|--------------|
| `/admin/*` | SUPERADMIN | Stats, user management, company approval, audit log |
| `/company/*` | COMPANY (active) | Post/edit jobs, view applicants, approve/reject |
| `/seeker/*` | JOBSEEKER | Personalized feed, search, apply, saved jobs, notifications |

---

## Match Score Algorithm

Jobs in a seeker's feed are ranked by a weighted multi-criteria score:

```
score = (0.35 × categoryMatch)
      + (0.30 × skillOverlap)
      + (0.10 × locationMatch)
      + (0.10 × experienceMatch)
      + (0.10 × recencyBoost)
      + (0.05 × followedCompanyBoost)
```

See `src/lib/matchScore.ts` and `design.md §6` for full documentation.

---

## Development Notes

- **No `tailwind.config.js`** — this project uses Tailwind v4's CSS-first configuration via `src/app/globals.css`.
- **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed the middleware file. Export must be named `proxy`. Edge runtime is NOT supported.
- **All request APIs are async** — `cookies()`, `headers()`, `params`, and `searchParams` must all be `await`ed (Next.js 16 breaking change).
- **Turbopack is the default bundler** in Next.js 16 for both `dev` and `build`.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with demo data |

---

## Spec Documents

| File | Contents |
|------|---------|
| `requirements.md` | User stories with EARS-notation acceptance criteria |
| `design.md` | Architecture, data model, algorithm, auth flow |
| `tasks.md` | Sequenced implementation checklist (Phases 1–7) |
