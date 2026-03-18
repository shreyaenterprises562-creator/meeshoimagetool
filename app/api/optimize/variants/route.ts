import { NextResponse } from "next/server"
import { imageQueue } from "@/server/queue/imageQueue"
import { QueueEvents } from "bullmq"

import { getCurrentUser } from "@/lib/auth"
import { useCredit, resetDailyCredits } from "@/lib/limiter"

const queueEvents = new QueueEvents("image-optimize", {
  connection: {
    url: process.env.REDIS_URL
  }
})

export async function POST(req: Request) {
  try {

    await queueEvents.waitUntilReady()

    /* ================= AUTH CHECK ================= */

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Login required" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    /* ================= DAILY CREDIT RESET ================= */

    if (!user.isPremium) {
      await resetDailyCredits(user.id)
    }

    /* ================= CREDIT CHECK ================= */

    if (!user.isPremium) {
      const allowed = await useCredit(user.id)

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "No credits left. Upgrade to Premium or watch ads.",
          },
          { status: 403 }
        )
      }
    }

    /* ================= FORM DATA ================= */

    const formData = await req.formData()

    const file = formData.get("image") as File
    const variantCount = Number(formData.get("variants") || 1)
    const category = formData.get("category")?.toString() || ""

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      )
    }

    /* ================= IMAGE → BASE64 ================= */

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString("base64")

    /* ================= ADD JOB ================= */

    const job = await imageQueue.add("process-image", {
      imageBase64: base64Image,
      variants: variantCount,
      category,
      userId: user.id
    })

    /* ================= WAIT FOR RESULT ================= */

    const result = await job.waitUntilFinished(queueEvents)

    return NextResponse.json({
      success: true,
      variants: result?.variants || []
    })

  } catch (err) {

    console.error("Optimize API Error:", err)

    return NextResponse.json(
      { success: false, error: "Optimization failed" },
      { status: 500 }
    )
  }
}