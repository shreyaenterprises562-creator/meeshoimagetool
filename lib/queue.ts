import { Queue } from "bullmq"
import { redis } from "./redis"

export const optimizeQueue = new Queue("image-optimize", {
  connection: redis
})