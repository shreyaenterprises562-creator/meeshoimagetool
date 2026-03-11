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

    const { imageBase64, variants } = job.data

    const inputPath = path.join(process.cwd(), "temp_input.png")
    const cutPath = path.join(process.cwd(), "temp_cut.png")

    fs.writeFileSync(inputPath, Buffer.from(imageBase64, "base64"))

    execSync(`python3 scripts/remove_bg.py ${inputPath} ${cutPath}`)

    const cutBuffer = fs.readFileSync(cutPath)

    const results = []

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

    fs.unlinkSync(inputPath)
    fs.unlinkSync(cutPath)

    return {
      success: true,
      variants: results
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL
    },
    concurrency: 5
  }
)

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("❌ Job failed:", job?.id, err)
})