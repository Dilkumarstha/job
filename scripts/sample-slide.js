// Sample slide — white background, teal accents
// Run: node scripts/sample-slide.js
// Output: sample-slide.pptx

const PptxGenJS = require("pptxgenjs");
const path = require("path");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  white    : "FFFFFF",
  offWhite : "F9FAFB",   // pure neutral page bg (no teal tint)
  tealDark : "0F4C4C",   // used ONLY for header bar text + table header bg
  teal     : "0D9488",   // teal accent — top strips, pips, pill borders
  tealMid  : "14B8A6",   // lighter teal — footer rule, stat tops
  tealLight: "F0FDFA",   // very faint teal — alternating table rows only
  tealPale : "F9FAFB",   // same as bg — "white" rows in table
  amber    : "F59E0B",   // amber dot in header (single warm pop)
  dark     : "111827",   // body text — near-black, no teal tint
  gray     : "6B7280",   // muted secondary text — pure neutral gray
  border   : "E5E7EB",   // card borders — neutral light gray
  cardBg   : "FFFFFF",   // card fill — pure white
  statBg   : "F3F4F6",   // stat bottom half — neutral light gray
};

const F = { title: "Trebuchet MS", body: "Calibri", mono: "Courier New" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** White slide background with a thin left teal rule */
function whiteBg(s) {
  s.background = { color: C.offWhite };
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.05, h: "100%",
    fill: { color: C.teal }, line: { color: C.teal },
  });
}

/** Header: white bar, dark-teal title, thin teal top strip, amber dot */
function addHeader(s, title) {
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.72,
    fill: { color: C.white }, line: { color: C.border, pt: 1 },
  });
  // thin teal top strip
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.05,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  // amber dot
  s.addShape(pptx.ShapeType.ellipse, {
    x: 0.28, y: 0.22, w: 0.26, h: 0.26,
    fill: { color: C.amber }, line: { color: C.amber },
  });
  // vertical rule
  s.addShape(pptx.ShapeType.rect, {
    x: 0.68, y: 0.14, w: 0.02, h: 0.44,
    fill: { color: C.border }, line: { color: C.border },
  });
  s.addText(title, {
    x: 0.85, y: 0.06, w: 12.1, h: 0.64,
    fontSize: 17, bold: true, color: C.tealDark,
    fontFace: F.title, valign: "middle",
  });
}

/** Footer: white bar, teal rule on top, page pill */
function addFooter(s, n) {
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
  // page pill
  s.addShape(pptx.ShapeType.rect, {
    x: 12.18, y: 7.19, w: 0.9, h: 0.26,
    fill: { color: C.tealLight }, line: { color: C.teal, pt: 1 },
  });
  s.addText(`${String(n).padStart(2, "0")} / 23`, {
    x: 12.18, y: 7.19, w: 0.9, h: 0.26,
    fontSize: 8, bold: true, color: C.teal,
    fontFace: F.mono, align: "center", valign: "middle",
  });
}

/** White card with teal top-accent bar and left pip */
function addCard(s, x, y, w, h, title, bullets, accentColor) {
  const ac = accentColor || C.teal;
  // subtle shadow
  s.addShape(pptx.ShapeType.rect, {
    x: x + 0.04, y: y + 0.04, w, h,
    fill: { color: C.border }, line: { color: C.border },
  });
  // card body
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
  });
  // thin top accent line (4px only — not a full bar)
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.06,
    fill: { color: ac }, line: { color: ac },
  });
  // title row (neutral gray bg)
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + 0.06, w, h: 0.36,
    fill: { color: C.offWhite }, line: { color: C.border, pt: 1 },
  });
  // left accent pip on title row
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + 0.06, w: 0.06, h: 0.36,
    fill: { color: ac }, line: { color: ac },
  });
  s.addText(title, {
    x: x + 0.16, y: y + 0.06, w: w - 0.24, h: 0.36,
    fontSize: 10.5, bold: true, color: C.dark,
    fontFace: F.title, valign: "middle",
  });
  // bullets
  s.addText(
    bullets.map(b => ({
      text: b,
      options: { bullet: { type: "bullet", code: "25AA", color: ac } },
    })),
    {
      x: x + 0.2, y: y + 0.5, w: w - 0.32, h: h - 0.62,
      fontSize: 10, color: C.dark, fontFace: F.body,
      valign: "top", lineSpacingMultiple: 1.45,
    }
  );
}

/** Small monospace label pill */
function pill(s, x, y, text, color) {
  const c = color || C.teal;
  const w = Math.max(text.length * 0.082 + 0.28, 0.7);
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.28,
    fill: { color: C.tealLight }, line: { color: c, pt: 1 },
  });
  s.addText(text, {
    x, y, w, h: 0.28,
    fontSize: 8, bold: true, color: c,
    fontFace: F.mono, align: "center", valign: "middle", charSpacing: 0.6,
  });
  return w;
}

