import { NextResponse } from "next/server";

/*
ORIGINAL IMPLEMENTATION (KEPT FOR FUTURE)

import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
try {

```
const authHeader = req.headers.get("authorization");

if (!authHeader) {
  return NextResponse.json(
    { success: false, error: "Login required" },
    { status: 401 }
  );
}

const token = authHeader.replace("Bearer ", "");
const userId = verifyToken(token);

if (!userId) {
  return NextResponse.json(
    { success: false, error: "Invalid token" },
    { status: 401 }
  );
}

const user = await prisma.user.findUnique({
  where: { id: userId },
});

if (!user) {
  return NextResponse.json(
    { success: false, error: "User not found" },
    { status: 404 }
  );
}

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

if (user.adsWatched >= 2) {
  return NextResponse.json(
    {
      success: false,
      error: "Daily Ad Limit Reached (2/2)",
    },
    { status: 403 }
  );
}

const updated = await prisma.user.update({
  where: { id: user.id },
  data: {
    credits: user.credits + 1,
    adsWatched: user.adsWatched + 1,
  },
});

return NextResponse.json({
  success: true,
  message: "🎉 Ad Watched! +1 Credit Added",
  credits: updated.credits,
  adsWatched: updated.adsWatched,
});
```

} catch (err) {
console.error("Watch Ad Error:", err);

```
return NextResponse.json(
  { success: false, error: "Ad Reward Failed" },
  { status: 500 }
);
```

}
}
*/

export async function POST() {
return NextResponse.json({
disabled: true
});
}
