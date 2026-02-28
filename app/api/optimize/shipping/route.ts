import { NextResponse } from "next/server";
import sharp from "sharp";

import { verifyToken } from "@/lib/auth";
import { useCredit } from "@/lib/limiter";

export async function POST(req: Request) {
  try {
    /* ===================================================== */
    /* ✅ AUTH CHECK (JWT REQUIRED) */
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
    /* ✅ CREDIT CHECK + DEDUCT */
    /* ===================================================== */

    const allowed = await useCredit(userId);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "No credits left. Watch Ads to earn more!",
        },
        { status: 403 }
      );
    }

    /* ===================================================== */
    /* ✅ FORM DATA */
    /* ===================================================== */

    const formData = await req.formData();
    const file = formData.get("image") as File;

    // ✅ Category Receive (Minimal Change)
    const category = formData.get("category")?.toString() || "";

    console.log("✅ Shipping Selected Category:", category);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      );
    }

    /* ===================================================== */
    /* ✅ SHIPPING OPTIMIZE (LOW KB IMAGE) */
    /* ===================================================== */

    const buffer = Buffer.from(await file.arrayBuffer());

    const SIZE = 1000;

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
      .toBuffer();

    /* ===================================================== */
    /* ✅ RESPONSE */
    /* ===================================================== */

    return new NextResponse(finalImage, {
      headers: {
        "Content-Type": "image/jpeg",

        // ✅ Optional: Category Header (Future Automation Use)
        "X-Category": category,
      },
    });
  } catch (err) {
    console.error("Shipping Optimize Error:", err);

    return NextResponse.json(
      { success: false, error: "Shipping Optimization Failed" },
      { status: 500 }
    );
  }
}
