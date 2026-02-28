import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

import { chromium } from "playwright";

export async function POST(req: Request) {
  try {
    /* ===================================================== */
    /* ✅ JWT AUTH */
    /* ===================================================== */

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

    /* ===================================================== */
    /* ✅ PLAYWRIGHT LOGIN */
    /* ===================================================== */

    console.log("🚀 Opening Meesho Login...");

    const browser = await chromium.launch({
      headless: false, // user manually login करेगा
    });

    const page = await browser.newPage();

    await page.goto("https://supplier.meesho.com/", {
      waitUntil: "domcontentloaded",
    });

    console.log("✅ Please login manually in opened browser...");

    // Wait until login happens (URL changes)
    await page.waitForURL("**/dashboard**", {
      timeout: 120000, // 2 मिनट login time
    });

    console.log("🎉 Login Successful, extracting cookies...");

    const cookies = await page.context().cookies();

    await browser.close();

    /* ===================================================== */
    /* ✅ SAVE COOKIES IN DB */
    /* ===================================================== */

    await prisma.user.update({
      where: { id: userId },
      data: {
        meeshoConnected: true,
        meeshoCookies: cookies,
      },
    });

    return NextResponse.json({
      success: true,
      message: "✅ Meesho Connected Successfully!",
    });
  } catch (error) {
    console.error("MEESHO_CONNECT_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect Meesho",
      },
      { status: 500 }
    );
  }
}
