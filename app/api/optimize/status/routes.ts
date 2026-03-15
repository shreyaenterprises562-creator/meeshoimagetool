import { NextResponse } from "next/server"
import { imageQueue } from "@/server/queue/imageQueue"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("id")

  if (!jobId) {
    return NextResponse.json({ success:false })
  }

  const job = await imageQueue.getJob(jobId)

  if (!job) {
    return NextResponse.json({ success:false })
  }

  const state = await job.getState()

  if (state === "completed") {

    const result = job.returnvalue

    return NextResponse.json({
      success:true,
      status:"completed",
      variants: result.variants
    })
  }

  if (state === "failed") {

    return NextResponse.json({
      success:false,
      status:"failed"
    })
  }

  return NextResponse.json({
    success:true,
    status:"processing"
  })
}