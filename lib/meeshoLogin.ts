import { chromium } from "playwright";

export async function loginMeesho(email:string,password:string){

const browser = await chromium.launch({
executablePath:"/usr/bin/chromium",
headless:true,
args:["--no-sandbox","--disable-setuid-sandbox"]
})

const context = await browser.newContext()
const page = await context.newPage()

await page.goto("https://supplier.meesho.com/")

await page.fill('input[type="email"]',email)
await page.fill('input[type="password"]',password)

await page.click('button[type="submit"]')

await page.waitForURL("**/dashboard**",{timeout:60000})

const cookies = await context.cookies()

return {
browser,
context,
page,
cookies
}

}