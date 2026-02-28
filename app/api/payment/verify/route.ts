import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json()

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  const sign = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(sign)
    .digest("hex")

  if (expectedSign !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: razorpay_order_id },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  if (payment.status === "paid") {
    return NextResponse.json({ message: "Already processed" })
  }

  // ✅ Add Credits
  await prisma.user.update({
    where: { id: payment.userId },
    data: {
      credits: {
        increment: payment.creditsAdded || 0,
      },
    },
  })

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
    },
  })

  return NextResponse.json({ success: true })
}