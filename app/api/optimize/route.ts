import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/* ---------------- RANDOM COLORS ---------------- */

// Pastel Background Generator
function randomBgColor() {
  return {
    r: Math.floor(180 + Math.random() * 75),
    g: Math.floor(180 + Math.random() * 75),
    b: Math.floor(180 + Math.random() * 75),
  };
}

// Vibrant Border Generator
function randomBorderColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

/* ---------------- MAIN API ---------------- */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // ✅ Input Image
    const file = formData.get("image") as File;

    // ✅ Variant Count (1,3,5,10)
    const variantCount = Number(formData.get("variants") || 1);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      );
    }

    /* ---------------- SAVE INPUT TEMP ---------------- */

    const buffer = Buffer.from(await file.arrayBuffer());

    const inputPath = path.join(process.cwd(), "temp_input.png");
    const cutPath = path.join(process.cwd(), "temp_cut.png");

    fs.writeFileSync(inputPath, buffer);

    /* ---------------- REMOVE BACKGROUND ---------------- */

    execSync(`python scripts/remove_bg.py ${inputPath} ${cutPath}`);
    const cutBuffer = fs.readFileSync(cutPath);

    /* ---------------- FIXED SETTINGS ---------------- */

    const finalSize = 1000;

    // Product fixed size always
    const scaleSize = 620;

    // Gap around product
    const breathingPadding = 220;

    // Background margin
    const internalMargin = 280;

    // Border thickness (does NOT affect product size)
    const borderThickness = 140;

    /* ---------------- GENERATE OUTPUT VARIANTS ---------------- */

    const outputs: string[] = [];

    for (let i = 0; i < variantCount; i++) {
      const bgColor = randomBgColor();
      const borderColor = randomBorderColor();

      // ✅ Step 1: Build fixed inner canvas
      const innerCanvas = await sharp(cutBuffer)
        .png()
        .trim({ threshold: 10 })
        .resize({
          width: scaleSize,
          height: scaleSize,
          fit: "inside",
        })
        .extend({
          top: breathingPadding,
          bottom: breathingPadding,
          left: breathingPadding,
          right: breathingPadding,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: internalMargin,
          bottom: internalMargin,
          left: internalMargin,
          right: internalMargin,
          background: bgColor,
        })
        .flatten({ background: bgColor })
        .resize(finalSize, finalSize, { fit: "fill" })
        .toBuffer();

      // ✅ Step 2: Add border OUTSIDE (product stays same)
      const finalBuffer = await sharp(innerCanvas)
        .extend({
          top: borderThickness,
          bottom: borderThickness,
          left: borderThickness,
          right: borderThickness,
          background: borderColor,
        })
        .resize(finalSize, finalSize, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer();

      outputs.push(
        `data:image/jpeg;base64,${finalBuffer.toString("base64")}`
      );
    }

    /* ---------------- CLEANUP ---------------- */

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(cutPath)) fs.unlinkSync(cutPath);

    /* ---------------- RETURN RESPONSE ---------------- */

    return NextResponse.json({
      success: true,
      variants: outputs,
    });
  } catch (err) {
    console.error("Optimize Error:", err);

    return NextResponse.json(
      { success: false, error: "Optimization Failed" },
      { status: 500 }
    );
  }
}
