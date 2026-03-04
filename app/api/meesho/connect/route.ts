import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { chromium } from "playwright";

export async function POST(req: Request) {
  let browser;

  try {
    /* ===================================================== */
    /* REQUEST BODY */
    /* ===================================================== */

    const body = await req.json();
    const phone = body?.phone;
    const otp = body?.otp;

    /* ===================================================== */
    /* JWT AUTH */
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
    /* START PLAYWRIGHT */
    /* ===================================================== */

    browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://supplier.meesho.com/", {
      waitUntil: "domcontentloaded"
    });

    /* ===================================================== */
    /* PHONE STEP (SEND OTP) */
    /* ===================================================== */

    if (phone && !otp) {
      console.log("📱 Sending OTP...");

      await page.fill('input[type="tel"]', phone);
      await page.click('button:has-text("Send OTP")');

      await browser.close();

      return NextResponse.json({
        success: true,
        step: "OTP_SENT",
        message: "OTP sent to phone"
      });
    }

    /* ===================================================== */
    /* OTP VERIFY */
    /* ===================================================== */

    if (phone && otp) {
      console.log("🔐 Verifying OTP...");

      await page.fill('input[type="tel"]', phone);
      await page.click('button:has-text("Send OTP")');

      await page.fill('input[type="number"]', otp);
      await page.click('button:has-text("Verify")');
    }

    /* ===================================================== */
    /* WAIT FOR DASHBOARD */
    /* ===================================================== */

    await page.waitForURL("**/dashboard**", {
      timeout: 60000
    });

    console.log("🎉 Login successful");

    /* ===================================================== */
    /* SAFE COOKIE SAVE (FIXED VERSION) */
    /* ===================================================== */

    const rawCookies = await context.cookies();

    const cookies = rawCookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires ?? -1,
      httpOnly: c.httpOnly ?? false,
      secure: c.secure ?? false,
      sameSite: c.sameSite ?? "Lax"
    }));

    await browser.close();

    /* ===================================================== */
    /* SAVE IN DATABASE */
    /* ===================================================== */

    await prisma.user.update({
      where: { id: userId },
      data: {
        meeshoConnected: true,
        meeshoCookies: cookies,
        meeshoLoginAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Meesho Connected Successfully"
    });

  } catch (error) {

    console.error("MEESHO_CONNECT_ERROR:", error);

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect Meesho"
      },
      { status: 500 }
    );
  }
}