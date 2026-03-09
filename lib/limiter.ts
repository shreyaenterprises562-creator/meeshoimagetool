import { prisma } from "@/lib/prisma";

/* ===================================================== */
/* ✅ DAILY RESET */
/* ===================================================== */

export async function resetDailyCredits(userId: string) {

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  if (user.isPremium) return;

  const today = new Date().toDateString();
  const lastUsed = user.lastUsedAt
    ? new Date(user.lastUsedAt).toDateString()
    : null;

  if (today !== lastUsed) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: 1,
        adsWatched: 0,
        lastUsedAt: new Date(),
      },
    });
  }
}

/* ===================================================== */
/* ✅ USE CREDIT */
/* ===================================================== */

export async function useCredit(userId: string) {

  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // Premium unlimited
  if (user.isPremium) return true;

  /* ================= RESET CHECK ================= */

  const today = new Date().toDateString();
  const lastUsed = user.lastUsedAt
    ? new Date(user.lastUsedAt).toDateString()
    : null;

  if (today !== lastUsed) {

    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: 1,
        adsWatched: 0,
        lastUsedAt: new Date(),
      },
    });

    // reload updated user
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /* ================= CREDIT CHECK ================= */

  if (!user || user.credits <= 0) return false;

  /* ================= DEDUCT CREDIT ================= */

  await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: {
        decrement: 1,
      },
      lastUsedAt: new Date(),
    },
  });

  return true;
}