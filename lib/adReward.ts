import { prisma } from "@/lib/prisma";

/* ===================================================== */
/* ✅ WATCH AD REWARD SYSTEM */
/* ===================================================== */

export async function rewardAdCredit(userId: string) {

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) throw new Error("User not found");

  if (user.isPremium) {
    return {
      success: false,
      message: "Premium users do not need ad rewards"
    };
  }

  /* ===================================================== */
  /* ✅ DAILY RESET */
  /* ===================================================== */

  const today = new Date().toDateString();

  const lastUsed = user.lastUsedAt
    ? new Date(user.lastUsedAt).toDateString()
    : null;

  if (today !== lastUsed) {

    await prisma.user.update({
      where: { id: user.id },
      data: {
        adsWatched: 0,
        lastUsedAt: new Date()
      }
    });

    user.adsWatched = 0;
  }

  /* ===================================================== */
  /* ✅ MAX 2 ADS PER DAY */
  /* ===================================================== */

  if (user.adsWatched >= 2) {
    return {
      success: false,
      message: "Daily ad reward limit reached"
    };
  }

  /* ===================================================== */
  /* ✅ REWARD CREDIT */
  /* ===================================================== */

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: {
        increment: 1
      },
      adsWatched: {
        increment: 1
      },
      lastUsedAt: new Date()
    }
  });

  return {
    success: true,
    credits: updated.credits,
    adsWatched: updated.adsWatched
  };
}