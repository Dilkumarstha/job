# HireHub — Requirements Specification

> **Notation**: Acceptance criteria follow the EARS (Easy Approach to Requirements Syntax) patterns:
> - **Ubiquitous**: The \<system\> shall \<action\>.
> - **Event-driven**: When \<trigger\>, the \<system\> shall \<action\>.
> - **State-driven**: While \<state\>, the \<system\> shall \<action\>.
> - **Conditional**: If \<condition\>, the \<system\> shall \<action\>.
> - **Optional**: Where \<feature is included\>, the \<system\> shall \<action\>.

---

## Table of Contents

1. [General / Cross-Cutting](#1-general--cross-cutting)
2. [Phase 1 — Schema & DB Connection](#2-phase-1--schema--db-connection)
3. [Phase 2 — Auth & RBAC](#3-phase-2--auth--rbac)
   - 3.1 [JobSeeker Stories](#31-jobseeker--auth)
   - 3.2 [Company Stories](#32-company--auth)
   - 3.3 [SuperAdmin Stories](#33-superadmin--auth)
4. [Phase 3 — SuperAdmin Panel](#4-phase-3--superadmin-panel)
5. [Phase 4 — Company Features](#5-phase-4--company-features)
6. [Phase 5 — JobSeeker Features](#6-phase-5--jobseeker-features)
7. [Phase 6 — Notifications](#7-phase-6--notifications)
8. [Phase 7 — Polish](#8-phase-7--polish)

---

## 1. General / Cross-Cutting

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| G-01 | As any user, I want all pages to be accessible on mobile and desktop so I can use the platform on any device. | The system shall render a responsive layout on viewports from 320 px to 1920 px wide. |
| G-02 | As any user, I want form validation errors to be shown inline so I know what to fix before submitting. | When a form is submitted with invalid data, the system shall display a per-field error message adjacent to the invalid field without a full-page reload. |
| G-03 | As any user, I want HTTP error responses to carry a machine-readable code and a human-readable message. | The system shall return JSON `{ error: string, code: string }` for all 4xx and 5xx API responses. |
| G-04 | As a developer, I want all API route inputs validated with Zod so that invalid requests are rejected before hitting the database. | The system shall return HTTP 400 with a Zod-formatted error when request body or query params fail schema validation. |
| G-05 | As any user, I want loading states shown during async operations so the UI never appears frozen. | While an async operation is pending, the system shall display a skeleton or spinner in place of the loading content. |
| G-06 | As any user, I want empty states shown when a list has no items so I understand there is no data yet. | When a list query returns zero results, the system shall render an empty-state illustration with descriptive text. |

---

## 2. Phase 1 — Schema & DB Connection

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| DB-01 | As a developer, I want a cached Mongoose connection helper so the DB connection is reused across serverless invocations and hot-reloads. | The system shall export a `connectDB()` function from `lib/db.ts` that caches the Mongoose connection on the Node.js global object and opens a new connection only when none exists. |
| DB-02 | As a developer, I want all Mongoose models defined in a single `models/` directory so they are easy to locate. | The system shall define one file per model under `src/models/`, each exporting a typed Mongoose model. |
| DB-03 | As a developer, I want the MongoDB connection string read from an environment variable so credentials are never hard-coded. | The system shall read `MONGODB_URI` from the environment and throw a descriptive error at startup if it is absent. |
| DB-04 | As a developer, I want uniqueness and relationship constraints enforced at the Mongoose level. | The system shall define compound unique indexes on `Application(jobId, seekerId)`, `SavedJob(seekerId, jobId)`, and `CompanyFollow(seekerId, companyId)`; and ObjectId references for all cross-collection relations. |

---

## 3. Phase 2 — Auth & RBAC

### 3.1 JobSeeker — Auth

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| JS-A01 | As a visitor, I want to register as a JobSeeker with my email and password so I can access seeker features. | When the signup form is submitted with a unique email and a password ≥ 8 characters, the system shall create a User record with `role = JOBSEEKER`, hash the password with bcrypt (rounds ≥ 12), and redirect to the onboarding page. |
| JS-A02 | As a visitor, I want to log in with my email and password. | When valid credentials are submitted, the system shall create a JWT session and redirect to the seeker dashboard. When credentials are invalid, the system shall return a generic "Invalid email or password" error (no field-level distinction). |
| JS-A03 | As a logged-in JobSeeker, I want to log out so my session ends. | When I click "Log out", the system shall invalidate the JWT session cookie and redirect to the home page. |
| JS-A04 | As a suspended JobSeeker, I want to see a suspension notice when I try to log in. | While a user's `status = SUSPENDED` and `suspendedUntil > now`, the system shall deny login and display the suspension reason and expiry date. |

### 3.2 Company — Auth

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| CO-A01 | As a company representative, I want to register a company account so I can post jobs. | When the company signup form is submitted, the system shall create a User with `role = COMPANY`, `status = PENDING_APPROVAL`, and a linked CompanyProfile record. The user shall be shown a message explaining that their account awaits SuperAdmin approval. |
| CO-A02 | As a company with `PENDING_APPROVAL` status, I want to be blocked from posting jobs until approved. | While a company's `status = PENDING_APPROVAL`, the system shall return HTTP 403 if any job-posting API is called, and shall display a banner in the company dashboard stating the account is awaiting approval. |
| CO-A03 | As an approved company, I want to log in and access my dashboard. | When a company with `status = ACTIVE` logs in with valid credentials, the system shall start a JWT session with `role = COMPANY` and redirect to `/company/dashboard`. |

### 3.3 SuperAdmin — Auth

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| SA-A01 | As the SuperAdmin, I want my account to be seeded at startup so there is always an admin. | The system shall support a seed script that creates one User with `role = SUPERADMIN` if no SUPERADMIN exists. |
| SA-A02 | As a SuperAdmin, I want role-protected routes enforced on the server. | The system shall check the JWT session role in `proxy.ts`; if the session is absent or the role does not match the route group (`/admin`, `/company`, `/seeker`), the system shall redirect to the relevant login page. |

---

## 4. Phase 3 — SuperAdmin Panel

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| SA-01 | As a SuperAdmin, I want a dashboard showing platform stats so I can monitor activity. | The system shall display total JobSeekers, total Companies (pending / active), total Jobs (active / expired), total Applications, and recent signups (last 7 days) on `/admin/dashboard`. |
| SA-02 | As a SuperAdmin, I want to list all users with search and role/status filters. | The system shall render a paginated table of users on `/admin/users`, filterable by `role` and `status`, and searchable by `email` or name (case-insensitive prefix match). |
| SA-03 | As a SuperAdmin, I want to approve or reject a newly registered company account. | When I click "Approve", the system shall set the company's `status = ACTIVE` and create a notification for the company. When I click "Reject", the system shall set `status = SUSPENDED`, require a rejection reason, and create a notification for the company. |
| SA-04 | As a SuperAdmin, I want to suspend a user with a reason and optional duration so misbehaving users are temporarily blocked. | When I submit a suspension, the system shall set `status = SUSPENDED`, store `suspendedReason`, and set `suspendedUntil` to the chosen date (or `null` for indefinite). |
| SA-05 | As a SuperAdmin, I want suspended users to be automatically reactivated when their suspension expires. | When a login attempt is made by a user whose `suspendedUntil < now`, the system shall set `status = ACTIVE`, clear `suspendedUntil` and `suspendedReason`, and allow login. |
| SA-06 | As a SuperAdmin, I want to soft-delete a user so the record is preserved for audit. | When I click "Delete user", the system shall set `deletedAt = now` on the User record. The system shall exclude users with `deletedAt != null` from all non-admin queries. |
| SA-07 | As a SuperAdmin, I want every admin action logged so I can audit changes. | The system shall insert an AuditLog record for each of the following admin actions: approve/reject company, suspend user, reactivate user, delete user. Each record shall store `adminId`, `action`, `targetUserId`, `reason`, and `createdAt`. |

---

## 5. Phase 4 — Company Features

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| CO-01 | As a Company, I want to edit my company profile so job seekers see accurate information. | The system shall allow updating `companyName`, `description`, `logoUrl`, `industry`, and `website` via a form on `/company/profile`. Changes shall be persisted to the CompanyProfile collection. |
| CO-02 | As a Company, I want to upload a company logo so my brand is visible. | When a PNG or JPEG file ≤ 2 MB is uploaded, the system shall save it to `public/uploads/logos/` and store the relative URL in `CompanyProfile.logoUrl`. |
| CO-03 | As a Company, I want to post a new job listing with all required fields. | The system shall accept `title`, `description`, `skillsRequired` (tag array), `category`, `experienceLevel`, `salaryMin`, `salaryMax`, `location`, `jobType`, and `deadline`. When any required field is missing, the system shall return a 400 error with the missing field(s) identified. |
| CO-04 | As a Company, I want to edit or close an existing job listing. | The system shall allow updating any job field or setting `status = CLOSED`. When `deadline < now`, the system shall automatically set `status = EXPIRED` at query time (filtered, not a scheduled job). |
| CO-05 | As a Company, I want to see a list of applicants for each job. | The system shall render a list of applicants per job on `/company/jobs/[jobId]/applicants`, showing seeker name, experience level, skills, resume link, and computed match score (descending order). |
| CO-06 | As a Company, I want to approve or reject an applicant with a required message so the seeker is informed. | When I select "Approve" or "Reject" and submit a non-empty message, the system shall update `Application.status` to `APPROVED` or `REJECTED`, store `Application.message`, and create a notification for the seeker. |
| CO-07 | As a Company, I want expired/closed jobs to remain visible in my dashboard but hidden from seekers. | While a job's `deadline < now` OR `status = CLOSED`, the system shall exclude that job from all seeker-facing job feed and search queries, but include it in company-facing and admin-facing queries. |

---

## 6. Phase 5 — JobSeeker Features

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| JS-01 | As a new JobSeeker, I want an onboarding step to choose my interests and skills before accessing my feed. | When a user with `role = JOBSEEKER` logs in for the first time (SeekerProfile has no `interests`), the system shall redirect to `/seeker/onboarding` and block access to `/seeker/feed` until the step is completed. |
| JS-02 | As a JobSeeker, I want to complete my profile with bio, skills, experience, and resume. | The system shall allow updating all SeekerProfile fields via `/seeker/profile`. When a PDF file ≤ 5 MB is uploaded, the system shall save it to `public/uploads/resumes/` and store the URL in `SeekerProfile.resumeUrl`. |
| JS-03 | As a JobSeeker, I want a personalized job feed ranked by match score so I see the most relevant jobs first. | The system shall fetch active, non-expired jobs and rank them using the Match Score Algorithm (see design.md §5). Jobs shall be sorted descending by score on `/seeker/feed`. |
| JS-04 | As a JobSeeker, I want to search and filter jobs by keyword, location, category, salary range, and experience level. | When filter parameters are submitted, the system shall apply all active filters simultaneously and return matching active, non-expired jobs. |
| JS-05 | As a JobSeeker, I want to apply to a job with one click (and not be able to apply twice). | When I click "Apply", the system shall create one Application record. If an Application with `(jobId, seekerId)` already exists, the system shall return HTTP 409 and display "You have already applied to this job." |
| JS-06 | As a JobSeeker, I want to save/favourite a job so I can return to it later. | When I click "Save", the system shall create a SavedJob record. If one already exists, the system shall toggle it off (delete). The saved state shall be reflected visually. |
| JS-07 | As a JobSeeker, I want to follow a company so I am notified of new job posts. | When I click "Follow" on a company, the system shall create a CompanyFollow record. When I click "Unfollow", the system shall delete it. |
| JS-08 | As a JobSeeker, I want a "My Applications" page showing each application's status and the company's message if any. | The system shall list all my Applications on `/seeker/applications`, showing job title, company name, `appliedAt`, current status, and `message` if `status = APPROVED` or `status = REJECTED`. |

---

## 7. Phase 6 — Notifications

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| N-01 | As a JobSeeker, I want to be notified when my application status changes. | When a company sets an application to `APPROVED` or `REJECTED`, the system shall create a Notification for the seeker with `type = APPLICATION_STATUS_CHANGED` and a message including the job title and new status. |
| N-02 | As a JobSeeker, I want to be notified when a company I follow posts a new job. | When a company posts a new job, the system shall create a Notification for each seeker who follows that company with `type = NEW_JOB_POSTED`. |
| N-03 | As any user, I want to be notified when my account is suspended or reactivated. | When a SuperAdmin suspends a user, the system shall create a Notification with `type = ACCOUNT_SUSPENDED` including the reason. When the suspension expires and the account is reactivated, the system shall create a Notification with `type = ACCOUNT_REACTIVATED`. |
| N-04 | As any user, I want a notification bell in the navbar showing the count of unread notifications. | The system shall display a badge on the notification bell icon with the count of `read = false` notifications. The count shall be refreshed by polling every 30 seconds. |
| N-05 | As any user, I want to mark notifications as read. | When I open the notification panel, the system shall set `read = true` on all displayed notifications and the unread count shall reset to 0. |

---

## 8. Phase 7 — Polish

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| P-01 | As a developer/demo user, I want a seed script that populates realistic dummy data. | The system shall provide a `scripts/seed.ts` that creates at least 1 SuperAdmin, 3 Companies (1 pending), 10 JobSeekers, 15 Jobs (mix of active/expired/closed), 20 Applications, 10 SavedJobs, and 5 CompanyFollows. The script shall be idempotent (safe to run multiple times). |
| P-02 | As a user, I want consistent loading states on all data-fetching pages. | The system shall add a `loading.tsx` or Suspense fallback to every route segment that fetches data from the database. |
| P-03 | As a user, I want all forms to show real-time Zod validation feedback. | The system shall integrate React Hook Form + Zod resolver on every form; errors shall appear on field blur and on submit attempt. |
| P-04 | As a user, I want the UI to be visually consistent and polished with Tailwind CSS. | The system shall use a consistent design system (color palette, spacing scale, typography) defined in `globals.css` using Tailwind v4 CSS custom properties. |
