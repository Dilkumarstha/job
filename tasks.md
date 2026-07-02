# HireHub — Implementation Tasks

> **How to use**: Work through tasks in order within each phase. Check off each task as it is completed.  
> **Checkpoint** markers (🔴) indicate phases where you should review outputs before proceeding.

---

## Phase 0 — Dependency Installation

- [x] **T0.1** Install missing runtime dependencies:
  ```bash
  npm install mongoose next-auth@beta zod react-hook-form @hookform/resolvers bcryptjs
  ```
- [x] **T0.2** Install missing type definitions:
  ```bash
  npm install -D @types/bcryptjs
  ```
- [x] **T0.3** Verify `package.json` reflects all new dependencies with exact/pinned versions.
- [x] **T0.4** Create `public/uploads/resumes/` and `public/uploads/logos/` directories (add `.gitkeep` files).
- [x] **T0.5** Add `public/uploads/` to `.gitignore` (keep `.gitkeep` files tracked).

---

## Phase 1 — Schema & DB Connection

🔴 **CHECKPOINT**: After completing Phase 1, surface `src/models/` and `.env.example` for review before starting Phase 2.

- [x] **T1.1** Create `.env.local` (not committed) and `.env.example` (committed) with placeholders:
  ```
  MONGODB_URI=
  NEXTAUTH_SECRET=
  NEXTAUTH_URL=http://localhost:3000
  ```
- [x] **T1.2** Create `src/lib/db.ts` — cached Mongoose connection helper:
  - Reads `MONGODB_URI` from env, throws a descriptive error if absent.
  - Caches connection on Node.js `global` object to survive hot-reloads.
  - Exports `connectDB(): Promise<typeof mongoose>`.
- [x] **T1.3** Create `src/models/User.ts`:
  - Fields: `email`, `passwordHash`, `role` (enum), `status` (enum), `suspendedUntil`, `suspendedReason`, `deletedAt`, timestamps.
  - Indexes: unique `email`, compound `{ role, status }`.
  - Export: `User` model + `IUser` TypeScript interface.
- [x] **T1.4** Create `src/models/SeekerProfile.ts`:
  - Fields: `userId` (ref User), `fullName`, `bio`, `resumeUrl`, `experienceLevel` (enum), `location`, `skills` ([String]), `interests` ([String]), timestamps.
  - Index: unique `userId`.
  - Export: `SeekerProfile` model + `ISeekerProfile` interface.
- [x] **T1.5** Create `src/models/CompanyProfile.ts`:
  - Fields: `userId` (ref User), `companyName`, `description`, `logoUrl`, `industry`, `website`, `verified` (Boolean), timestamps.
  - Index: unique `userId`.
  - Export: `CompanyProfile` model + `ICompanyProfile` interface.
- [x] **T1.6** Create `src/models/Job.ts`:
  - Fields: `companyId` (ref User), `title`, `description`, `category`, `skillsRequired` ([String]), `experienceLevel` (enum), `salaryMin`, `salaryMax`, `location`, `jobType` (enum), `deadline`, `status` (enum), timestamps.
  - Compound index: `{ deadline: 1, status: 1 }`.
  - Export: `Job` model + `IJob` interface.
- [x] **T1.7** Create `src/models/Application.ts`:
  - Fields: `jobId` (ref Job), `seekerId` (ref User), `status` (enum), `message` (String), `appliedAt`.
  - Compound unique index: `{ jobId: 1, seekerId: 1 }`.
  - Export: `Application` model + `IApplication` interface.
- [x] **T1.8** Create `src/models/SavedJob.ts`:
  - Fields: `seekerId` (ref User), `jobId` (ref Job), `createdAt`.
  - Compound unique index: `{ seekerId: 1, jobId: 1 }`.
- [x] **T1.9** Create `src/models/CompanyFollow.ts`:
  - Fields: `seekerId` (ref User), `companyId` (ref User), `createdAt`.
  - Compound unique index: `{ seekerId: 1, companyId: 1 }`.
- [x] **T1.10** Create `src/models/Notification.ts`:
  - Fields: `userId` (ref User), `type` (enum), `message`, `read` (Boolean, default false), timestamps.
  - Index: `{ userId: 1, read: 1, createdAt: -1 }`.
- [x] **T1.11** Create `src/models/AuditLog.ts`:
  - Fields: `adminId` (ref User), `action` (String), `targetUserId` (ref User), `reason` (String), `metadata` (Mixed), timestamps.
- [x] **T1.12** Create `src/models/index.ts` barrel file re-exporting all models.
- [x] **T1.13** Create a simple test route `src/app/api/health/route.ts` that calls `connectDB()` and returns `{ ok: true, dbState: mongoose.connection.readyState }` — verify the DB connection works before proceeding.
- [x] **T1.14** Remove or gate the health check route before production build.

