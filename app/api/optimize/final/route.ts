import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/* ---------------- RANDOM COLOR GENERATORS ---------------- */

// ✅ Generate random pastel background color
function randomBgColor() {
  const r = Math.floor(180 + Math.random() * 75);
  const g = Math.floor(180 + Math.random() * 75);
  const b = Math.floor(180 + Math.random() * 75);

  return { r, g, b };
}

// ✅ Generate random vibrant border color
function randomBorderColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return { r, g, b };
}

/* ---------------- API ROUTE ---------------- */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      );
    }

    /* ---------------- FILE SAVE ---------------- */

    const buffer = Buffer.from(await file.arrayBuffer());

    const inputPath = path.join(process.cwd(), "temp_input.png");
    const cutPath = path.join(process.cwd(), "temp_cut.png");

    fs.writeFileSync(inputPath, buffer);

    /* ---------------- BACKGROUND REMOVE ---------------- */

    execSync(`python scripts/remove_bg.py ${inputPath} ${cutPath}`);
    const cutBuffer = fs.readFileSync(cutPath);

    /* ---------------- COLORS ---------------- */

    const bgColor = randomBgColor();
    const borderColor = randomBorderColor();

    /* ---------------- FIXED SETTINGS ---------------- */

    const finalSize = 1024;

    // 🔥 Product always same size
    const scaleSize = 620;

    // Fixed clean gap around product
    const breathingPadding = 220;

    // Fixed background margin
    const internalMargin = 280;

    // ✅ Border thickness fixed
    const borderThickness = 140;

    /* ===================================================
       ✅ STEP 1: BUILD FIXED INNER CANVAS (PRODUCT NEVER CHANGES)
    =================================================== */

    const innerCanvas = await sharp(cutBuffer)
      .png()

      // Soft trim only
      .trim({ threshold: 10 })

      // Resize longest side (product fixed)
      .resize({
        width: scaleSize,
        height: scaleSize,
        fit: "inside",
      })

      // Transparent breathing space
      .extend({
        top: breathingPadding,
        bottom: breathingPadding,
        left: breathingPadding,
        right: breathingPadding,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })

      // Solid random pastel background
      .extend({
        top: internalMargin,
        bottom: internalMargin,
        left: internalMargin,
        right: internalMargin,
        background: bgColor,
      })

      // Flatten clean background
      .flatten({ background: bgColor })

      // Lock inner image exactly 1024×1024
      .resize(finalSize, finalSize, {
        fit: "fill",
      })

      .toBuffer();

    /* ===================================================
       ✅ STEP 2: ADD RANDOM BORDER OUTSIDE (PRODUCT SIZE SAME)
    =================================================== */

    const finalBuffer = await sharp(innerCanvas)
      .extend({
        top: borderThickness,
        bottom: borderThickness,
        left: borderThickness,
        right: borderThickness,
        background: borderColor,
      })

      // Crop back to 1024×1024
      .resize(finalSize, finalSize, {
        fit: "cover",
      })

      // Export JPEG
      .jpeg({ quality: 95 })
      .toBuffer();

    /* ---------------- CLEANUP ---------------- */

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(cutPath)) fs.unlinkSync(cutPath);

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      success: true,
      optimizedBase64: `data:image/jpeg;base64,${finalBuffer.toString(
        "base64"
      )}`,
    });
  } catch (err) {
    console.error("Optimize Error:", err);

    return NextResponse.json(
      { success: false, error: "Optimization Failed" },
      { status: 500 }
    );
  }
}
