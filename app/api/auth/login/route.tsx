import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = body.email?.toLowerCase().trim()
    const password = body.password?.trim()

    /* ===================================================== */
    /* ✅ BASIC VALIDATION */
    /* ===================================================== */

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    /* ===================================================== */
    /* ✅ FIND USER */
    /* ===================================================== */

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    /* ===================================================== */
    /* ✅ PASSWORD CHECK */
    /* ===================================================== */

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    /* ===================================================== */
    /* ✅ SIGN JWT */
    /* ===================================================== */

    const token = signToken(user.id)

    return Response.json({
      success: true,
      token,
    })

  } catch (error) {
    console.error("LOGIN_ERROR:", error)

    return Response.json(
      { error: "Login failed. Try again." },
      { status: 500 }
    )
  }
}