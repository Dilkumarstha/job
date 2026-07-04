// HireHub — Shared theme (white bg, reduced-teal accents)
const PptxGenJS = require("pptxgenjs");
const path = require("path");
const fs   = require("fs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";

// ── Palette (finalized from sample) ──────────────────────────────────────────
const C = {
  white     : "FFFFFF",
  offWhite  : "F9FAFB",
  tealDark  : "0F4C4C",
  teal      : "0D9488",
  tealMid   : "14B8A6",
  tealLight : "F0FDFA",
  amber     : "F59E0B",
  dark      : "111827",
  gray      : "6B7280",
  border    : "E5E7EB",
  cardBg    : "FFFFFF",
  statBg    : "F3F4F6",
};

const F = { title: "Trebuchet MS", body: "Calibri", mono: "Courier New" };

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT  = path.join(__dirname, "..");
const DOCS  = path.join(ROOT, "docs");
const SHOTS = path.join(ROOT, "docs", "screenshots");
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

function img(filename) {
  const p = path.join(DOCS, filename);
  return fs.existsSync(p) ? p : null;
}

// ── White background + thin left teal rule ────────────────────────────────────
function whiteBg(s) {
  s.background = { color: C.offWhite };
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.05, h: "100%",
    fill: { color: C.teal }, line: { color: C.teal },
  });
}

// ── Header ────────────────────────────────────────────────────────────────────
function addHeader(s, title) {
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.72,
    fill: { color: C.white }, line: { color: C.border, pt: 1 },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.05,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 0.28, y: 0.22, w: 0.26, h: 0.26,
    fill: { color: C.amber }, line: { color: C.amber },
  });
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

// ── Footer ────────────────────────────────────────────────────────────────────
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

// ── Content card ──────────────────────────────────────────────────────────────
function addCard(s, x, y, w, h, title, bullets, accentColor) {
  const ac = accentColor || C.teal;
  // shadow
  s.addShape(pptx.ShapeType.rect, {
    x: x + 0.04, y: y + 0.04, w, h,
    fill: { color: C.border }, line: { color: C.border },
  });
  // body
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
  });
  // thin top line
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.06,
    fill: { color: ac }, line: { color: ac },
  });
  // title row — neutral bg
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + 0.06, w, h: 0.36,
    fill: { color: C.offWhite }, line: { color: C.border, pt: 1 },
  });
  // left pip
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + 0.06, w: 0.06, h: 0.36,
    fill: { color: ac }, line: { color: ac },
  });
  s.addText(title, {
    x: x + 0.16, y: y + 0.06, w: w - 0.24, h: 0.36,
    fontSize: 10.5, bold: true, color: C.dark,
    fontFace: F.title, valign: "middle",
  });
  s.addText(
    bullets.map(b => ({ text: b, options: { bullet: { type: "bullet", code: "25AA", color: ac } } })),
    {
      x: x + 0.2, y: y + 0.5, w: w - 0.32, h: h - 0.62,
      fontSize: 10, color: C.dark, fontFace: F.body,
      valign: "top", lineSpacingMultiple: 1.45,
    }
  );
}

// ── Label pill ────────────────────────────────────────────────────────────────
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

// ── Thin divider ──────────────────────────────────────────────────────────────
function divider(s, x, y, w) {
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.02,
    fill: { color: C.border }, line: { color: C.border },
  });
}

// ── Stat box ──────────────────────────────────────────────────────────────────
function addStat(s, x, y, w, h, number, label, color) {
  const c = color || C.teal;
  s.addShape(pptx.ShapeType.rect, {
    x: x + 0.04, y: y + 0.04, w, h,
    fill: { color: C.border }, line: { color: C.border },
  });
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
  });
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: h * 0.42,
    fill: { color: c }, line: { color: c },
  });
  s.addText(number, {
    x, y: y + 0.06, w, h: h * 0.36,
    fontSize: 26, bold: true, color: C.white,
    fontFace: F.title, align: "center", valign: "middle",
  });
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

// ── Horizontal progress bar ───────────────────────────────────────────────────
function addBar(s, x, y, w, pct, label, val, color) {
  const c = color || C.teal;
  s.addText(label, {
    x, y, w: w * 0.56, h: 0.22,
    fontSize: 9.5, color: C.dark, fontFace: F.body, bold: true,
  });
  s.addText(val, {
    x: x + w * 0.6, y, w: w * 0.38, h: 0.22,
    fontSize: 9.5, color: c, fontFace: F.mono, bold: true, align: "right",
  });
  // track
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + 0.26, w, h: 0.18,
    fill: { color: C.offWhite }, line: { color: C.border, pt: 1 },
  });
  // fill
  s.addShape(pptx.ShapeType.rect, {
    x, y: y + 0.26, w: w * pct, h: 0.18,
    fill: { color: c }, line: { color: c },
  });
}

// ── Numbered step card ────────────────────────────────────────────────────────
function addStepCard(s, x, y, w, h, num, title, desc, color) {
  const c = color || C.teal;
  // shadow
  s.addShape(pptx.ShapeType.rect, {
    x: x + 0.04, y: y + 0.04, w, h,
    fill: { color: C.border }, line: { color: C.border },
  });
  // body
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
  });
  // thin top line
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.06,
    fill: { color: c }, line: { color: c },
  });
  // number badge
  s.addShape(pptx.ShapeType.rect, {
    x: x + 0.14, y: y + 0.16, w: 0.46, h: 0.46,
    fill: { color: C.tealLight }, line: { color: c, pt: 1 },
  });
  s.addText(num, {
    x: x + 0.14, y: y + 0.16, w: 0.46, h: 0.46,
    fontSize: 11, bold: true, color: c,
    fontFace: F.mono, align: "center", valign: "middle",
  });
  s.addText(title, {
    x: x + 0.74, y: y + 0.1, w: w - 0.86, h: 0.36,
    fontSize: 10.5, bold: true, color: C.dark, fontFace: F.title,
  });
  divider(s, x + 0.74, y + 0.48, w - 0.86);
  s.addText(desc, {
    x: x + 0.74, y: y + 0.56, w: w - 0.86, h: h - 0.68,
    fontSize: 9.5, color: C.gray, fontFace: F.body, lineSpacingMultiple: 1.3,
  });
}

// ── Banner (full-width info row) ──────────────────────────────────────────────
function addBanner(s, y, labelText, bodyText, labelColor) {
  const lc = labelColor || C.teal;
  s.addShape(pptx.ShapeType.rect, {
    x: 0.22, y, w: 12.89, h: 1.02,
    fill: { color: C.cardBg }, line: { color: C.border, pt: 1 },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.22, y, w: 12.89, h: 0.06,
    fill: { color: lc }, line: { color: lc },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.22, y: y + 0.06, w: 0.06, h: 0.96,
    fill: { color: lc }, line: { color: lc },
  });
  pill(s, 0.38, y + 0.12, labelText, lc);
  s.addText(bodyText, {
    x: 0.38, y: y + 0.46, w: 12.55, h: 0.48,
    fontSize: 10.5, color: C.dark, fontFace: F.body, lineSpacingMultiple: 1.35,
  });
}

module.exports = {
  pptx, C, F, ROOT, DOCS, SHOTS, img,
  whiteBg, addHeader, addFooter,
  addCard, pill, divider, addStat, addBar,
  addStepCard, addBanner,
};
