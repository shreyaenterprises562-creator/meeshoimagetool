import { NextResponse } from "next/server";
import { chromium } from "playwright";

export const runtime = "nodejs";

// -------------------------
// SIMPLE IN-MEMORY CACHE
// -------------------------
let cache: any = null;
let cacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  // ✅ CACHE HIT
  if (cache && Date.now() - cacheTime < CACHE_DURATION) {
    console.log("⚡ Meesho categories from cache");
    return NextResponse.json(cache);
  }

  console.log("🕸️ Scraping Meesho categories...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // -------------------------
    // LOGIN
    // -------------------------
    await page.goto("https://supplier.meesho.com");
    await page.fill("#email", process.env.MEESHO_EMAIL!);
    await page.fill("#password", process.env.MEESHO_PASSWORD!);
    await page.click("button[type=submit]");
    await page.waitForTimeout(6000);

    // -------------------------
    // GO TO ADD PRODUCT
    // -------------------------
    await page.goto("https://supplier.meesho.com/add-product");
    await page.waitForTimeout(4000);

    // -------------------------
    // SCRAPE CATEGORY TREE
    // -------------------------
    const categories = await page.evaluate(() => {
      const result: any[] = [];

      document.querySelectorAll("[data-category]").forEach((cat: any) => {
        const category = {
          id: cat.getAttribute("data-id"),
          name: cat.innerText.trim(),
          subcategories: [] as any[],
        };

        cat.querySelectorAll("[data-subcategory]").forEach((sub: any) => {
          const subCat = {
            id: sub.getAttribute("data-id"),
            name: sub.innerText.trim(),
            children: [] as any[],
          };

          sub.querySelectorAll("[data-child]").forEach((child: any) => {
            subCat.children.push({
              id: child.getAttribute("data-id"),
              name: child.innerText.trim(),
            });
          });

          category.subcategories.push(subCat);
        });

        result.push(category);
      });

      return result;
    });

    // -------------------------
    // SAVE TO CACHE
    // -------------------------
    cache = categories;
    cacheTime = Date.now();

    return NextResponse.json(categories);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  } finally {
    await browser.close();
  }
}
