import "dotenv/config"
import { Worker } from "bullmq"
import { redis } from "../../lib/redis"

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
}

console.log("🚀 Starting Optimize Worker...")
console.log("Redis Host:", process.env.REDIS_HOST)

const worker = new Worker(
  "optimize", // MUST MATCH QUEUE NAME
  async (job) => {

    console.log("🟢 Processing job:", job.id)
    console.log("Job Name:", job.name)

    const { imageBase64, userId, category, variants } = job.data

    if (job.name === "generateVariants") {

      console.log("Generating variants...")
      console.log("User:", userId)
      console.log("Category:", category)
      console.log("Variants:", variants)

      // TODO
      // yaha python script call hogi
      // remove_bg.py
      // variants generate

      return {
        success: true
      }
    }

    console.log("Unknown job:", job.name)

    return true
  },
  { connection }
)

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("❌ Job failed:", job?.id, err)
})

console.log("👷 Worker ready and waiting for jobs...")