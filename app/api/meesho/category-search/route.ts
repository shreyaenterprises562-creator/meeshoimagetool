import { NextResponse } from "next/server";
import { chromium } from "playwright";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: true, categories: [] });
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // ✅ LOGIN
    await page.goto("https://supplier.meesho.com");

    await page.fill("#email", process.env.MEESHO_EMAIL!);
    await page.fill("#password", process.env.MEESHO_PASSWORD!);

    await page.click("button[type=submit]");
    await page.waitForTimeout(6000);

    // ✅ Go to Add Catalog Page (Search Category Exists)
    await page.goto(
      "https://supplier.meesho.com/panel/v3/new/cataloging/jicpn/catalogs/single/add"
    );

    await page.waitForTimeout(4000);

    // ✅ Type query in search box
    await page.fill("input[type='text']", query);
    await page.waitForTimeout(2000);

    // ✅ Extract suggestion list (Meesho dropdown)
    const suggestions = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("li"));

      return items
        .map((el) => el.textContent?.trim())
        .filter((x) => x && x.length > 3)
        .slice(0, 10);
    });

    await browser.close();

    return NextResponse.json({
      success: true,
      categories: suggestions,
    });
  } catch (err) {
    console.error("Category Search Error:", err);
    return NextResponse.json(
      { success: false, categories: [] },
      { status: 500 }
    );
  }
}
