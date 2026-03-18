import { NextResponse } from "next/server"
import sharp from "sharp"
import { getCurrentUser } from "@/lib/auth"
import { useCredit } from "@/lib/limiter"

/*
ORIGINAL IMPLEMENTATION (KEPT FOR FUTURE)

export async function POST(req: Request) {
try {

```
const authHeader = req.headers.get("authorization")

if (!authHeader) {
  return NextResponse.json(
    { success: false, error: "Login required" },
    { status: 401 }
  )
}

const token = authHeader.replace("Bearer ", "")
const user = await getCurrentUser(token)

if (!user) {
  return NextResponse.json(
    { success: false, error: "Invalid session" },
    { status: 401 }
  )
}

if (!user.isPremium) {
  const allowed = await useCredit(user.id)

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "No credits left. Upgrade or watch ads.",
      },
      { status: 403 }
    )
  }
}

const formData = await req.formData()
const file = formData.get("image") as File
const category = formData.get("category")?.toString() || ""

if (!file) {
  return NextResponse.json(
    { success: false, error: "No image uploaded" },
    { status: 400 }
  )
}

const buffer = Buffer.from(await file.arrayBuffer())
const SIZE = 1000

const finalImage = await sharp(buffer)
  .removeAlpha()
  .ensureAlpha()
  .trim()
  .resize({
    width: SIZE,
    height: SIZE,
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .jpeg({ quality: 85 })
  .toBuffer()

return new NextResponse(new Uint8Array(finalImage), {
  headers: {
    "Content-Type": "image/jpeg",
    "X-Category": category,
  },
})
```

} catch (err) {
console.error("Shipping Optimize Error:", err)

```
return NextResponse.json(
  { success: false, error: "Shipping Optimization Failed" },
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
