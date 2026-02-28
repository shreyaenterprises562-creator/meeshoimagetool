import { NextResponse } from "next/server"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

import { getCurrentUser } from "@/lib/auth"
import { useCredit } from "@/lib/limiter"

/* ---------------- RANDOM COLOR GENERATORS ---------------- */

function randomBgColor() {
  return {
    r: Math.floor(180 + Math.random() * 75),
    g: Math.floor(180 + Math.random() * 75),
    b: Math.floor(180 + Math.random() * 75),
  }
}

function randomBorderColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  }
}

export async function POST(req: Request) {
  let inputPath = ""
  let cutPath = ""

  try {
    /* ===================================================== */
    /* ✅ AUTH CHECK (AUTO PREMIUM VALIDATION INCLUDED) */
    /* ===================================================== */

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Login required" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    /* ===================================================== */
    /* ✅ CREDIT CHECK (ONLY FOR NON-PREMIUM USERS) */
    /* ===================================================== */

    if (!user.isPremium) {
      const allowed = await useCredit(user.id)

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "No credits left. Upgrade to Premium or watch ads.",
          },
          { status: 403 }
        )
      }
    }

    /* ===================================================== */
    /* ✅ FORM DATA */
    /* ===================================================== */

    const formData = await req.formData()

    const file = formData.get("image") as File
    const variantCount = Number(formData.get("variants") || 1)
    const category = formData.get("category")?.toString() || ""

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      )
    }

    /* ===================================================== */
    /* ✅ SAVE TEMP FILES */
    /* ===================================================== */

    const buffer = Buffer.from(await file.arrayBuffer())

    inputPath = path.join(process.cwd(), `temp_input_${Date.now()}.png`)
    cutPath = path.join(process.cwd(), `temp_cut_${Date.now()}.png`)

    fs.writeFileSync(inputPath, buffer)

    /* ===================================================== */
    /* ✅ BACKGROUND REMOVE */
    /* ===================================================== */

    execSync(`python scripts/remove_bg.py "${inputPath}" "${cutPath}"`)
    const cutBuffer = fs.readFileSync(cutPath)

    /* ===================================================== */
    /* ✅ FIXED VARIANT SETTINGS */
    /* ===================================================== */

    const finalSize = 1000
    const scaleSize = 620
    const breathingPadding = 220
    const internalMargin = 280
    const borderThickness = 140

    const outputs: string[] = []

    /* ===================================================== */
    /* ✅ GENERATE VARIANTS */
    /* ===================================================== */

    for (let i = 0; i < variantCount; i++) {
      const bgColor = randomBgColor()
      const borderColor = randomBorderColor()

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
        .toBuffer()

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
        .toBuffer()

      outputs.push(
        `data:image/jpeg;base64,${finalBuffer.toString("base64")}`
      )
    }

    /* ===================================================== */
    /* ✅ CLEANUP */
    /* ===================================================== */

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (fs.existsSync(cutPath)) fs.unlinkSync(cutPath)

    /* ===================================================== */
    /* ✅ RESPONSE */
    /* ===================================================== */

    return NextResponse.json({
      success: true,
      category,
      variants: outputs,
    })
  } catch (err) {
    console.error("Variants Optimize Error:", err)

    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (cutPath && fs.existsSync(cutPath)) fs.unlinkSync(cutPath)

    return NextResponse.json(
      { success: false, error: "Variant Optimization Failed" },
      { status: 500 }
    )
  }
}