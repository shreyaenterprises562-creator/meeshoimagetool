import { prisma } from "@/lib/db"
import { loginMeesho } from "./meeshoLogin"
import { getBrowser } from "./persistentBrowser"

export async function getMeeshoSession(userId: string) {

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error("USER_NOT_FOUND")
  }

  const browser = await getBrowser()

  /* ---------- COOKIE SESSION CHECK ---------- */

  if (user.meeshoCookies) {

    const context = await browser.newContext()

    await context.addCookies(user.meeshoCookies as any)

    const page = await context.newPage()

    await page.goto("https://supplier.meesho.com/dashboard", {
      waitUntil: "domcontentloaded"
    })

    /* SESSION VALID */

    if (!page.url().includes("login")) {

      return {
        page,
        context
      }

    }

    /* SESSION EXPIRED */

    await context.close()

  }

  /* ---------- AUTO RELOGIN ---------- */

  const session = await loginMeesho(
    user.meeshoEmail!,
    user.meeshoPassword!
  )

await prisma.user.update({
  where: { id: userId },
  data: {
    meeshoCookies: JSON.parse(JSON.stringify(session.cookies)),
    meeshoLoginAt: new Date()
  }
})

  const context = await browser.newContext()

  await context.addCookies(session.cookies as any)

  const page = await context.newPage()

  await page.goto("https://supplier.meesho.com/dashboard", {
    waitUntil: "domcontentloaded"
  })

  return {
    page,
    context
  }

}