/** Thin divider */
function divider(s, x, y, w) {
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.02,
    fill: { color: C.border }, line: { color: C.border },
  });
}

/** Big stat box — teal top strip with large number, neutral gray bottom with label */
function addStat(s, x, y, w, h, number, label, color) {
  const c = color || C.teal;
  // shadow
  s.addShape(pptx.ShapeType.rect, {
    x: x + 0.04, y: y + 0.04, w, h,
    fill: { color: C.border }, line: { color: C.border },
  });
  // card
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
  });
  // teal top strip (40% of height)
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: h * 0.42,
    fill: { color: c }, line: { color: c },
  });
  // number (white on teal)
  s.addText(number, {
    x, y: y + 0.06, w, h: h * 0.36,
    fontSize: 26, bold: true, color: C.white,
    fontFace: F.title, align: "center", valign: "middle",
  });
  // neutral gray bottom half
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + h * 0.42, w, h: h * 0.58,
    fill: { color: C.statBg }, line: { color: C.border, pt: 1 },
  });
  divider(s, x + 0.14, y + h * 0.42, w - 0.28);
  s.addText(label, {
    x, y: y + h * 0.46, w, h: h * 0.5,
    fontSize: 9, color: C.gray,
    fontFace: F.body, align: "center", valign: "middle", bold: true,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SAMPLE SLIDE — "Result Analysis" (slide 18 style)
// This gives you a feel for the layout: white bg, teal headers, clean cards
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  whiteBg(s);
  addHeader(s, "Result Analysis");
  addFooter(s, 18);

  // ── Six stat boxes ────────────────────────────────────────────────────────
  const stats = [
    ["9",  "Collections",        C.teal],
    ["7",  "Notification Types", C.tealMid],
    ["6",  "Algorithm Signals",  C.teal],
    ["3",  "User Roles",         C.tealMid],
    ["7",  "Dev Phases",         C.teal],
    ["20", "Seed Applications",  C.tealMid],
  ];
  stats.forEach(([num, label, color], i) => {
    addStat(s, 0.22 + i * 2.18, 0.86, 2.06, 1.62, num, label, color);
  });

  // ── Feature completion table ───────────────────────────────────────────────
  pill(s, 0.22, 2.68, "FEATURE COMPLETION STATUS", C.teal);

  const rows = [
    ["Feature",                "Status",    "Notes"],
    ["Auth and JWT",           "Complete",  "Credentials + JWT, role and status in token"],
    ["RBAC via proxy.ts",      "Complete",  "Admin, Company, Seeker routes enforced"],
    ["Job Posting and CRUD",   "Complete",  "Full lifecycle: Active, Expired, Closed"],
    ["Match-Score Feed",       "Complete",  "Six-signal weighted algorithm, sorted desc"],
    ["Application Pipeline",   "Complete",  "Approve and reject with notifications"],
    ["Admin Panel",            "Complete",  "Stats, users, companies, audit log"],
    ["Notification System",    "Complete",  "Seven event types, 30-second polling"],
    ["File Uploads",           "Complete",  "PDF resume 5 MB, PNG or JPEG logo 2 MB"],
    ["Responsive UI",          "Complete",  "Tested 320 px to 1920 px, Tailwind v4"],
  ];
  const cW = [4.0, 1.9, 6.88];
  const cX = [0.22, 4.27, 6.22];

  rows.forEach((row, ri) => {
    const y = 3.06 + ri * 0.43;
    const isHead = ri === 0;
    // header = dark teal, odd rows = pure white, even rows = very light gray
    const bg = isHead ? C.tealDark : ri % 2 === 0 ? C.offWhite : C.white;
    const tc = isHead ? C.white : C.dark;

    row.forEach((cell, ci) => {
      s.addShape(pptx.ShapeType.rect, {
        x: cX[ci], y, w: cW[ci], h: 0.39,
        fill: { color: bg }, line: { color: C.border, pt: 1 },
      });
      // header left teal pip
      if (isHead && ci === 0) {
        s.addShape(pptx.ShapeType.rect, {
          x: cX[0], y, w: 0.06, h: 0.39,
          fill: { color: C.tealMid }, line: { color: C.tealMid },
        });
      }
      // status column: small teal-outline pill (no fill)
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

// ─── Save ─────────────────────────────────────────────────────────────────────
const out = path.join(__dirname, "..", "sample-slide.pptx");
pptx.writeFile({ fileName: out }).then(() => {
  console.log(`\nSample saved: ${out}`);
  console.log("Open it, check the style, then tell me to apply to all 23 slides.");
});
