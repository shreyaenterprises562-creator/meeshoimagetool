import { NextResponse } from "next/server"
import sharp from "sharp"

import { getCurrentUser } from "@/lib/auth"
import { useCredit } from "@/lib/limiter"

export async function POST(req: Request) {
  try {
    /* ===================================================== */
    /* ✅ AUTH CHECK (AUTO PREMIUM VALIDATION INCLUDED) */
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
        { success: false, error: "Invalid session" },
        { status: 401 }
      )
    }

    /* ===================================================== */
    /* ✅ CREDIT CHECK (ONLY FOR NON-PREMIUM USERS) */
    /* ===================================================== */

    if (!user.isPremium) {
      const allowed = await useCredit(user.id)

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "No credits left. Upgrade or watch ads.",
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
    const category = formData.get("category")?.toString() || ""

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      )
    }

    /* ===================================================== */
    /* ✅ SHIPPING OPTIMIZATION (LOW KB, 1000x1000) */
    /* ===================================================== */

    const buffer = Buffer.from(await file.arrayBuffer())
    const SIZE = 1000

    const finalImage = await sharp(buffer)
      .removeAlpha()
      .ensureAlpha()
      .trim()
      .resize({
        width: SIZE,
        height: SIZE,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({ quality: 85 })
      .toBuffer()

    /* ===================================================== */
    /* ✅ RESPONSE (Railway Compatible) */
    /* ===================================================== */

    return new NextResponse(new Uint8Array(finalImage), {
      headers: {
        "Content-Type": "image/jpeg",
        "X-Category": category,
      },
    })

  } catch (err) {
    console.error("Shipping Optimize Error:", err)

    return NextResponse.json(
      { success: false, error: "Shipping Optimization Failed" },
      { status: 500 }
    )
  }
}