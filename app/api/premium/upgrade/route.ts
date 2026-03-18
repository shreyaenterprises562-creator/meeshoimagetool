import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/*
ORIGINAL IMPLEMENTATION (KEPT FOR FUTURE)

PREMIUM UPGRADE API
Plans:
₹49    → 7 Days
₹179   → 1 Month
₹1499  → 1 Year
₹7999  → Lifetime
=================

export async function POST(req: Request) {
try {

```
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

const body = await req.json();
const plan = body.plan as string;

if (!plan) {
  return Response.json(
    { success: false, error: "Plan required" },
    { status: 400 }
  );
}

let premiumUntil: Date | null = null;
let message = "";

if (plan === "7days") {
  premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  message = "✅ Premium Activated for 7 Days (₹49)";
}

else if (plan === "monthly") {
  premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  message = "✅ Premium Activated for 1 Month (₹179)";
}

else if (plan === "yearly") {
  premiumUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  message = "✅ Premium Activated for 1 Year (₹1499)";
}

else if (plan === "lifetime") {
  premiumUntil = null;
  message = "🚀 Lifetime Premium Activated (₹7999)";
}

else {
  return Response.json(
    { success: false, error: "Invalid plan selected" },
    { status: 400 }
  );
}

await prisma.user.update({
  where: { id: userId },
  data: {
    isPremium: true,
    premiumUntil: premiumUntil,
  },
});

return Response.json({
  success: true,
  message,
  plan,
});
```

} catch (error) {
console.error("PREMIUM_UPGRADE_ERROR:", error);

```
return Response.json(
  { success: false, error: "Premium upgrade failed" },
  { status: 500 }
);
```

}
}
*/

export async function POST() {
return Response.json({
disabled: true
})
}
