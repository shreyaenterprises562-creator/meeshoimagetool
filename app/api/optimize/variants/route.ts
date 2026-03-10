import { NextResponse } from "next/server"
import { optimizeQueue } from "@/lib/queue"

import { getCurrentUser } from "@/lib/auth"
import { useCredit, resetDailyCredits } from "@/lib/limiter"

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
    /* ✅ DAILY CREDIT RESET */
    /* ===================================================== */

    if (!user.isPremium) {
      await resetDailyCredits(user.id)
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
    /* ✅ IMAGE → BASE64 */
    /* ===================================================== */

    const buffer = Buffer.from(await file.arrayBuffer())
    const imageBase64 = buffer.toString("base64")

    /* ===================================================== */
    /* ✅ ADD JOB TO QUEUE */
    /* ===================================================== */

    const job = await optimizeQueue.add("generateVariants", {
      imageBase64,
      userId: user.id,
      category,
      variants: variantCount,
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