import { NextResponse } from "next/server"
import { imageQueue } from "@/server/queue/imageQueue"

import { getCurrentUser } from "@/lib/auth"
import { useCredit } from "@/lib/limiter"

export async function POST(req: Request) {
  try {
    /* ===================================================== */
    /* ✅ AUTH CHECK */
    /* ===================================================== */

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

    /* ===================================================== */
    /* ✅ CREDIT CHECK */
    /* ===================================================== */

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

    /* ===================================================== */
    /* ✅ FORM DATA */
    /* ===================================================== */

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

    /* ===================================================== */
    /* ✅ CONVERT IMAGE TO BASE64 */
    /* ===================================================== */

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString("base64")

    /* ===================================================== */
    /* ✅ ADD JOB TO QUEUE */
    /* ===================================================== */

    const job = await imageQueue.add("process-image", {
      image: base64Image,
      variants: variantCount,
      category,
      userId: user.id,
    })

    /* ===================================================== */
    /* ✅ RESPONSE */
    /* ===================================================== */

    return NextResponse.json({
      success: true,
      status: "queued",
      jobId: job.id,
    })
  } catch (err) {
    console.error("Queue Add Error:", err)

    return NextResponse.json(
      { success: false, error: "Failed to queue job" },
      { status: 500 }
    )
  }
}