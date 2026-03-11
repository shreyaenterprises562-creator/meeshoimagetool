import { Queue } from "bullmq"

export const imageQueue = new Queue("image-optimize", {
  connection: {
    url: process.env.REDIS_URL
  }
})