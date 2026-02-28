import prisma from "@/lib/prisma"
import { FREE_CREDITS } from "@/lib/constants"

export async function validateAndUpdatePremium(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return null

  // 🟢 Lifetime safe
  if (user.premiumPlan === "lifetime") {
    return user
  }

  // 🟢 If not premium → nothing to check
  if (!user.isPremium) {
    return user
  }

  // 🟢 If no expiry date → safe guard
  if (!user.premiumUntil) {
    return user
  }

  const now = new Date()

  if (now > user.premiumUntil) {
    const downgradedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumPlan: null,
        premiumUntil: null,
        credits: FREE_CREDITS
      }
    })

    return downgradedUser
  }

  return user
}