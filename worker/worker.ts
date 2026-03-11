import { Worker } from "bullmq"

new Worker(
  "image-optimize",
  async (job) => {

    console.log("Processing job:", job.id)

    const { imageBase64, userId, category } = job.data

    return { success: true }

  },
  {
    connection: {
      url: process.env.REDIS_URL
    },
    concurrency: 5
  }
)