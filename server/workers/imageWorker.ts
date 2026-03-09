import "dotenv/config"
import { Worker } from "bullmq"

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD
}

console.log("Starting Image Worker...")
console.log("Redis Host:", process.env.REDIS_HOST)

const worker = new Worker(
  "image-processing",
  async job => {

    console.log("Processing job:", job.id)

    const data = job.data

    // TODO: image processing logic
    // background removal / variants

    console.log("Job finished:", job.id)

    return true
  },
  { connection }
)

worker.on("completed", job => {
  console.log("Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.log("Job failed:", job?.id, err)
})

console.log("Worker ready and waiting for jobs...")