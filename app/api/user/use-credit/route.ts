import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    /* ===================================================== */
    /* ✅ AUTH CHECK */
    /* ===================================================== */

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    /* ===================================================== */
    /* ✅ PREMIUM USERS = UNLIMITED */
    /* ===================================================== */

    if (user.isPremium) {
      return NextResponse.json({
        success: true,
        premium: true,
        message: "Premium user — unlimited access 🚀",
      })
    }

    /* ===================================================== */
    /* ✅ CREDIT CHECK */
    /* ===================================================== */

    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "No credits left" },
        { status: 400 }
      )
    }

    /* ===================================================== */
    /* ✅ DECREMENT CREDIT */
    /* ===================================================== */

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { decrement: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
    })

  } catch (error) {
    console.error("Use Credit Error:", error)

    return NextResponse.json(
      { error: "Failed to use credit" },
      { status: 500 }
    )
  }
}