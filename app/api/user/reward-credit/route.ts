import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
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
    /* ✅ PREMIUM USERS DON'T NEED AD CREDITS */
    /* ===================================================== */

    if (user.isPremium) {
      return NextResponse.json({
        error: "Premium users have unlimited access",
      })
    }

    /* ===================================================== */
    /* ✅ DAILY LIMIT CHECK (MAX 2) */
    /* ===================================================== */

    if (user.adsWatched >= 2) {
      return NextResponse.json(
        { error: "Daily ad reward limit reached" },
        { status: 400 }
      )
    }

    /* ===================================================== */
    /* ✅ ADD CREDIT */
    /* ===================================================== */

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: 1 },
        adsWatched: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      message: "1 Credit Added 🎉",
      credits: updatedUser.credits,
      adsWatched: updatedUser.adsWatched,
    })

  } catch (error) {
    console.error("Reward Credit Error:", error)

    return NextResponse.json(
      { error: "Failed to add reward credit" },
      { status: 500 }
    )
  }
}