import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

/*
ORIGINAL IMPLEMENTATION (KEPT FOR FUTURE)

export async function POST(req: Request) {
try {

```
const authHeader = req.headers.get("authorization")

if (!authHeader) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  )
}

const token = authHeader.replace("Bearer ", "")
const user = await getCurrentUser(token)

if (!user) {
  return NextResponse.json(
    { error: "Invalid session" },
    { status: 401 }
  )
}

if (user.isPremium) {
  return NextResponse.json({
    success: true,
    premium: true,
    message: "Premium user — unlimited access 🚀",
  })
}

if (user.credits <= 0) {
  return NextResponse.json(
    { error: "No credits left" },
    { status: 400 }
  )
}

const updatedUser = await prisma.user.update({
  where: { id: user.id },
  data: {
    credits: { decrement: 1 },
  },
})

return NextResponse.json({
  success: true,
  credits: updatedUser.credits,
})
```

} catch (error) {
console.error("Use Credit Error:", error)

```
return NextResponse.json(
  { error: "Failed to use credit" },
  { status: 500 }
)
```

}
}
*/

export async function POST() {
return Response.json({
disabled: true
})
}
