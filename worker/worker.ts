import { Worker } from "bullmq"
import { redis } from "../lib/redis"

console.log("🚀 Image Worker started")

const worker = new Worker(
  "image-optimize",
  async (job) => {

    console.log("🟢 Processing job:", job.id)

    const { imageBase64, userId, category } = job.data || {}

    console.log("User:", userId)
    console.log("Category:", category)

    // yaha image processing code chalega
    // python script call kar sakte ho

    return { success: true }

  },
  {
    connection: redis,
    concurrency: 5
  }
)

worker.on("completed", (job) => {
  console.log("✅ Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("❌ Job failed:", job?.id, err)
})