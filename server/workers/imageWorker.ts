import "dotenv/config"
import { Worker } from "bullmq"

console.log("Starting Image Optimize Worker...")
console.log("Redis URL:", process.env.REDIS_URL ? "Loaded" : "Missing")

const worker = new Worker(
  "image-optimize",
  async (job) => {

    console.log("Processing job:", job.id)
    console.log("Job Name:", job.name)

    const { imageBase64, userId, category, variants } = job.data || {}

    console.log("User:", userId)
    console.log("Category:", category)
    console.log("Variants:", variants)

    // TODO
    // yaha python script call hogi
    // remove_bg.py
    // variants generation

    console.log("Job finished:", job.id)

    return {
      success: true
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