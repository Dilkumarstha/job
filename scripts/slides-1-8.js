// Slides 1–8
const { pptx, C, F, img, whiteBg, addHeader, addFooter,
        addCard, pill, divider, addStat, addStepCard, addBanner } = require("./make-pptx");

module.exports = function addSlides1to8() {

  // ── Slide 1 · Title ──────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.offWhite };

    // full-width teal header block
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 3.5,
      fill: { color: C.tealDark }, line: { color: C.tealDark },
    });
    // amber bottom rule on header
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 3.5, w: "100%", h: 0.05,
      fill: { color: C.amber }, line: { color: C.amber },
    });
    // thin left strip
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.05, h: "100%",
      fill: { color: C.teal }, line: { color: C.teal },
    });

    pill(s, 4.9, 0.55, "FINAL YEAR PROJECT DEFENSE", C.tealMid);

    s.addText("HireHub", {
      x: 0.5, y: 1.05, w: 12.3, h: 1.55,
      fontSize: 64, bold: true, color: C.white,
      fontFace: F.title, align: "center",
    });
    s.addText("A Full-Stack Job Portal", {
      x: 0.5, y: 2.65, w: 12.3, h: 0.52,
      fontSize: 18, color: "B2E8E2", fontFace: F.body, align: "center",
    });

    // white content area below header
    // meta row
    s.addText("Dilan Shrestha  ·  Department of Computer Science  ·  2026", {
      x: 0.5, y: 3.72, w: 12.3, h: 0.4,
      fontSize: 11, color: C.gray, fontFace: F.body, align: "center",
    });

    divider(s, 3.5, 4.22, 6.33);

    // three role cards
    const roles = [
      ["Job Seeker",  "Browse feed · Apply · Save · Follow",  C.teal],
      ["Company",     "Post jobs · Review · Approve / Reject", C.tealMid],
      ["Super Admin", "Manage users · Approve companies · Audit", C.tealDark],
    ];
    roles.forEach(([title, desc, color], i) => {
      const x = 0.38 + i * 4.33;
      s.addShape(pptx.ShapeType.rect, {
        x: x + 0.04, y: 4.4, w: 4.1, h: 1.5,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y: 4.4, w: 4.1, h: 1.5,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y: 4.4, w: 4.1, h: 0.06,
        fill: { color: color }, line: { color: color },
      });
      s.addText(title, {
        x: x + 0.15, y: 4.48, w: 3.8, h: 0.36,
        fontSize: 11, bold: true, color: C.dark, fontFace: F.title,
      });
      divider(s, x + 0.15, 4.86, 3.78);
      s.addText(desc, {
        x: x + 0.15, y: 4.94, w: 3.8, h: 0.82,
        fontSize: 10, color: C.gray, fontFace: F.body, lineSpacingMultiple: 1.4,
      });
    });

    // tech tags
    const techs = ["Next.js 16", "MongoDB Atlas", "Auth.js v5", "Tailwind CSS v4", "TypeScript"];
    let px = 1.7;
    techs.forEach(t => { px += pill(s, px, 6.2, t, C.teal) + 0.22; });

    // footer strip
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 7.16, w: "100%", h: 0.34,
      fill: { color: C.white }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 7.16, w: "100%", h: 0.03,
      fill: { color: C.tealMid }, line: { color: C.tealMid },
    });
    s.addText("HireHub  —  Final Year Project Defense", {
      x: 0.22, y: 7.2, w: 9, h: 0.26,
      fontSize: 8, color: C.gray, fontFace: F.body,
    });
    pill(s, 12.18, 7.19, "01 / 23", C.teal);
  }

  // ── Slide 2 · Introduction ────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Introduction"); addFooter(s, 2);

    addCard(s, 0.22, 0.88, 6.2, 5.98, "What is HireHub?", [
      "A full-stack job portal built as a university final-year project",
      "Three user roles: Job Seeker, Company, and Super Admin",
      "Intelligent weighted match-score algorithm ranks job listings per seeker",
      "JWT-based authentication enforced at the proxy layer via RBAC",
      "Built entirely on Next.js 16 — no separate backend service required",
      "Covers notifications, file uploads, audit logging, and onboarding",
    ]);

    const roles = [
      ["JOB SEEKER",  "Browse personalised feed  ·  Apply  ·  Save  ·  Follow companies", C.teal],
      ["COMPANY",     "Post jobs  ·  Review ranked applicants  ·  Approve or reject",      C.tealMid],
      ["SUPER ADMIN", "Approve companies  ·  Suspend users  ·  Full audit log",            C.tealDark],
    ];
    roles.forEach(([label, desc, color], i) => {
      const y = 0.88 + i * 2.0;
      s.addShape(pptx.ShapeType.rect, {
        x: 6.64, y: y + 0.04, w: 6.49, h: 1.76,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 6.6, y, w: 6.49, h: 1.76,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 6.6, y, w: 6.49, h: 0.06,
        fill: { color: color }, line: { color: color },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 6.6, y: y + 0.06, w: 0.06, h: 1.7,
        fill: { color: color }, line: { color: color },
      });
      pill(s, 6.8, y + 0.14, label, color);
      divider(s, 6.8, y + 0.54, 6.1);
      s.addText(desc, {
        x: 6.8, y: y + 0.64, w: 6.1, h: 0.96,
        fontSize: 10, color: C.dark, fontFace: F.body, lineSpacingMultiple: 1.45,
      });
    });
  }

  // ── Slide 3 · Problem Statement ───────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Problem Statement"); addFooter(s, 3);

    addBanner(s, 0.88,
      "CORE PROBLEM",
      "Job seekers waste hours browsing irrelevant listings with no personalisation. Employers manually review unranked applicants. Platform administrators lack tools to verify companies and moderate users — all within one cohesive system.",
      C.teal
    );

    addCard(s, 0.22, 2.1, 6.2, 4.68, "Pain Points — Job Seekers", [
      "No personalised job ranking or recommendation engine",
      "Cannot track application status in real time",
      "Hard to discover companies aligned with career interests",
      "No way to save favourite listings across sessions",
      "No structured onboarding to capture skills and interests",
    ]);

    addCard(s, 6.62, 2.1, 6.49, 4.68, "Pain Points — Employers and Admins", [
      "No automated applicant ranking by fit or skill overlap",
      "Manual, time-consuming shortlisting process",
      "No structured approve or reject workflow",
      "Admins cannot verify companies before they post jobs",
      "No audit trail for administrative actions",
    ]);
  }

  // ── Slide 4 · Objectives ──────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Objectives"); addFooter(s, 4);

    const objs = [
      ["01", "Role-Based Authentication",     "JWT sessions, Credentials provider, bcryptjs hashing, proxy.ts RBAC"],
      ["02", "Match-Score Algorithm",         "Weighted 6-signal content-based filtering using Jaccard similarity"],
      ["03", "Company Job Management",        "Full CRUD for jobs, applicant pipeline, approve and reject workflow"],
      ["04", "Super Admin Control Panel",     "Stats dashboard, user and company management, suspend, soft-delete, audit"],
      ["05", "Personalised Seeker Feed",      "Ranked feed, advanced search and filter, apply, save, follow companies"],
      ["06", "Notifications and File Uploads","Seven event types, 30-second polling, PDF resume, PNG or JPEG logo"],
      ["07", "Responsive Accessible UI",      "Tailwind CSS v4, mobile-first, tested from 320 px to 1920 px"],
      ["08", "Testing and Seed Script",       "Unit tests for algorithm, Zod validation, idempotent seed data script"],
    ];
    objs.forEach(([num, title, desc], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      addStepCard(s, 0.22 + col * 6.56, 0.88 + row * 1.6, 6.28, 1.44, num, title, desc, C.teal);
    });
  }

  // ── Slide 5 · Scope & Limitations ────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Scope and Limitations"); addFooter(s, 5);

    addCard(s, 0.22, 0.88, 6.2, 5.98, "In Scope", [
      "User registration, login, and role-based access control",
      "Job posting, editing, and status lifecycle management",
      "Personalised seeker feed with weighted match-score ranking",
      "Application submission and four-stage status pipeline",
      "Admin panel: statistics, user and company management",
      "In-app notification system with seven event types",
      "File uploads: PDF resumes and PNG or JPEG company logos",
      "Audit log recording every admin action",
      "Responsive layout from 320 px to 1920 px",
    ]);

    addCard(s, 6.62, 0.88, 6.49, 5.98, "Limitations and Out of Scope", [
      "No email delivery — all notifications are in-app only",
      "File storage uses local filesystem, not cloud storage",
      "No collaborative filtering — content-based approach only",
      "No real-time chat or direct messaging between users",
      "No payment, subscription, or premium tier features",
      "No native mobile application — web responsive only",
      "Job categories are static strings, no admin taxonomy editor",
      "No automated CV parsing — seeker fills profile manually",
    ], C.tealMid);
  }

  // ── Slide 6 · Development Methodology ────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Development Methodology"); addFooter(s, 6);

    addBanner(s, 0.88,
      "AGILE ITERATIVE — 7 PHASES",
      "Each phase delivers working, tested features before the next phase begins. Requirements are tracked using EARS notation acceptance criteria.",
      C.teal
    );

    const phases = [
      ["01", "Schema and DB",        "Mongoose models, DB connection helper, idempotent seed script"],
      ["02", "Auth and RBAC",        "JWT Credentials provider, proxy.ts route enforcement, auto-reactivation"],
      ["03", "Admin Panel",          "Statistics dashboard, user and company management, paginated audit log"],
      ["04", "Company Features",     "Job CRUD, applicant pipeline, match-score display, approve or reject"],
      ["05", "Seeker Features",      "Personalised ranked feed, search and filter, apply, save, follow"],
      ["06", "Notifications",        "Seven event types, 30-second polling handler, notification bell UI"],
      ["07", "Polish and Testing",   "Responsive layout, empty states, loading skeletons, unit tests"],
    ];
    phases.forEach(([num, title, desc], i) => {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      addStepCard(s, 0.22 + col * 6.56, 2.08 + row * 1.32, 6.28, 1.18, num, title, desc, C.teal);
    });
  }

  // ── Slide 7 · Requirement Analysis ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Requirement Analysis"); addFooter(s, 7);

    addCard(s, 0.22, 0.88, 4.05, 5.98, "Functional Requirements", [
      "User registration and authentication (3 roles)",
      "RBAC route-level access enforcement",
      "Job posting, editing, lifecycle management",
      "Personalised feed with match scoring",
      "Application submission and status tracking",
      "Admin: approve, reject, suspend, delete",
      "In-app notifications on key events",
      "File upload for resumes and logos",
      "Audit log for all admin actions",
    ]);

    addCard(s, 4.5, 0.88, 4.22, 2.9, "Non-Functional", [
      "Responsive: 320 px to 1920 px",
      "Secure: bcryptjs rounds 12+, JWT",
      "Performant: compound DB indexes",
      "Maintainable: modular Server Actions",
    ], C.tealMid);

    addCard(s, 4.5, 3.98, 4.22, 2.88, "Validation Rules", [
      "All inputs validated via Zod schemas",
      "HTTP 400 with field-level error messages",
      "One application per seeker per job",
      "File type and size enforced server-side",
    ], C.tealMid);

    addCard(s, 8.96, 0.88, 4.15, 5.98, "EARS Acceptance Criteria", [
      "WHEN signup submitted with unique email and 8+ char password, create JOBSEEKER user",
      "WHILE status is PENDING_APPROVAL, block job posting with HTTP 403",
      "WHEN admin approves company, set ACTIVE and notify the company user",
      "WHEN job is posted, notify all followers of the company",
      "WHEN suspendedUntil is before now on login, auto-reactivate the user",
      "IF file exceeds size limit, return HTTP 400 with error message",
    ], C.teal);
  }

  // ── Slide 8 · Use Case Diagram ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Use Case Diagram"); addFooter(s, 8);

    // diagram frame
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 12.89, h: 6.18,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 12.89, h: 0.06,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    const ucImg = img("use-case-diagram.png");
    if (ucImg) {
      s.addImage({ path: ucImg, x: 0.3, y: 0.94, w: 12.73, h: 6.0,
        sizing: { type: "contain", w: 12.73, h: 6.0 } });
    } else {
      s.addText("Place  use-case-diagram.png  in the  docs/  folder", {
        x: 0.3, y: 3.6, w: 12.73, h: 0.6,
        fontSize: 13, color: C.gray, align: "center", fontFace: F.body,
      });
    }
  }
};
