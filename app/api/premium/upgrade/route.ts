import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/* ===================================================== */
/* ✅ PREMIUM UPGRADE API */
/* Plans:
   ₹49    → 7 Days
   ₹179   → 1 Month
   ₹1499  → 1 Year
   ₹7999  → Lifetime
===================================================== */

export async function POST(req: Request) {
  try {
    /* ================= TOKEN CHECK ================= */

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        { success: false, error: "Login required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const userId = verifyToken(token);

    if (!userId) {
      return Response.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    /* ================= PLAN RECEIVE ================= */

    const body = await req.json();
    const plan = body.plan as string;

    if (!plan) {
      return Response.json(
        { success: false, error: "Plan required" },
        { status: 400 }
      );
    }

    /* ================= PLAN LOGIC ================= */

    let premiumUntil: Date | null = null;
    let message = "";

    // ✅ ₹49 → 7 Days
    if (plan === "7days") {
      premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      message = "✅ Premium Activated for 7 Days (₹49)";
    }

    // ✅ ₹179 → Monthly
    else if (plan === "monthly") {
      premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      message = "✅ Premium Activated for 1 Month (₹179)";
    }

    // ✅ ₹1499 → Yearly
    else if (plan === "yearly") {
      premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      message = "✅ Premium Activated for 1 Year (₹1499)";
    }

    // ✅ ₹7999 → Lifetime
    else if (plan === "lifetime") {
      premiumUntil = null;
      message = "🚀 Lifetime Premium Activated (₹7999)";
    }

    // ❌ Invalid plan
    else {
      return Response.json(
        { success: false, error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    /* ================= UPDATE USER ================= */

    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumUntil: premiumUntil, // null = lifetime
      },
    });

    return Response.json({
      success: true,
      message,
      plan,
    });
  } catch (error) {
    console.error("PREMIUM_UPGRADE_ERROR:", error);

    return Response.json(
      { success: false, error: "Premium upgrade failed" },
      { status: 500 }
    );
  }
}
