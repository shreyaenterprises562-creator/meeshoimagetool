import { chromium } from "playwright";

export async function launchBrowser() {
  return chromium.launch({
    headless: false,   // 👈 browser dikhega
    slowMo: 100,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
