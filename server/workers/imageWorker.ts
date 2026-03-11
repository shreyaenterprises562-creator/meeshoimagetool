import "dotenv/config"
import { Worker } from "bullmq"
import { execFile } from "child_process"
import { promisify } from "util"
import path from "path"

const execFileAsync = promisify(execFile)

console.log("Starting Image Optimize Worker...")

const worker = new Worker(
  "image-optimize",
  async (job) => {

    console.log("Processing job:", job.id)

    const { imageBase64, userId, category, variants } = job.data

    const scriptPath = path.join(process.cwd(), "python", "remove_bg.py")

    try {

      const { stdout } = await execFileAsync("python3", [
        scriptPath,
        imageBase64,
        String(variants || 1)
      ])

      console.log("Python output received")

      return {
        success: true,
        images: JSON.parse(stdout)
      }

    } catch (err) {

      console.error("Python processing failed:", err)

      throw err
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
  console.log("Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.error("Job failed:", job?.id, err)
})

console.log("Worker ready and waiting for jobs...")