import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getCurrentUser(token)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    email: user.email,
    isPremium: user.isPremium,
    premiumPlan: user.premiumPlan,
    premiumUntil: user.premiumUntil,
    credits: user.credits
  })
}