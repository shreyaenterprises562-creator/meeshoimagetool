import { Worker } from "bullmq";

if (!process.env.REDIS_URL) {
  console.log("Redis not available. Worker not started.");
} else {

  const worker = new Worker(
    "image-processing",
    async (job) => {

      const { image } = job.data;

      console.log("Processing image:", image);

      // Future processing yaha add kar sakte ho:
      // remove_bg.py
      // resize
      // catalog variants

      await new Promise((resolve) => setTimeout(resolve, 2000));

      return { success: true };

    },
    {
      connection: {
        url: process.env.REDIS_URL,
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} failed`, err);
  });

}