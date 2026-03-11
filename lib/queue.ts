import { Queue } from "bullmq"

export const optimizeQueue = new Queue("image-optimize", {
  connection: {
    url: process.env.REDIS_URL
  }
})