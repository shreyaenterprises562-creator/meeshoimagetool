import "dotenv/config"
import { Worker } from "bullmq"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

console.log("🚀 Image Worker Started")

/* ---------------- RANDOM COLORS ---------------- */

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

/* ---------------- WORKER ---------------- */

const worker = new Worker(
  "image-optimize",
  async (job) => {

    console.log("🟢 Processing job:", job.id)

    const { imageBase64, variants } = job.data

    const inputPath = path.join(process.cwd(), `temp_input_${job.id}.png`)
    const cutPath = path.join(process.cwd(), `temp_cut_${job.id}.png`)

    try {

      /* ---------------- SAVE INPUT ---------------- */

      const buffer = Buffer.from(imageBase64, "base64")
      fs.writeFileSync(inputPath, buffer)

      /* ---------------- REMOVE BACKGROUND ---------------- */

      execSync(`python3 scripts/remove_bg.py ${inputPath} ${cutPath}`, {
        stdio: "inherit"
      })

      const cutBuffer = fs.readFileSync(cutPath)

      const results: string[] = []

      /* ---------------- VARIANT GENERATION ---------------- */

      for (let i = 0; i < variants; i++) {

        const bgColor = randomBgColor()
        const borderColor = randomBorderColor()

        const finalSize = 1024
        const scaleSize = 620
        const breathingPadding = 220
        const internalMargin = 280
        const borderThickness = 140

        const innerCanvas = await sharp(cutBuffer)
          .trim({ threshold: 10 })
          .resize({
            width: scaleSize,
            height: scaleSize,
            fit: "inside"
          })
          .extend({
            top: breathingPadding,
            bottom: breathingPadding,
            left: breathingPadding,
            right: breathingPadding,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .extend({
            top: internalMargin,
            bottom: internalMargin,
            left: internalMargin,
            right: internalMargin,
            background: bgColor
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
            background: borderColor
          })
          .resize(finalSize, finalSize, { fit: "cover" })
          .jpeg({ quality: 95 })
          .toBuffer()

        results.push(
          `data:image/jpeg;base64,${finalBuffer.toString("base64")}`
        )
      }

      console.log("✅ Job finished:", job.id)

      return {
        success: true,
        variants: results
      }

    } catch (err) {

      console.error("❌ Worker error:", err)
      throw err

    } finally {

      /* ---------------- SAFE CLEANUP ---------------- */

      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
      } catch {}

      try {
        if (fs.existsSync(cutPath)) fs.unlinkSync(cutPath)
      } catch {}

    }

  },
  {
    connection: {
      url: process.env.REDIS_URL
    },
    concurrency: 2
  }
)

/* ---------------- EVENTS ---------------- */

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("❌ Job failed:", job?.id, err)
})