import { Queue } from "bullmq"
import { redis } from "../../lib/redis"

export const imageQueue = new Queue("image-optimize", {
  connection: redis
})