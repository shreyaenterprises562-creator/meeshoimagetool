import { Worker } from "bullmq"
import { redis } from "../lib/redis"

console.log("🚀 Worker started")

new Worker(
  "image-optimize",
  async (job) => {

    console.log("Processing job:", job.id)

    const { imageBase64, userId, category } = job.data

    // yaha image processing code chalega
    // python script call kar sakte ho

    return {
      success: true
    }

  },
  {
    connection: redis,
    concurrency: 5
  }
)