---

## Phase 2 — Auth & RBAC

- [x] **T2.1** Create `src/lib/auth.ts` — Auth.js (NextAuth v5) configuration:
  - Credentials provider: look up User by email, compare password with `bcryptjs.compare`.
  - Check `deletedAt === null` and `status !== 'SUSPENDED'` (with `suspendedUntil` expiry check) before granting session.
  - Auto-reactivate user if `suspendedUntil < now` on successful login.
  - JWT callback: embed `{ id, role, status }` into token.
  - Session callback: expose `{ id, role, status }` on `session.user`.
  - Custom pages: `{ signIn: '/login' }`.
- [x] **T2.2** Create `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler.
- [x] **T2.3** Create `src/proxy.ts` (NOT `middleware.ts`):
  - Export function named `proxy` (not `middleware`).
  - Runtime: **Node.js** (do NOT set `export const runtime = 'edge'`).
  - Use `getToken` from `next-auth/jwt` to read JWT from the request cookie.
  - Route group protection:
    - `/admin/*` → require `role === 'SUPERADMIN'`
    - `/company/*` → require `role === 'COMPANY'`
    - `/seeker/*` → require `role === 'JOBSEEKER'`
  - If token is absent → redirect to `/login`.
  - If role does not match → redirect to `/login` with `?error=unauthorized`.
  - If status is `SUSPENDED` → redirect to `/suspended`.
  - Add `config.matcher` to only run on protected paths.
- [x] **T2.4** Create Zod schemas in `src/lib/validations/`:
  - `auth.ts`: `signupSeekerSchema`, `signupCompanySchema`, `loginSchema`.
  - `job.ts`: `createJobSchema`, `updateJobSchema`.
  - `application.ts`: `reviewApplicationSchema`.
  - `profile.ts`: `updateSeekerProfileSchema`, `updateCompanyProfileSchema`.
  - `admin.ts`: `suspendUserSchema`.
- [x] **T2.5** Create `src/actions/auth.ts` — Server Actions:
  - `signupSeeker(formData)`: validate → hash password (`bcryptjs`, rounds=12) → create User + SeekerProfile → redirect `/seeker/onboarding`.
  - `signupCompany(formData)`: validate → hash password → create User (`status: 'PENDING_APPROVAL'`) + CompanyProfile → redirect `/login?message=pending`.
  - Wrap DB operations in try/catch; return `{ error: string }` on failure.
- [x] **T2.6** Build `/login` page (`src/app/(public)/login/page.tsx`):
  - React Hook Form + Zod resolver (`loginSchema`).
  - Calls Auth.js `signIn('credentials', ...)`.
  - Shows error messages inline.
  - Redirects by role after successful login (`/admin/dashboard`, `/company/dashboard`, `/seeker/feed`).
- [x] **T2.7** Build `/signup/seeker` page — RHF form calling `signupSeeker` action.
- [x] **T2.8** Build `/signup/company` page — RHF form calling `signupCompany` action.
- [x] **T2.9** Build `/suspended` page — show suspension reason and expiry date from session.
- [x] **T2.10** Create route group layouts with server-side session checks:
  - `(seeker)/layout.tsx`: get session, verify `role === 'JOBSEEKER'`, redirect if not.
  - `(company)/layout.tsx`: get session, verify `role === 'COMPANY'`, show `PENDING_APPROVAL` banner if applicable.
  - `(admin)/layout.tsx`: get session, verify `role === 'SUPERADMIN'`.

---

## Phase 3 — SuperAdmin Panel

- [x] **T3.1** Create `src/actions/admin.ts` — Server Actions:
  - `getAdminStats()`: aggregate counts for seekers, companies (pending/active), jobs (active/expired), applications, recent signups.
  - `listUsers(query)`: paginated user list with search + role/status filter.
  - `approveCompany(userId)`: set `status = 'ACTIVE'`, create notification, create AuditLog.
  - `rejectCompany(userId, reason)`: set `status = 'SUSPENDED'`, create notification, create AuditLog.
  - `suspendUser(userId, reason, suspendedUntil?)`: validate with `suspendUserSchema`, update user, create notification, create AuditLog.
  - `reactivateUser(userId)`: clear suspension fields, create notification, create AuditLog.
  - `softDeleteUser(userId)`: set `deletedAt = now`, create AuditLog.
- [x] **T3.2** Build `/admin/dashboard` page — stats cards (seekers, companies, jobs, applications, recent signups).
- [x] **T3.3** Build `/admin/users` page — paginated table with search input and role/status filter dropdowns.
- [x] **T3.4** Build `/admin/companies` page — list of `PENDING_APPROVAL` companies with approve/reject buttons.
- [x] **T3.5** Build `SuspendUserModal` component — form with reason + optional expiry date field; calls `suspendUser` action.
- [x] **T3.6** Build `/admin/audit` page — paginated AuditLog table with `adminId`, `action`, `targetUserId`, `reason`, `createdAt`.
- [x] **T3.7** Build admin sidebar / navigation component.

---

## Phase 4 — Company Features

- [x] **T4.1** Create `src/actions/jobs.ts` — Server Actions:
  - `createJob(formData)`: validate with `createJobSchema`, check company `status === 'ACTIVE'`, insert Job, trigger `NEW_JOB_POSTED` notifications for all followers.
  - `updateJob(jobId, formData)`: validate, verify ownership, update Job.
  - `closeJob(jobId)`: set `status = 'CLOSED'`.
  - `getCompanyJobs(companyId)`: return jobs including EXPIRED/CLOSED (no deadline filter).
  - `getJobApplicants(jobId)`: return applications with populated seeker profiles, sorted by match score.
- [x] **T4.2** Create `src/actions/applications.ts` — Server Actions:
  - `reviewApplicant(applicationId, status, message)`: validate status + non-empty message, update Application, create notification for seeker, create AuditLog-style record (optional).
- [x] **T4.3** Build `/company/dashboard` page — stats (active jobs, total applicants), recent applications.
- [x] **T4.4** Build `/company/profile` page — editable form for CompanyProfile fields + logo upload.
- [x] **T4.5** Build `/company/jobs` page — list of all company jobs (active, expired, closed) with status badge and action buttons.
- [x] **T4.6** Build `/company/jobs/new` page — `PostJobForm` using RHF + `createJobSchema`:
  - Tag input for `skillsRequired`.
  - Category dropdown (predefined list defined in `src/lib/constants.ts`).
  - Experience level select, job type select.
  - Salary range inputs (min/max).
  - Deadline date picker.
- [x] **T4.7** Build `/company/jobs/[jobId]/edit` page — pre-filled `PostJobForm` calling `updateJob`.
- [x] **T4.8** Build `/company/jobs/[jobId]/applicants` page — applicant cards sorted by match score:
  - Show seeker name, experience level, skills, resume PDF link.
  - Show computed match score as a percentage bar.
  - Approve / Reject buttons → open inline form with required message field.
- [x] **T4.9** Implement logo upload: `POST /api/upload` route handler, save to `public/uploads/logos/`, return URL.
- [x] **T4.10** Implement `PENDING_APPROVAL` company dashboard banner blocking job-posting UI.

---

## Phase 5 — JobSeeker Features

- [x] **T5.1** Create `src/lib/matchScore.ts` — pure function:
  - Input types: `SeekerMatchInput`, `JobMatchInput`.
  - Implement all six components per design.md §6.
  - Add JSDoc comment block explaining the algorithm.
  - Export `matchScore(seeker, job, followedCompanyIds): number`.
- [x] **T5.2** Write unit tests for `matchScore` (Vitest or Jest):
  - Perfect match (all signals = 1) → score ≈ 1.
  - Zero match (no skills, no category, no location) → score = recencyBoost × 0.10 only.
  - Jaccard skill overlap edge cases (empty sets, partial overlap).
  - Adjacent vs exact experience level.
- [x] **T5.3** Create `src/actions/seeker.ts` — Server Actions:
  - `completeOnboarding(interests, skills)`: update SeekerProfile, redirect to `/seeker/feed`.
  - `updateSeekerProfile(formData)`: validate, update SeekerProfile.
  - `applyToJob(jobId)`: check no existing application (catch duplicate key error), create Application.
  - `toggleSaveJob(jobId)`: upsert/delete SavedJob.
  - `toggleFollowCompany(companyId)`: upsert/delete CompanyFollow.
- [x] **T5.4** Build `/seeker/onboarding` page — multi-step or single form:
  - Step 1: Select interests (categories) — multi-select or checkbox list.
  - Step 2: Enter skills — tag input.
  - On completion, call `completeOnboarding` and redirect to feed.
- [x] **T5.5** Build `/seeker/feed` page:
  - Server component: fetch active non-expired jobs, seeker profile, followed companies.
  - Compute match score for each job using `matchScore`.
  - Sort descending by score.
  - Render `JobCard` components.
  - Gate: if `seeker.interests.length === 0` → redirect to `/seeker/onboarding`.
- [x] **T5.6** Build `/seeker/search` page:
  - `searchParams` (fully async in Next.js 16) for: `q`, `location`, `category`, `salaryMin`, `salaryMax`, `experienceLevel`.
  - Server-side Mongoose query with all active filters.
  - Filter sidebar component (client component with URL-push on change).
- [x] **T5.7** Build `/seeker/profile` page — editable form for SeekerProfile fields + resume PDF upload.
- [x] **T5.8** Build `/seeker/applications` page — list Applications with status badge, company message, and `appliedAt`.
- [x] **T5.9** Build `/seeker/saved` page — list SavedJobs with unsave button.
- [x] **T5.10** Build `JobCard` component — job title, company, location, job type, salary range, match score badge, apply/save buttons.
- [x] **T5.11** Build public `/jobs/[jobId]` page — full job detail; "Apply" button (authenticated seekers only).
- [x] **T5.12** Implement resume upload: `POST /api/upload` (extend existing upload handler), save to `public/uploads/resumes/`.

---

## Phase 6 — Notifications

- [x] **T6.1** Create `src/lib/notifications.ts` — helper functions:
  - `createNotification(userId, type, message)`: insert into Notification collection.
  - `createBulkNotifications(userIds, type, message)`: batch insert.
- [x] **T6.2** Create `GET /api/notifications` route handler:
  - Authenticate via session.
  - Query `{ userId, read: false }` (or all if `unreadOnly=false`).
  - Return `{ notifications: [...], count: number }`.
- [x] **T6.3** Create `POST /api/notifications/read` route handler — mark all of the user's notifications as read.
- [x] **T6.4** Build `NotificationBell` client component:
  - Poll `GET /api/notifications?unreadOnly=true` every 30 seconds using `setInterval`.
  - Display badge with unread count.
  - On click: open dropdown panel, call `POST /api/notifications/read`, reset count to 0.
- [x] **T6.5** Build `NotificationPanel` component — list of notifications with type icon, message, and timestamp.
- [x] **T6.6** Add `NotificationBell` to all role layouts (seeker, company, admin navbars).
- [x] **T6.7** Wire notifications into actions:
  - `reviewApplicant`: create `APPLICATION_STATUS_CHANGED` notification for seeker.
  - `createJob`: create `NEW_JOB_POSTED` notifications for all company followers (use `createBulkNotifications`).
  - `suspendUser`: create `ACCOUNT_SUSPENDED` notification.
  - `approveCompany` / `rejectCompany`: create `COMPANY_APPROVED` / `COMPANY_REJECTED` notification.

---

## Phase 7 — Polish

- [x] **T7.1** Add `loading.tsx` files to every route segment that fetches from DB:
  - `/seeker/feed/loading.tsx`, `/seeker/search/loading.tsx`, `/company/jobs/loading.tsx`, etc.
  - Use skeleton card components.
- [x] **T7.2** Add empty-state components:
  - `EmptyState` component with an icon, heading, and subtext props.
  - Use in: job feed (no jobs), applications (no applications), saved jobs (none saved), applicants list (no applicants).
- [x] **T7.3** Create `src/lib/constants.ts`:
  - `JOB_CATEGORIES`: array of category strings (e.g. "Engineering", "Design", "Marketing", ...).
  - `EXPERIENCE_LEVELS`: ordered array `['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']`.
  - `JOB_TYPES`: `['REMOTE', 'ONSITE', 'HYBRID']`.
- [x] **T7.4** Define design tokens in `src/app/globals.css` (Tailwind v4 CSS custom properties):
  - Primary: indigo (`--color-primary-*`).
  - Success: green, Error: red, Warning: amber.
  - Neutral gray scale.
  - Consistent spacing / border-radius tokens.
- [x] **T7.5** Create `scripts/seed.ts`:
  - Creates: 1 SuperAdmin, 3 Companies (1 pending), 10 JobSeekers, 15 Jobs (mix of active/expired/closed), 20 Applications, 10 SavedJobs, 5 CompanyFollows.
  - Idempotent: check before inserting (e.g. skip if superadmin email exists).
  - Add `"seed": "tsx scripts/seed.ts"` to `package.json` scripts.
  - Install `tsx` as dev dependency if not present.
- [x] **T7.6** Update `next.config.ts`:
  - Add `serverExternalPackages: ['mongoose']` to prevent Turbopack from trying to bundle Mongoose.
  - Add `images.remotePatterns` if needed.
- [x] **T7.7** Run `npm run build` and fix all TypeScript errors and Turbopack warnings.
- [x] **T7.8** Manual QA walkthrough:
  - [x] SuperAdmin: login → stats → approve company → suspend user → audit log.
  - [x] Company: login → complete profile → post job → view applicants → approve/reject.
  - [x] JobSeeker: signup → onboarding → feed (ranked) → search → apply → notifications.
  - [x] Notification bell: verify polling and read state.
- [x] **T7.9** Update `README.md` with full setup and seed instructions.
- [x] **T7.10** Remove the health check route (`/api/health`) or gate it behind admin auth.
