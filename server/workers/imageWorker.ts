import "dotenv/config"
import { Worker } from "bullmq"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

console.log("🚀 Image Worker Started")

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

const worker = new Worker(
  "image-optimize",
  async (job) => {

    console.log("🟢 Processing job:", job.id)

    const { imageBase64, variants } = job.data

    const inputPath = path.join(process.cwd(), `temp_input_${job.id}.png`)
    const cutPath = path.join(process.cwd(), `temp_cut_${job.id}.png`)

    try {

      const buffer = Buffer.from(imageBase64, "base64")
      fs.writeFileSync(inputPath, buffer)

      execSync(`python3 scripts/remove_bg.py ${inputPath} ${cutPath}`)

      const cutBuffer = fs.readFileSync(cutPath)

      const results: string[] = []

      for (let i = 0; i < variants; i++) {

        const bgColor = randomBgColor()
        const borderColor = randomBorderColor()

        const innerCanvas = await sharp(cutBuffer)
          .trim({ threshold: 10 })
          .resize({ width: 620, height: 620, fit: "inside" })
          .extend({
            top: 220,
            bottom: 220,
            left: 220,
            right: 220,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .extend({
            top: 280,
            bottom: 280,
            left: 280,
            right: 280,
            background: bgColor
          })
          .flatten({ background: bgColor })
          .resize(1024, 1024)
          .toBuffer()

        const finalBuffer = await sharp(innerCanvas)
          .extend({
            top: 140,
            bottom: 140,
            left: 140,
            right: 140,
            background: borderColor
          })
          .resize(1024, 1024)
          .jpeg({ quality: 95 })
          .toBuffer()

        results.push(`data:image/jpeg;base64,${finalBuffer.toString("base64")}`)
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

    concurrency: 1,

    lockDuration: 900000, // 15 minutes
    stalledInterval: 300000
  }
)

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("❌ Job failed:", job?.id, err)
})