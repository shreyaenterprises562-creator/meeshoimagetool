import { prisma } from "@/lib/prisma"
import { FREE_CREDITS } from "@/lib/constants"

export async function validateAndUpdatePremium(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return null

  /* ===================================================== */
  /* ✅ LIFETIME PLAN NEVER EXPIRES */
  /* ===================================================== */

  if (user.premiumPlan === "lifetime") {
    return user
  }

  /* ===================================================== */
  /* ✅ NOT PREMIUM → NOTHING TO CHECK */
  /* ===================================================== */

  if (!user.isPremium) {
    return user
  }

  /* ===================================================== */
  /* ✅ NO EXPIRY DATE SAFE GUARD */
  /* ===================================================== */

  if (!user.premiumUntil) {
    return user
  }

  /* ===================================================== */
  /* ✅ EXPIRY CHECK */
  /* ===================================================== */

  const now = new Date()

  if (now > user.premiumUntil) {
    const downgradedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumPlan: null,
        premiumUntil: null,
        credits: FREE_CREDITS,
      },
    })

    return downgradedUser
  }

  return user
}