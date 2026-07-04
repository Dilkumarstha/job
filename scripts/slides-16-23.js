// Slides 16–23
const { pptx, C, F, img, whiteBg, addHeader, addFooter,
        addCard, pill, divider, addStat, addBanner } = require("./make-pptx");

module.exports = function addSlides16to23() {

  // ── Slide 16 · System Features ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "System Features"); addFooter(s, 16);

    const cols = [
      ["Job Seeker Features", [
        "Personalised job feed ranked by match score",
        "Advanced search and filter by location, category, salary, type",
        "One-click apply with cover letter and resume upload",
        "Application pipeline: Pending, Reviewed, Approved, Rejected",
        "Save and unsave job listings for later review",
        "Follow companies to receive new-job notifications",
        "Notification bell with unread count and read-all action",
        "Onboarding flow to capture skills and interests",
      ]],
      ["Company Features", [
        "Post, edit, and close job listings",
        "View all applicants ranked by match score",
        "Approve or reject applicants with a review message",
        "Company profile management with logo upload",
        "Dashboard with total jobs and applicant count statistics",
        "New-applicant badge for applications in last 24 hours",
        "Receive notification when a seeker applies",
      ]],
      ["Super Admin Features", [
        "Platform statistics dashboard for activity monitoring",
        "Paginated user list with search, role, and status filters",
        "Approve or reject pending company accounts",
        "Suspend users with a reason and optional expiry date",
        "Reactivate suspended users manually",
        "Soft-delete users while preserving audit records",
        "Full paginated audit log of every admin action",
      ]],
    ];
    cols.forEach(([title, bullets], i) => {
      addCard(s, 0.22 + i * 4.37, 0.88, 4.15, 5.98, title, bullets);
    });
  }

  // ── Slide 17 · Testing and Validation ─────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Testing and Validation"); addFooter(s, 17);

    addCard(s, 0.22, 0.88, 6.28, 2.88, "Unit Testing — Match Score Algorithm", [
      "Test file located at src/lib/matchScore.test.ts",
      "Tests: category hit and miss cases",
      "Tests: Jaccard similarity with empty and overlapping skill sets",
      "Tests: location exact match, remote job boost, and mismatch",
      "Tests: experience adjacency — exact 1.0, adjacent 0.5, far 0.0",
      "Tests: recency decay and followed-company boost",
    ]);

    addCard(s, 6.72, 0.88, 6.39, 2.88, "Input Validation — Zod", [
      "All form inputs validated server-side before any database write",
      "Auth schema: email format, password 8+ chars, role enum",
      "Job schema: required fields, future deadline, salary range",
      "Application schema: cover letter and phone format",
      "HTTP 400 returned with field-level error messages on failure",
    ], C.tealMid);

    addCard(s, 0.22, 3.96, 6.28, 2.88, "Manual and Functional Testing", [
      "All three user roles tested end-to-end using seeded demo data",
      "RBAC verified: unauthorized routes redirect to login correctly",
      "Suspension and auto-reactivation logic tested on each login",
      "File size and type restrictions validated at the server",
      "Unique constraint confirmed: one application per seeker per job",
    ]);

    addCard(s, 6.72, 3.96, 6.39, 2.88, "Database Integrity", [
      "Compound unique indexes prevent duplicate applications",
      "SavedJob and CompanyFollow uniqueness enforced at database level",
      "Cascade deletes: removing a company removes jobs and applications",
      "Soft deletes: users excluded from all non-admin queries",
      "Seed script is idempotent — safe to run multiple times",
    ], C.tealMid);
  }

  // ── Slide 18 · Result Analysis ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Result Analysis"); addFooter(s, 18);

    const stats = [
      ["9",  "Collections",        C.teal],
      ["7",  "Notification Types", C.tealMid],
      ["6",  "Algorithm Signals",  C.teal],
      ["3",  "User Roles",         C.tealMid],
      ["7",  "Dev Phases",         C.teal],
      ["20", "Seed Applications",  C.tealMid],
    ];
    stats.forEach(([num, label, color], i) => {
      addStat(s, 0.22 + i * 2.18, 0.88, 2.06, 1.62, num, label, color);
    });

    pill(s, 0.22, 2.7, "FEATURE COMPLETION STATUS", C.teal);

    const rows = [
      ["Feature",                  "Status",    "Notes"],
      ["Auth and JWT (3 roles)",   "Complete",  "Credentials + JWT, role and status in token"],
      ["RBAC via proxy.ts",        "Complete",  "Admin, Company, Seeker routes enforced"],
      ["Job Posting and CRUD",     "Complete",  "Full lifecycle: Active, Expired, Closed"],
      ["Match-Score Feed",         "Complete",  "Six-signal weighted algorithm, sorted desc"],
      ["Application Pipeline",     "Complete",  "Approve and reject with seeker notifications"],
      ["Admin Panel",              "Complete",  "Stats, users, companies, audit log"],
      ["Notification System",      "Complete",  "Seven event types, 30-second polling"],
      ["File Uploads",             "Complete",  "PDF resume 5 MB, PNG or JPEG logo 2 MB"],
      ["Responsive UI",            "Complete",  "Tested 320 px to 1920 px, Tailwind v4"],
    ];
    const cW = [4.0, 1.9, 6.88];
    const cX = [0.22, 4.27, 6.22];

    rows.forEach((row, ri) => {
      const y = 3.08 + ri * 0.43;
      const isHead = ri === 0;
      const bg = isHead ? C.tealDark : ri % 2 === 0 ? C.offWhite : C.white;
      const tc = isHead ? C.white : C.dark;

      row.forEach((cell, ci) => {
        s.addShape(pptx.ShapeType.rect, {
          x: cX[ci], y, w: cW[ci], h: 0.39,
          fill: { color: bg }, line: { color: C.border, pt: 1 },
        });
        if (isHead && ci === 0) {
          s.addShape(pptx.ShapeType.rect, {
            x: cX[0], y, w: 0.06, h: 0.39,
            fill: { color: C.tealMid }, line: { color: C.tealMid },
          });
        }
        if (ci === 1 && !isHead) {
          s.addShape(pptx.ShapeType.rect, {
            x: cX[1] + 0.08, y: y + 0.09, w: 1.55, h: 0.22,
            fill: { color: C.tealLight }, line: { color: C.teal, pt: 1 },
          });
          s.addText(cell, {
            x: cX[1] + 0.08, y: y + 0.09, w: 1.55, h: 0.22,
            fontSize: 8.5, bold: true, color: C.teal,
            fontFace: F.mono, align: "center", valign: "middle",
          });
        } else {
          s.addText(cell, {
            x: cX[ci] + 0.1, y: y + 0.04, w: cW[ci] - 0.16, h: 0.31,
            fontSize: 9.5, color: tc, bold: isHead,
            fontFace: isHead ? F.mono : F.body, valign: "middle",
          });
        }
      });
    });
  }

  // ── Slide 19 · Risks and Challenges ──────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Risks and Challenges"); addFooter(s, 19);
    pill(s, 0.22, 0.9, "CHALLENGES ENCOUNTERED AND HOW EACH WAS RESOLVED", C.teal);

    const challenges = [
      ["Next.js 16 Breaking Changes",  "proxy.ts replaced middleware.ts; cookies, headers, and params are now all async; Turbopack became the default bundler — resolved by following the official migration documentation"],
      ["Auth.js v5 Beta API",          "JWT callbacks, session shape, and provider config all changed from v4 — resolved by reading the official Auth.js v5 migration guide step by step"],
      ["Edge Runtime Incompatibility", "proxy.ts must run on Node.js runtime only — Mongoose is incompatible with the edge runtime; resolved by removing the edge configuration entirely"],
      ["MongoDB Atlas Free-Tier",      "512 MB storage limit and serverless connection-pool limits — mitigated by caching the Mongoose connection on the Node.js global object"],
      ["File Storage Scalability",     "Local uploads do not scale past a single server — resolved by designing src/lib/upload.ts as a swap-ready abstraction for S3 or Cloudinary"],
      ["Algorithm Cold Start",         "Match score requires a populated profile — resolved with an onboarding gate that redirects new seekers before they can access the feed"],
    ];

    challenges.forEach(([title, desc], i) => {
      const y = 1.3 + i * 1.0;
      s.addShape(pptx.ShapeType.rect, {
        x: 0.26, y: y + 0.04, w: 12.85, h: 0.88,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 0.22, y, w: 12.85, h: 0.88,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      const ac = i % 2 === 0 ? C.teal : C.tealMid;
      s.addShape(pptx.ShapeType.rect, {
        x: 0.22, y, w: 0.06, h: 0.88,
        fill: { color: ac }, line: { color: ac },
      });
      // number badge
      s.addShape(pptx.ShapeType.rect, {
        x: 0.36, y: y + 0.2, w: 0.46, h: 0.46,
        fill: { color: C.tealLight }, line: { color: ac, pt: 1 },
      });
      s.addText(`${i + 1}`, {
        x: 0.36, y: y + 0.2, w: 0.46, h: 0.46,
        fontSize: 11, bold: true, color: ac,
        fontFace: F.mono, align: "center", valign: "middle",
      });
      s.addText(title, {
        x: 0.96, y: y + 0.08, w: 3.9, h: 0.34,
        fontSize: 10.5, bold: true, color: C.dark, fontFace: F.title,
      });
      // vertical divider
      s.addShape(pptx.ShapeType.rect, {
        x: 4.94, y: y + 0.14, w: 0.02, h: 0.6,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addText(desc, {
        x: 5.06, y: y + 0.1, w: 7.88, h: 0.68,
        fontSize: 9.5, color: C.gray, fontFace: F.body,
        valign: "middle", lineSpacingMultiple: 1.3,
      });
    });
  }

  // ── Slide 20 · Conclusion ─────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Conclusion"); addFooter(s, 20);

    addBanner(s, 0.88,
      "PROJECT SUMMARY",
      "HireHub successfully delivers a full-stack job portal with three user roles, server-side RBAC, and a weighted match-score algorithm. All planned features across Phases 1 through 7 are implemented and validated. The system is production-ready at MVP level with proper input validation, compound database indexes, and a fully responsive interface.",
      C.teal
    );

    addCard(s, 0.22, 2.1, 6.28, 4.76, "Key Achievements", [
      "Weighted six-signal job ranking algorithm built for this domain",
      "Server-side RBAC enforcement via Next.js 16 proxy.ts",
      "End-to-end type safety: TypeScript, Zod, and Mongoose schemas",
      "Real-time notification system with seven distinct event types",
      "Audit logging for every admin action — compliance-ready design",
      "Idempotent seed script generating a full realistic dataset",
      "Swap-ready file upload abstraction for future cloud migration",
    ]);

    addCard(s, 6.72, 2.1, 6.39, 4.76, "Learning Outcomes", [
      "Next.js 16 App Router architecture and its breaking changes",
      "JWT session strategy and the Auth.js v5 migration process",
      "MongoDB document modelling and compound index design",
      "Content-based filtering and Jaccard similarity",
      "RBAC, soft deletes, and cascade logic in production code",
      "Agile iterative delivery across seven development phases",
      "Writing EARS-notation requirements and design documents",
    ], C.tealMid);
  }

  // ── Slide 21 · Future Enhancements ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Future Enhancements"); addFooter(s, 21);

    const items = [
      ["Cloud Storage",          "Replace local filesystem with AWS S3 or Cloudinary — only src/lib/upload.ts needs to change, no other files affected"],
      ["Email Notifications",    "Integrate Resend or SendGrid to deliver job alerts and application status updates directly to user inboxes"],
      ["Collaborative Filtering","Upgrade match score with user-user and item-item similarity once sufficient interaction data has accumulated"],
      ["Real-Time WebSockets",   "Replace 30-second polling with Socket.io or Server-Sent Events for instant notification delivery"],
      ["Admin Taxonomy Editor",  "Allow the Super Admin to create and manage job categories dynamically rather than using a static string array"],
      ["AI Resume Parsing",      "Use a large language model API to extract skills and experience from uploaded PDFs to auto-populate profiles"],
      ["Analytics Dashboard",    "Track job views, application funnel conversion rates, and seeker engagement over configurable time periods"],
      ["Mobile Application",     "Build a React Native app sharing the same API layer and authentication system as the web portal"],
    ];

    items.forEach(([title, desc], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.22 + col * 6.56, y = 0.88 + row * 1.62;
      const ac = i % 2 === 0 ? C.teal : C.tealMid;

      s.addShape(pptx.ShapeType.rect, {
        x: x + 0.04, y: y + 0.04, w: 6.28, h: 1.46,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y, w: 6.28, h: 1.46,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y, w: 6.28, h: 0.06,
        fill: { color: ac }, line: { color: ac },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y: y + 0.06, w: 0.06, h: 1.4,
        fill: { color: ac }, line: { color: ac },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: x + 0.06, y: y + 0.06, w: 6.22, h: 0.36,
        fill: { color: C.offWhite }, line: { color: C.border, pt: 1 },
      });
      s.addText(title, {
        x: x + 0.18, y: y + 0.06, w: 6.0, h: 0.36,
        fontSize: 10.5, bold: true, color: C.dark, fontFace: F.title, valign: "middle",
      });
      s.addText(desc, {
        x: x + 0.18, y: y + 0.5, w: 6.0, h: 0.88,
        fontSize: 9.5, color: C.gray, fontFace: F.body, lineSpacingMultiple: 1.35,
      });
    });
  }

  // ── Slide 22 · References ─────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "References"); addFooter(s, 22);

    const refs = [
      ["Next.js 16",        "App Router, Server Actions, proxy.ts. https://nextjs.org/docs"],
      ["Auth.js v5",        "Credentials Provider, JWT strategy. https://authjs.dev"],
      ["MongoDB Atlas",     "Atlas, Mongoose ODM, Compound Indexes. https://www.mongodb.com/docs"],
      ["Mongoose",          "Schema design, Model API, Indexing. https://mongoosejs.com/docs"],
      ["Tailwind CSS v4",   "CSS-first configuration. https://tailwindcss.com/docs"],
      ["Zod",               "TypeScript-first schema validation. https://zod.dev"],
      ["React Hook Form",   "Performant form state management. https://react-hook-form.com"],
      ["Jaccard (1912)",    "Distribution of flora in the alpine zone. New Phytologist, 11(2), 37–50."],
      ["Pazzani & Billsus", "Content-Based Recommendation Systems. The Adaptive Web, LNCS 4321, 2007."],
      ["EARS Notation",     "Mavin et al. Easy Approach to Requirements Syntax. IEEE RE, 2009."],
      ["Framer Motion",     "Production-ready animation library. https://www.framer.com/motion"],
      ["bcryptjs",          "Node.js bcrypt without native bindings. https://github.com/dcodeIO/bcrypt.js"],
    ];

    refs.forEach(([source, detail], i) => {
      const col = i < 6 ? 0 : 1;
      const row = i < 6 ? i : i - 6;
      const x = 0.22 + col * 6.56, y = 0.88 + row * 1.06;
      const ac = i % 2 === 0 ? C.teal : C.tealMid;

      s.addShape(pptx.ShapeType.rect, {
        x: x + 0.04, y: y + 0.04, w: 6.28, h: 0.92,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y, w: 6.28, h: 0.92,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y, w: 0.06, h: 0.92,
        fill: { color: ac }, line: { color: ac },
      });
      // number box
      s.addShape(pptx.ShapeType.rect, {
        x: x + 0.14, y: y + 0.22, w: 0.44, h: 0.44,
        fill: { color: C.tealLight }, line: { color: ac, pt: 1 },
      });
      s.addText(`${i + 1}`, {
        x: x + 0.14, y: y + 0.22, w: 0.44, h: 0.44,
        fontSize: 10, bold: true, color: ac,
        fontFace: F.mono, align: "center", valign: "middle",
      });
      s.addText(source, {
        x: x + 0.7, y: y + 0.1, w: 5.44, h: 0.32,
        fontSize: 10, bold: true, color: C.dark, fontFace: F.body,
      });
      s.addText(detail, {
        x: x + 0.7, y: y + 0.48, w: 5.44, h: 0.38,
        fontSize: 8.8, color: C.gray, fontFace: F.body,
      });
    });
  }

  // ── Slide 23 · Thank You ──────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.offWhite };

    // full-width teal header block (mirrors title slide)
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 3.6,
      fill: { color: C.tealDark }, line: { color: C.tealDark },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 3.6, w: "100%", h: 0.05,
      fill: { color: C.amber }, line: { color: C.amber },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.05, h: "100%",
      fill: { color: C.teal }, line: { color: C.teal },
    });

    s.addText("Thank You", {
      x: 0.5, y: 0.85, w: 12.3, h: 1.55,
      fontSize: 60, bold: true, color: C.white,
      fontFace: F.title, align: "center",
    });
    s.addText("Questions and Discussion Welcome", {
      x: 0.5, y: 2.48, w: 12.3, h: 0.46,
      fontSize: 16, color: "B2E8E2", fontFace: F.body, align: "center",
    });

    // white area below
    s.addText("Dilan Shrestha  ·  Department of Computer Science  ·  2026", {
      x: 0.5, y: 3.78, w: 12.3, h: 0.4,
      fontSize: 11, color: C.gray, fontFace: F.body, align: "center",
    });

    divider(s, 3.5, 4.28, 6.33);

    s.addText("HireHub — A Full-Stack Job Portal", {
      x: 0.5, y: 4.42, w: 12.3, h: 0.42,
      fontSize: 14, bold: true, color: C.tealDark,
      fontFace: F.title, align: "center",
    });

    const techs = ["Next.js 16", "MongoDB Atlas", "Auth.js v5", "Tailwind CSS v4", "TypeScript"];
    let px = 1.7;
    techs.forEach(t => { px += pill(s, px, 5.06, t, C.teal) + 0.22; });

    // footer
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
    pill(s, 12.18, 7.19, "23 / 23", C.teal);
  }
};
