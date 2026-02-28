import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body.email?.toLowerCase().trim();
    const password = body.password?.trim();

    // ✅ Validation
    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return Response.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    // ✅ Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { error: "User already exists. Please login." },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,

        // Defaults
        credits: 1,
        adsWatched: 0,
        isPremium: false,
      },
    });

    return Response.json({
      success: true,
      message: "✅ Registered Successfully!",
      userId: user.id,
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return Response.json(
      { error: "Register failed. Try again." },
      { status: 500 }
    );
  }
}
