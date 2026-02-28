import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    // basic validation
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // user not found OR password null
    if (!user || !user.password) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken(user.id);
    return Response.json({ token });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
