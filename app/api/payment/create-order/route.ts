import { NextResponse } from "next/server"
import Razorpay from "razorpay"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CREDIT_PACKS } from "@/lib/plans"

export async function POST(req: Request) {
  try {
    /* ===================================================== */
    /* ✅ ENV SAFETY CHECK (PREVENT BUILD CRASH) */
    /* ===================================================== */

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      )
    }

    /* ===================================================== */
    /* ✅ INIT RAZORPAY INSIDE FUNCTION (IMPORTANT) */
    /* ===================================================== */

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    /* ===================================================== */
    /* ✅ AUTH */
    /* ===================================================== */

    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    /* ===================================================== */
    /* ✅ PACK VALIDATION */
    /* ===================================================== */

    const { pack } = await req.json()
    const selectedPack = CREDIT_PACKS[pack as keyof typeof CREDIT_PACKS]

    if (!selectedPack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
    }

    /* ===================================================== */
    /* ✅ CREATE ORDER */
    /* ===================================================== */

    const order = await razorpay.orders.create({
      amount: selectedPack.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    })

    /* ===================================================== */
    /* ✅ STORE PAYMENT RECORD */
    /* ===================================================== */

    await prisma.payment.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        amount: selectedPack.amount,
        currency: "INR",
        status: "created",
        type: "credits",
        plan: pack,
        creditsAdded: selectedPack.credits,
      },
    })

    /* ===================================================== */
    /* ✅ RESPONSE */
    /* ===================================================== */

    return NextResponse.json({
      success: true,
      orderId: order.id,
      key: keyId,
      amount: selectedPack.amount * 100,
    })

  } catch (error) {
    console.error("Create Order Error:", error)

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}