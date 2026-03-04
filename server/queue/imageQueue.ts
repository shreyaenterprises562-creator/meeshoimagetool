import { Queue } from "bullmq";

export const imageQueue = new Queue("image-processing", {
  connection: {
    url: process.env.REDIS_URL as string,
  },
});