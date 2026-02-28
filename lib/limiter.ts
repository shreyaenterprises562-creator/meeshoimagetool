import { prisma } from "@/lib/prisma";

export async function useCredit(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // Premium unlimited
  if (user.isPremium) return true;

  // Reset daily credits if new day
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

  // Check credits
  if (user.credits <= 0) return false;

  // Deduct 1 credit
  await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: user.credits - 1,
      lastUsedAt: new Date(),
    },
  });

  return true;
}
