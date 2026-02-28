import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // ✅ Get Authorization Header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // ✅ Extract Token
    const token = authHeader.replace("Bearer ", "").trim();

    const userId = verifyToken(token);

    if (!userId) {
      return Response.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // ✅ Fetch User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        credits: true,
        adsWatched: true,
        isPremium: true,
      },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("AUTH_ME_ERROR:", error);

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
