import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

/* ===================================================== */
/* ✅ SECRET */
/* ===================================================== */
const SECRET = process.env.JWT_SECRET || "default_secret_key"

/* ===================================================== */
/* ✅ FREE CREDIT CONSTANT */
/* ===================================================== */
const FREE_CREDITS = 1

/* ===================================================== */
/* ✅ SIGN TOKEN */
/* ===================================================== */
export function signToken(userId: string) {
  return jwt.sign({ userId }, SECRET, {
    expiresIn: "7d",
  })
}

/* ===================================================== */
/* ✅ VERIFY TOKEN + AUTO PREMIUM VALIDATION */
/* ===================================================== */
export async function getCurrentUser(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload
    const userId = decoded.userId as string

    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) return null

    /* ===================================================== */
    /* ✅ LIFETIME PLAN SAFE */
    /* ===================================================== */
    if (user.premiumPlan === "lifetime") {
      return user
    }

    /* ===================================================== */
    /* ✅ AUTO EXPIRY CHECK */
    /* ===================================================== */
    if (
      user.isPremium &&
      user.premiumUntil &&
      new Date() > user.premiumUntil
    ) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumPlan: null,
          premiumUntil: null,
          credits: FREE_CREDITS,
        },
      })

      return updatedUser
    }

    return user
  } catch (err) {
    return null
  }
}

/* ===================================================== */
/* ✅ OPTIONAL: SIMPLE VERIFY (IF NEEDED SOMEWHERE) */
/* ===================================================== */
export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload
    return decoded.userId as string
  } catch (err) {
    return null
  }
}