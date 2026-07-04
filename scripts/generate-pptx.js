#!/usr/bin/env node
/**
 * HireHub — PowerPoint Presentation Generator
 * Run: node scripts/generate-pptx.js
 * Output: presentation.pptx in project root
 */

const path = require("path");
const { pptx } = require("./make-pptx");

const addSlides1to8   = require("./slides-1-8");
const addSlides9to15  = require("./slides-9-15");
const addSlides16to23 = require("./slides-16-23");

async function main() {
  console.log("Building HireHub presentation...");

  addSlides1to8();
  console.log("  ✓ Slides 1–8 added");

  addSlides9to15();
  console.log("  ✓ Slides 9–15 added");

  addSlides16to23();
  console.log("  ✓ Slides 16–23 added");

  const outPath = path.join(__dirname, "..", "presentation.pptx");
  await pptx.writeFile({ fileName: outPath });
  console.log(`\n✅ Saved: ${outPath}`);
}

main().catch((err) => {
  console.error("Error generating presentation:", err);
  process.exit(1);
});
