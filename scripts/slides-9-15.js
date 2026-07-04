// Slides 9–15
const { pptx, C, F, img, whiteBg, addHeader, addFooter,
        addCard, pill, divider, addStat, addBar,
        addStepCard, addBanner } = require("./make-pptx");

module.exports = function addSlides9to15() {

  // ── Slide 9 · Feasibility Analysis ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Feasibility Analysis"); addFooter(s, 9);

    const areas = [
      ["TECHNICAL FEASIBILITY", C.teal, [
        "Next.js 16 App Router is production-ready with comprehensive documentation",
        "MongoDB Atlas free tier provides sufficient capacity for development and demo",
        "Auth.js v5 delivers stable JWT authentication for the Next.js App Router",
        "Tailwind CSS v4 CSS-first configuration reduces boilerplate significantly",
        "All selected libraries are actively maintained with large developer communities",
      ]],
      ["OPERATIONAL FEASIBILITY", C.tealMid, [
        "Three-role system maps directly to real-world hiring portal workflows",
        "Admin panel enables content moderation without requiring direct database access",
        "Idempotent seed script enables reproducible demo data for any evaluator",
        "Environment variable configuration supports any cloud deployment target",
      ]],
      ["ECONOMIC FEASIBILITY", C.teal, [
        "Zero-cost stack: MongoDB Atlas free tier and Vercel free hosting tier",
        "No paid APIs or third-party services required at MVP stage",
        "Cloud storage integrates without any call-site code changes",
        "All libraries are open-source with no licensing costs",
      ]],
    ];

    areas.forEach(([label, color, bullets], i) => {
      const y = 0.88 + i * 2.12;
      s.addShape(pptx.ShapeType.rect, {
        x: 0.22 + 0.04, y: y + 0.04, w: 12.89, h: 1.94,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 0.22, y, w: 12.89, h: 1.94,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 0.22, y, w: 12.89, h: 0.06,
        fill: { color: color }, line: { color: color },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 0.22, y: y + 0.06, w: 0.06, h: 1.88,
        fill: { color: color }, line: { color: color },
      });
      pill(s, 0.38, y + 0.13, label, color);
      s.addText(
        bullets.map(b => ({ text: b, options: { bullet: { type: "bullet", code: "25AA", color: color } } })),
        { x: 0.38, y: y + 0.5, w: 12.55, h: 1.36,
          fontSize: 10, color: C.dark, fontFace: F.body, lineSpacingMultiple: 1.4 }
      );
    });
  }

  // ── Slide 10 · System Architecture ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "System Architecture"); addFooter(s, 10);

    addBanner(s, 0.88,
      "ARCHITECTURE OVERVIEW",
      "Browser  →  Next.js 16 App Router  →  proxy.ts (RBAC)  →  Server Actions / Route Handlers  →  Mongoose  →  MongoDB Atlas",
      C.teal
    );

    const layers = [
      ["PRESENTATION",   "React Server and Client Components · Tailwind CSS v4 · Framer Motion animations"],
      ["AUTH AND PROXY", "Auth.js v5 JWT strategy · proxy.ts RBAC enforcement (Node.js runtime, not edge)"],
      ["BUSINESS LOGIC", "Server Actions in src/actions/ · Match Score algorithm · Zod validation schemas"],
      ["DATA ACCESS",    "Mongoose ODM · connectDB() cached connection helper · Compound indexes"],
      ["DATABASE",       "MongoDB Atlas · Nine collections · Soft deletes on users · Cascade on company"],
      ["FILE STORAGE",   "Local public/uploads/ at MVP · Swap-ready interface in src/lib/upload.ts for S3"],
    ];

    layers.forEach(([title, desc], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.22 + col * 6.56, y = 2.1 + row * 1.72;
      s.addShape(pptx.ShapeType.rect, {
        x: x + 0.04, y: y + 0.04, w: 6.28, h: 1.56,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y, w: 6.28, h: 1.56,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y, w: 6.28, h: 0.06,
        fill: { color: C.teal }, line: { color: C.teal },
      });
      s.addShape(pptx.ShapeType.rect, {
        x, y: y + 0.06, w: 0.06, h: 1.5,
        fill: { color: C.teal }, line: { color: C.teal },
      });
      pill(s, x + 0.16, y + 0.14, title, C.teal);
      divider(s, x + 0.16, y + 0.54, 5.96);
      s.addText(desc, {
        x: x + 0.16, y: y + 0.62, w: 6.0, h: 0.86,
        fontSize: 9.5, color: C.dark, fontFace: F.body, lineSpacingMultiple: 1.35,
      });
    });
  }

  // ── Slide 11 · Component Diagram ──────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Component Diagram"); addFooter(s, 11);

    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 12.89, h: 6.18,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 12.89, h: 0.06,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    const cImg = img("component-diagram.png");
    if (cImg) {
      s.addImage({ path: cImg, x: 0.3, y: 0.94, w: 12.73, h: 6.0,
        sizing: { type: "contain", w: 12.73, h: 6.0 } });
    } else {
      s.addText("Place  component-diagram.png  in the  docs/  folder", {
        x: 0.3, y: 3.6, w: 12.73, h: 0.6, fontSize: 13, color: C.gray,
        align: "center", fontFace: F.body,
      });
    }
  }

  // ── Slide 12 · Deployment Diagram ─────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Deployment Diagram"); addFooter(s, 12);

    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 12.89, h: 6.18,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 12.89, h: 0.06,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    const dImg = img("deployment-diagram.png");
    if (dImg) {
      s.addImage({ path: dImg, x: 0.3, y: 0.94, w: 12.73, h: 6.0,
        sizing: { type: "contain", w: 12.73, h: 6.0 } });
    } else {
      s.addText("Place  deployment-diagram.png  in the  docs/  folder", {
        x: 0.3, y: 3.6, w: 12.73, h: 0.6, fontSize: 13, color: C.gray,
        align: "center", fontFace: F.body,
      });
    }
  }

  // ── Slide 13 · Database Design ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Database Design — ER Diagram"); addFooter(s, 13);

    // diagram frame
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 7.9, h: 6.18,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.86, w: 7.9, h: 0.06,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    const erImg = img("er-diagram.png");
    if (erImg) {
      s.addImage({ path: erImg, x: 0.3, y: 0.94, w: 7.74, h: 6.0,
        sizing: { type: "contain", w: 7.74, h: 6.0 } });
    } else {
      s.addText("Place  er-diagram.png  in the  docs/  folder", {
        x: 0.3, y: 3.6, w: 7.74, h: 0.6, fontSize: 12, color: C.gray,
        align: "center", fontFace: F.body,
      });
    }

    // right: collection list
    const cols = [
      ["User",           "email · role · status · passwordHash"],
      ["SeekerProfile",  "skills[ ]  · interests[ ]  · resumeUrl"],
      ["CompanyProfile", "companyName · logoUrl · verified"],
      ["Job",            "title · category · skillsRequired[ ] · deadline"],
      ["Application",    "jobId · seekerId · status · coverLetter"],
      ["SavedJob",       "seekerId  ·  jobId"],
      ["CompanyFollow",  "seekerId  ·  companyId"],
      ["Notification",   "userId · type · message · read"],
      ["AuditLog",       "adminId · action · targetUserId · reason"],
    ];
    cols.forEach(([name, fields], i) => {
      const ac = i % 2 === 0 ? C.teal : C.tealMid;
      const y = 0.86 + i * 0.72;
      s.addShape(pptx.ShapeType.rect, {
        x: 8.36, y: y + 0.04, w: 4.77, h: 0.62,
        fill: { color: C.border }, line: { color: C.border },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 8.32, y, w: 4.77, h: 0.62,
        fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 8.32, y, w: 0.06, h: 0.62,
        fill: { color: ac }, line: { color: ac },
      });
      s.addText(name, {
        x: 8.46, y: y + 0.06, w: 1.6, h: 0.26,
        fontSize: 9.5, bold: true, color: C.dark, fontFace: F.body,
      });
      s.addText(fields, {
        x: 8.46, y: y + 0.32, w: 4.52, h: 0.24,
        fontSize: 8.5, color: C.gray, fontFace: F.mono,
      });
    });
  }

  // ── Slide 14 · Algorithms / Core Logic ───────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Algorithms and Core Logic"); addFooter(s, 14);

    // formula banner
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.88, w: 12.89, h: 1.68,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.88, w: 12.89, h: 0.06,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 0.94, w: 0.06, h: 1.62,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    pill(s, 0.38, 0.98, "MATCH SCORE ALGORITHM  —  src/lib/matchScore.ts", C.teal);
    s.addText(
      "score  =  0.35 × categoryMatch  +  0.30 × skillOverlap  +  0.10 × locationMatch\n" +
      "        +  0.10 × experienceMatch  +  0.10 × recencyBoost  +  0.05 × followBoost",
      {
        x: 0.38, y: 1.3, w: 12.6, h: 1.18,
        fontSize: 13, bold: true, color: C.tealDark,
        fontFace: F.mono, lineSpacingMultiple: 1.5,
      }
    );

    // left: weight bars
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 2.74, w: 6.28, h: 4.12,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0.22, y: 2.74, w: 6.28, h: 0.06,
      fill: { color: C.teal }, line: { color: C.teal },
    });
    pill(s, 0.38, 2.86, "WEIGHT BREAKDOWN", C.teal);
    divider(s, 0.38, 3.24, 5.96);

    const weights = [
      ["Category Match",         0.35, "35%", C.teal],
      ["Skill Overlap (Jaccard)", 0.30, "30%", C.tealMid],
      ["Location Match",         0.10, "10%", C.teal],
      ["Experience Match",       0.10, "10%", C.tealMid],
      ["Recency Boost",          0.10, "10%", C.teal],
      ["Follow Boost",           0.05, "5%",  C.tealMid],
    ];
    weights.forEach(([label, pct, val, color], i) => {
      addBar(s, 0.38, 3.34 + i * 0.58, 5.96, pct, label, val, color);
    });

    // right: component table
    s.addShape(pptx.ShapeType.rect, {
      x: 6.72, y: 2.74, w: 6.39, h: 4.12,
      fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 6.72, y: 2.74, w: 6.39, h: 0.06,
      fill: { color: C.tealMid }, line: { color: C.tealMid },
    });
    pill(s, 6.88, 2.86, "COMPONENT DEFINITIONS", C.tealMid);
    divider(s, 6.88, 3.24, 6.06);

    const comps = [
      ["categoryMatch",   "{0, 1}",    "1 if job.category is in seeker.interests, else 0"],
      ["skillOverlap",    "[0, 1]",    "Jaccard: |A ∩ B| / |A ∪ B| on lowercased skill sets"],
      ["locationMatch",   "{0, 0.5, 1}","1 exact match, 0.5 remote job, 0 mismatch"],
      ["experienceMatch", "{0, 0.5, 1}","1 exact level, 0.5 adjacent, 0 for distant levels"],
      ["recencyBoost",    "(0, 1]",    "1 / (1 + daysSincePosted), decays towards 0 over time"],
      ["followBoost",     "{0, 1}",    "1 if seeker follows the posting company, else 0"],
    ];
    comps.forEach(([name, range, desc], i) => {
      const y = 3.34 + i * 0.58;
      const bg = i % 2 === 0 ? C.offWhite : C.white;
      s.addShape(pptx.ShapeType.rect, {
        x: 6.72, y, w: 6.39, h: 0.52,
        fill: { color: bg }, line: { color: C.border, pt: 1 },
      });
      s.addText(name,  { x: 6.84, y: y + 0.08, w: 1.62, h: 0.36, fontSize: 9, color: C.tealDark, fontFace: F.mono, bold: true });
      s.addText(range, { x: 8.52, y: y + 0.08, w: 1.0,  h: 0.36, fontSize: 9, color: C.teal,     fontFace: F.mono });
      s.addText(desc,  { x: 9.58, y: y + 0.08, w: 3.4,  h: 0.36, fontSize: 9, color: C.gray,     fontFace: F.body });
    });
  }

  // ── Slide 15 · Tools and Technologies ────────────────────────────────────────
  {
    const s = pptx.addSlide();
    whiteBg(s); addHeader(s, "Tools and Technologies"); addFooter(s, 15);

    const groups = [
      ["Frontend", [
        "Next.js 16.2 — App Router, Server and Client Components",
        "React 19 — UI rendering layer",
        "Tailwind CSS v4 — CSS-first, no config file required",
        "Framer Motion — page transitions and UI animations",
        "React Hook Form — performant form state management",
      ]],
      ["Backend and Server", [
        "Next.js Server Actions — form mutations with no boilerplate",
        "Next.js Route Handlers — REST-style API endpoints",
        "Auth.js v5 (NextAuth) — Credentials provider with JWT strategy",
        "bcryptjs — password hashing, rounds 12+, no native bindings",
        "Zod — runtime schema validation for all inputs",
      ]],
      ["Database", [
        "MongoDB Atlas — NoSQL cloud database, free tier",
        "Mongoose — ODM with typed schemas and indexes",
        "Nine collections with compound indexes for query performance",
        "Soft deletes on users, cascade logic on company deletion",
      ]],
      ["Development and Tooling", [
        "TypeScript — end-to-end type safety across the stack",
        "Turbopack — default bundler for both dev and build",
        "ESLint — linting configured with Next.js ruleset",
        "npm — package management and script runner",
        "Git — version control",
      ]],
    ];
    groups.forEach(([title, bullets], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      addCard(s, 0.22 + col * 6.56, 0.88 + row * 3.18, 6.28, 2.98, title, bullets);
    });
  }
};
