import "dotenv/config"
import { Worker } from "bullmq"

console.log("🚀 Starting Image Optimize Worker...")
console.log("Redis Host:", process.env.REDIS_HOST)

const worker = new Worker(
  "image-optimize",
  async (job) => {

    console.log("🟢 Processing job:", job.id)
    console.log("Job Name:", job.name)

    const { imageBase64, userId, category, variants } = job.data || {}

    console.log("User:", userId)
    console.log("Category:", category)
    console.log("Variants:", variants)

    // TODO
    // yaha python script call hogi
    // remove_bg.py
    // variants generation

    console.log("✅ Job finished:", job.id)

    return {
      success: true
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD
    }
  }
)

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("❌ Job failed:", job?.id, err)
})

console.log("👷 Worker ready and waiting for jobs...")