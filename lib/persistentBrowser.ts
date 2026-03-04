import { chromium, Browser } from "playwright"

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {

  if (browser) {
    return browser
  }

  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  })

  console.log("🚀 Persistent Browser Started")

  return browser
}

export async function resetBrowser() {

  if (browser) {
    console.log("♻️ Restarting Browser")

    await browser.close()
    browser = null
  }

  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  })

  console.log("🚀 Browser Restarted")

  return browser
}