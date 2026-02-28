import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userEmail = "guest@meeshooptima.com";

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { meeshoConnected: true },
    });

    return NextResponse.json({
      connected: user?.meeshoConnected ?? false,
    });
  } catch (err) {
    console.error("Meesho status error:", err);
    return NextResponse.json(
      { connected: false },
      { status: 500 }
    );
  }
}
