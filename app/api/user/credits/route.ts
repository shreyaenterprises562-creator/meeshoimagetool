import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: Request) {
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
    /* ✅ DAILY RESET LOGIC (FREE USERS ONLY) */
    /* ===================================================== */

    let updatedUser = user
    const today = new Date()

    if (!user.isPremium) {
      const lastUsed = user.lastUsedAt

      if (
        !lastUsed ||
        lastUsed.toDateString() !== today.toDateString()
      ) {
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: 1,       // daily free credit
            adsWatched: 0,    // reset ad count
            lastUsedAt: today,
          },
        })
      }
    }

    /* ===================================================== */
    /* ✅ RESPONSE */
    /* ===================================================== */

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
      adsWatched: updatedUser.adsWatched,
      isPremium: updatedUser.isPremium,
    })

  } catch (error) {
    console.error("Credits API Error:", error)

    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    )
  }
}