import { chromium } from "playwright";

export async function uploadAndFetch(imagePath: string, category: string, price: number) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://supplier.meesho.com");

  // LOGIN (credentials from env)
  await page.fill("#email", process.env.MEESHO_EMAIL!);
  await page.fill("#password", process.env.MEESHO_PASSWORD!);
  await page.click("button[type=submit]");
  await page.waitForTimeout(5000);

  // Upload product (simplified)
  await page.goto("https://supplier.meesho.com/add-product");
  await page.setInputFiles("input[type=file]", imagePath);

  // Category + price
  await page.fill("input[name=price]", price.toString());

  // WAIT for shipping calculation
  await page.waitForTimeout(4000);

  // SCRAPE shipping
  const shipping = Number(await page.textContent(".shipping"));
  const gst = shipping * 0.18;
  const total = shipping + gst + price;

  await browser.close();

  return { shipping, gst, total };
}
