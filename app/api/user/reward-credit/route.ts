export async function POST() {
  return Response.json({
    disabled: true
  })
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const { token } = body

    if (token !== process.env.MONETAG_SECRET) {
      return NextResponse.json(
        { error: "Invalid reward verification" },
        { status: 403 }
      )
    }

    /* ================= AUTH ================= */

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await getCurrentUser(
      authHeader.replace("Bearer ", "")
    )

    if (!user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      )
    }

    if (user.isPremium) {
      return NextResponse.json({
        error: "Premium users unlimited",
      })
    }

    /* ================= DAILY RESET ================= */

    const today = new Date().toDateString()
    const lastUsed = user.lastUsedAt
      ? new Date(user.lastUsedAt).toDateString()
      : null

    let adsWatched = user.adsWatched

    if (today !== lastUsed) {

      const reset = await prisma.user.update({
        where: { id: user.id },
        data: {
          adsWatched: 0,
          lastUsedAt: new Date()
        }
      })

      adsWatched = reset.adsWatched
    }

    /* ================= LIMIT ================= */

    if (adsWatched >= 2) {
      return NextResponse.json({
        error: "Daily ad limit reached"
      })
    }

    /* ================= ADD CREDIT ================= */

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: 1 },
        adsWatched: { increment: 1 },
        lastUsedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      credits: updated.credits,
      adsWatched: updated.adsWatched
    })

  } catch (err) {

    console.error("Reward Error:", err)

    return NextResponse.json(
      { error: "Reward failed" },
      { status: 500 }
    )
  }

}