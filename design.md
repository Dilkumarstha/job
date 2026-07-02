# HireHub — Design Document

> **Version**: 1.0  
> **Stack**: Next.js 16.2.9 (App Router) · TypeScript · MongoDB / Mongoose · Auth.js (NextAuth) · Tailwind CSS v4 · Zod · React Hook Form

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Route Structure](#2-route-structure)
3. [Server Actions vs Route Handlers](#3-server-actions-vs-route-handlers)
4. [Auth & Middleware (Proxy) Flow](#4-auth--middleware-proxy-flow)
5. [Data Model](#5-data-model)
6. [Match Score Algorithm](#6-match-score-algorithm)
7. [File Upload Structure](#7-file-upload-structure)
8. [Notification System](#8-notification-system)
9. [Key Design Decisions](#9-key-design-decisions)

---

## 1. Architecture Overview

```
Browser
  │
  ├─ Next.js App Router (src/app/)
  │    ├─ Server Components (data fetching, DB queries)
  │    ├─ Client Components (forms, interactivity — "use client")
  │    └─ Server Functions / Server Actions ("use server")
  │
  ├─ src/proxy.ts  ← RBAC enforcement (renamed from middleware in Next.js 16)
  │
  ├─ src/lib/
  │    ├─ db.ts          ← Mongoose connection helper (cached)
  │    ├─ auth.ts        ← Auth.js config (credentials provider, JWT)
  │    ├─ matchScore.ts  ← Pure match score function
  │    └─ upload.ts      ← File upload helper (swappable for S3/Cloudinary)
  │
  ├─ src/models/         ← Mongoose models
  └─ src/components/     ← Shared UI components
```

**MongoDB Atlas** is the only external service at MVP. All reads/writes go through Mongoose models. No raw `fetch` to MongoDB — always through `lib/db.ts` + model layer.

---

## 2. Route Structure

All role-specific pages live in route groups so each group can have its own layout with auth-checking.

```
src/app/
├─ (public)/                 # No auth required
│   ├─ page.tsx              # Landing page
│   ├─ login/page.tsx
│   ├─ signup/
│   │   ├─ seeker/page.tsx
│   │   └─ company/page.tsx
│   └─ jobs/[jobId]/page.tsx # Public job detail
│
├─ (seeker)/                 # role = JOBSEEKER, status = ACTIVE
│   ├─ layout.tsx            # Seeker shell (navbar, sidebar)
│   ├─ seeker/
│   │   ├─ onboarding/page.tsx
│   │   ├─ feed/page.tsx
│   │   ├─ search/page.tsx
│   │   ├─ profile/page.tsx
│   │   ├─ applications/page.tsx
│   │   └─ saved/page.tsx
│
├─ (company)/                # role = COMPANY, status = ACTIVE
│   ├─ layout.tsx            # Company shell
│   ├─ company/
│   │   ├─ dashboard/page.tsx
│   │   ├─ profile/page.tsx
│   │   ├─ jobs/
│   │   │   ├─ page.tsx              # Job list
│   │   │   ├─ new/page.tsx
│   │   │   ├─ [jobId]/edit/page.tsx
│   │   │   └─ [jobId]/applicants/page.tsx
│
├─ (admin)/                  # role = SUPERADMIN
│   ├─ layout.tsx
│   ├─ admin/
│   │   ├─ dashboard/page.tsx
│   │   ├─ users/page.tsx
│   │   ├─ companies/page.tsx
│   │   └─ audit/page.tsx
│
└─ api/                      # Route Handlers (REST API endpoints)
    ├─ auth/[...nextauth]/route.ts
    ├─ users/route.ts
    ├─ jobs/route.ts
    ├─ jobs/[jobId]/route.ts
    ├─ applications/route.ts
    ├─ applications/[appId]/route.ts
    ├─ notifications/route.ts
    ├─ upload/route.ts
    └─ admin/
        ├─ stats/route.ts
        ├─ users/[userId]/route.ts
        └─ companies/[companyId]/route.ts
```

---

## 3. Server Actions vs Route Handlers

**Decision**: Use **Server Actions** for all form mutations (create/update/delete). Use **Route Handlers** for REST-style endpoints consumed by client polling (notifications), external scripts (seed), or operations needing explicit HTTP semantics (file upload).

| Operation | Approach | Reason |
|-----------|----------|--------|
| Signup / Login | Server Action | Form submission, no external consumer |
| Job post / edit | Server Action | Form mutation |
| Apply to job | Server Action | Single button click, no response body needed |
| Approve/reject applicant | Server Action | Form mutation with required message |
| Admin user management | Server Action | Form mutations |
| Notification polling | Route Handler `GET /api/notifications` | Client polls every 30 s, needs HTTP GET semantics |
| File upload | Route Handler `POST /api/upload` | Needs `multipart/form-data` parsing |
| Seed script | Standalone Node.js script | Runs outside Next.js request lifecycle |

All Server Actions live under `src/actions/` organized by domain:

```
src/actions/
├─ auth.ts       (signup, login helpers)
├─ jobs.ts
├─ applications.ts
├─ profile.ts
├─ admin.ts
└─ notifications.ts
```

---

## 4. Auth & Middleware (Proxy) Flow

### 4.1 Auth.js (NextAuth) Configuration

File: `src/lib/auth.ts`

```
Auth.js Config
├─ Provider: Credentials (email + password)
├─ Session strategy: JWT
├─ JWT callback: embeds { id, role, status } into the token
├─ Session callback: copies { id, role, status } onto session.user
└─ Pages: { signIn: '/login' }
```

`bcryptjs` is used (not native bcrypt) because it runs in the Node.js runtime without native bindings — safe for Next.js serverless.

### 4.2 Proxy (RBAC Enforcement)

File: `src/proxy.ts`  
Export: `proxy` function (NOT `middleware` — renamed in Next.js 16)  
Runtime: Node.js (edge runtime NOT supported in proxy as of Next.js 16)

```
Incoming request
  │
  ▼
proxy.ts
  ├─ Parse JWT from cookie (getToken from next-auth/jwt)
  │
  ├─ /admin/* → if (!token || role !== 'SUPERADMIN') → redirect /login
  ├─ /company/* → if (!token || role !== 'COMPANY') → redirect /login
  ├─ /seeker/* → if (!token || role !== 'JOBSEEKER') → redirect /login
  ├─ /api/* (protected) → if (!token) → 401 JSON response
  │
  └─ Pass through
```

Suspension check on the role-protected routes:
- If `status === 'SUSPENDED'` → redirect to `/suspended` page which shows the reason and expiry.
- On each login attempt, check `suspendedUntil < now` and auto-reactivate.

### 4.3 Session Shape

```ts
// Session JWT payload (embedded in cookie)
interface SessionUser {
  id: string;         // MongoDB ObjectId as string
  email: string;
  role: 'SUPERADMIN' | 'JOBSEEKER' | 'COMPANY';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
}
```

---

## 5. Data Model

### Design Principles

- **Embed** small, tightly-coupled, rarely-independently-queried data (skills, interests) as string arrays in the parent document.
- **Reference** data that is independently queried, grows large, or is shared (Jobs, Applications, Users).
- No SQL migrations. Uniqueness enforced via Mongoose compound unique indexes.
- Cascading deletes handled manually in model/action layer (e.g., deleting a Company deletes its Jobs and Applications).
- **Soft deletes only** for Users (`deletedAt` field). All other records may be hard-deleted.

### 5.1 User

```ts
{
  email:           String, unique, required, lowercase
  passwordHash:    String, required
  role:            enum ['SUPERADMIN', 'JOBSEEKER', 'COMPANY'], required
  status:          enum ['ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'], default: 'ACTIVE'
  suspendedUntil:  Date, default: null
  suspendedReason: String, default: null
  deletedAt:       Date, default: null
  createdAt:       Date (timestamps: true)
  updatedAt:       Date (timestamps: true)
}
```

Indexes: `email` (unique), `role`, `status`, `deletedAt`.

### 5.2 SeekerProfile

```ts
{
  userId:          ObjectId → User, required, unique
  fullName:        String, required
  bio:             String
  resumeUrl:       String
  experienceLevel: enum ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']
  location:        String
  skills:          [String]   // embedded array, e.g. ["React", "TypeScript"]
  interests:       [String]   // category names, e.g. ["Engineering", "Design"]
  createdAt/updatedAt (timestamps: true)
}
```

### 5.3 CompanyProfile

```ts
{
  userId:      ObjectId → User, required, unique
  companyName: String, required
  description: String
  logoUrl:     String
  industry:    String
  website:     String
  verified:    Boolean, default: false
  createdAt/updatedAt (timestamps: true)
}
```

### 5.4 Job

```ts
{
  companyId:       ObjectId → User, required   // the Company user's id
  title:           String, required
  description:     String, required
  category:        String, required
  skillsRequired:  [String]                    // embedded array
  experienceLevel: enum ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'], required
  salaryMin:       Number
  salaryMax:       Number
  location:        String, required
  jobType:         enum ['REMOTE', 'ONSITE', 'HYBRID'], required
  deadline:        Date, required
  status:          enum ['ACTIVE', 'EXPIRED', 'CLOSED'], default: 'ACTIVE'
  createdAt/updatedAt (timestamps: true)
}
```

Compound index: `{ deadline: 1, status: 1 }` for fast "active, non-expired" queries.

**Seeker-facing query filter** (always applied):
```ts
{
  status: 'ACTIVE',
  deadline: { $gt: new Date() },
}
```

### 5.5 Application

```ts
{
  jobId:    ObjectId → Job, required
  seekerId: ObjectId → User, required
  status:   enum ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'], default: 'PENDING'
  message:  String   // company's response message (required when APPROVED/REJECTED)
  appliedAt: Date, default: Date.now
  updatedAt (timestamps: true)
}
```

Compound unique index: `{ jobId: 1, seekerId: 1 }` — enforces one application per seeker per job.

### 5.6 SavedJob

```ts
{
  seekerId:  ObjectId → User, required
  jobId:     ObjectId → Job, required
  createdAt: Date, default: Date.now
}
```

Compound unique index: `{ seekerId: 1, jobId: 1 }`.

### 5.7 CompanyFollow

```ts
{
  seekerId:  ObjectId → User, required
  companyId: ObjectId → User, required
  createdAt: Date, default: Date.now
}
```

Compound unique index: `{ seekerId: 1, companyId: 1 }`.

### 5.8 Notification

```ts
{
  userId:    ObjectId → User, required
  type:      enum [
               'APPLICATION_STATUS_CHANGED',
               'NEW_JOB_POSTED',
               'ACCOUNT_SUSPENDED',
               'ACCOUNT_REACTIVATED',
               'COMPANY_APPROVED',
               'COMPANY_REJECTED',
             ], required
  message:   String, required
  read:      Boolean, default: false
  createdAt: Date (timestamps: true)
}
```

Index: `{ userId: 1, read: 1, createdAt: -1 }`.

### 5.9 AuditLog

```ts
{
  adminId:      ObjectId → User, required
  action:       String, required   // e.g. 'SUSPEND_USER', 'APPROVE_COMPANY'
  targetUserId: ObjectId → User
  reason:       String
  metadata:     Mixed              // extra context (optional)
  createdAt:    Date (timestamps: true)
}
```

### Entity Relationship Diagram (Conceptual)

```
User (1) ──────── (1) SeekerProfile
User (1) ──────── (1) CompanyProfile
User (1) ──────── (N) Job           [companyId]
User (1) ──────── (N) Application   [seekerId]
Job  (1) ──────── (N) Application   [jobId]
User (1) ──────── (N) SavedJob      [seekerId]
Job  (1) ──────── (N) SavedJob      [jobId]
User (seeker, 1) ─ (N) CompanyFollow [seekerId]
User (company, 1)─ (N) CompanyFollow [companyId]
User (1) ──────── (N) Notification  [userId]
User (admin, 1) ── (N) AuditLog     [adminId]
```

---

## 6. Match Score Algorithm

File: `src/lib/matchScore.ts`

### 6.1 Formula

```
score = (0.35 × categoryMatch)
      + (0.30 × skillOverlap)
      + (0.10 × locationMatch)
      + (0.10 × experienceMatch)
      + (0.10 × recencyBoost)
      + (0.05 × followedCompanyBoost)
```

### 6.2 Component Definitions

| Component | Range | Formula |
|-----------|-------|---------|
| `categoryMatch` | {0, 1} | `1` if `job.category ∈ seeker.interests`, else `0` |
| `skillOverlap` | [0, 1] | Jaccard similarity: `|intersection(seekerSkills, jobSkills)| / |union(seekerSkills, jobSkills)|`; `0` if both empty |
| `locationMatch` | {0, 0.5, 1} | `1` exact match, `0.5` if `job.jobType = 'REMOTE'`, else `0` |
| `experienceMatch` | {0, 0.5, 1} | `1` exact level match, `0.5` if adjacent level (e.g. JUNIOR↔MID), else `0` |
| `recencyBoost` | (0, 1] | `1 / (1 + daysSincePosted)` — converges to 0 for old jobs |
| `followedCompanyBoost` | {0, 1} | `1` if seeker follows this company, else `0` |

**Experience levels order** (for adjacency): `ENTRY < JUNIOR < MID < SENIOR < LEAD`

### 6.3 Dual Use

The same function is used in **two directions**:

1. **Seeker feed**: rank jobs for a given seeker → sort jobs descending by score.
2. **Company applicant list**: rank applicants for a given job → call `matchScore(applicantProfile, job)` for each applicant and sort descending.

### 6.4 Function Signature

```ts
/**
 * Computes a relevance score between 0 and 1 for a given (seeker, job) pair.
 *
 * Algorithm: Weighted multi-criteria content-based filtering.
 * We do not use collaborative filtering because MVP has insufficient
 * interaction data to derive meaningful user-user or item-item similarities.
 *
 * Weights (must sum to 1.0):
 *   - Category match:        0.35  (most important — seeker declared interest)
 *   - Skill overlap:         0.30  (Jaccard similarity of skill sets)
 *   - Location match:        0.10  (exact match or remote boost)
 *   - Experience match:      0.10  (exact or adjacent level)
 *   - Recency boost:         0.10  (decays as 1/(1+days), freshness signal)
 *   - Followed company boost: 0.05 (signal of seeker intent)
 *
 * @param seeker  - Seeker profile with skills, interests, experienceLevel, location
 * @param job     - Job document with skillsRequired, category, experienceLevel, location, jobType, createdAt
 * @param followedCompanyIds - Set of company User IDs the seeker follows
 * @returns number in [0, 1]
 */
export function matchScore(
  seeker: SeekerMatchInput,
  job: JobMatchInput,
  followedCompanyIds: Set<string>
): number
```

### 6.5 Jaccard Similarity (Skill Overlap)

```
Jaccard(A, B) = |A ∩ B| / |A ∪ B|
```

Skills are lowercased before comparison to avoid case-sensitivity mismatches (e.g. "React" vs "react").

---

## 7. File Upload Structure

### 7.1 Storage Layout (MVP — Local)

```
public/
└─ uploads/
   ├─ resumes/         ← PDF files, seekers
   │   └─ {userId}-{timestamp}.pdf
   ├─ logos/           ← PNG/JPEG, company logos
   │   └─ {companyId}-{timestamp}.{ext}
   └─ avatars/         ← PNG/JPEG, profile pictures (future)
       └─ {userId}-{timestamp}.{ext}
```

Files served directly as static assets via Next.js `public/` directory.

### 7.2 Upload Route Handler

`POST /api/upload`

```
Request: multipart/form-data
  - file: File
  - type: 'resume' | 'logo'
  - entityId: string (userId or companyId)

Response: { url: string }  ← relative URL e.g. "/uploads/resumes/abc-123.pdf"
```

**Validation**:
- Resume: `.pdf` only, ≤ 5 MB
- Logo: `.png` or `.jpeg` only, ≤ 2 MB

### 7.3 Swap Path for Cloud Storage

The upload logic is encapsulated in `src/lib/upload.ts` which exports a single `saveFile(buffer, filename, type)` function. To switch to S3 or Cloudinary, only this file needs to change — all call sites remain the same.

```ts
// src/lib/upload.ts
export interface UploadResult {
  url: string;
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  type: 'resume' | 'logo'
): Promise<UploadResult>
```

---

## 8. Notification System

### Architecture

- **Storage**: MongoDB `notifications` collection.
- **Delivery**: Client polling every 30 seconds via `GET /api/notifications?unreadOnly=true`.
- **No WebSockets** at MVP.

### Notification Creation Triggers

| Event | Trigger Location | Recipients |
|-------|-----------------|------------|
| Application status changed | `actions/applications.ts` (approveRejectApplicant) | Seeker |
| New job posted | `actions/jobs.ts` (createJob) | All followers of posting company |
| Account suspended | `actions/admin.ts` (suspendUser) | Target user |
| Account reactivated | `lib/auth.ts` login check | Target user |
| Company approved | `actions/admin.ts` (approveCompany) | Company user |
| Company rejected | `actions/admin.ts` (rejectCompany) | Company user |

### Polling Pattern (Client Side)

```ts
// In navbar client component
useEffect(() => {
  const poll = async () => {
    const res = await fetch('/api/notifications?unreadOnly=true')
    const data = await res.json()
    setUnreadCount(data.count)
  }
  poll()
  const interval = setInterval(poll, 30_000)
  return () => clearInterval(interval)
}, [])
```

---

## 9. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | Server Actions for mutations, Route Handlers for polling/upload | Server Actions reduce boilerplate for form submissions; Route Handlers give explicit HTTP semantics for polling and file uploads |
| Auth library | Auth.js (NextAuth) v5 | Stable, well-documented, first-class Next.js App Router support |
| Password hashing | `bcryptjs` (not `bcrypt`) | No native bindings required; runs safely in Next.js Node.js runtime |
| Session strategy | JWT (not database sessions) | Stateless; works without extra DB reads on every request |
| Tailwind config | CSS-first (`@import "tailwindcss"` in `globals.css`) | Project uses Tailwind v4 — no `tailwind.config.js` needed or supported |
| Proxy runtime | Node.js | Edge runtime is NOT supported in `proxy.ts` as of Next.js 16 |
| Soft deletes | Users only | Preserve user records for audit; other records (jobs, applications) can be hard-deleted |
| Pagination | Cursor-based using `_id` | Avoids skip-count issues with large collections; simpler than offset for infinite scroll |
| Upload limit | Resume 5 MB, Logo 2 MB | Reasonable for PDF resumes and web logos; configurable via env var later |
| Color palette | Neutral gray base + indigo primary + green success + red error | Professional job-portal feel; Tailwind v4 CSS custom properties in `globals.css` |
| Onboarding gate | Redirect to `/seeker/onboarding` if `interests.length === 0` | Enforced in seeker layout server component, not just proxy |
| Suspension auto-reactivation | Checked on login attempt | Avoids needing a cron job; simple and reliable for MVP |
| Categories | Plain string array (no separate collection) | MVP only needs filtering; admin-managed taxonomy deferred to post-MVP |
