import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CREDIT_PACKS } from "@/lib/plans"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const token = authHeader.replace("Bearer ", "")
  const user = await getCurrentUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { pack } = await req.json()
  const selectedPack = CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS]

  if (!selectedPack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
  }

  const order = await razorpay.orders.create({
    amount: selectedPack.amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  })

  await prisma.payment.create({
    data: {
      userId: user.id,
      razorpayOrderId: order.id,
      amount: selectedPack.amount,
      type: "credits",
      plan: pack,
      creditsAdded: selectedPack.credits,
    },
  })

  return NextResponse.json({
    orderId: order.id,
    key: process.env.RAZORPAY_KEY_ID,
    amount: selectedPack.amount * 100,
  })
}