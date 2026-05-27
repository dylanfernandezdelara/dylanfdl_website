import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve(
  process.env.OUT_DIR ?? 'docs/migration-screenshots/baseline'
)

const viewports = [
  { id: 'mobile', width: 390, height: 844 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'desktop', width: 1280, height: 800 },
  { id: 'wide', width: 1536, height: 900 },
]

const routes = [
  { name: 'about', path: '/about' },
  { name: 'essay-purpose-of-writing', path: '/essays/purpose-of-writing' },
  { name: '404', path: '/essays/__nonexistent__' },
]

const themes = ['light', 'dark']

async function applyTheme(page, theme) {
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(t)
  }, theme)
}

async function main() {
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3000'
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()

  for (const viewport of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })

      for (const route of routes) {
        const page = await context.newPage()
        await applyTheme(page, theme)
        await page.goto(`${baseURL}${route.path}`, { waitUntil: 'load' })
        await page.waitForTimeout(800)

        const filename = `${route.name}-${viewport.id}-${theme}.png`
        await page.screenshot({
          path: path.join(OUT_DIR, filename),
          fullPage: true,
        })
        await page.close()
      }

      await context.close()
    }
  }

  // Redirect check
  const redirectPage = await browser.newPage()
  const response = await redirectPage.goto(`${baseURL}/`, { waitUntil: 'commit' })
  const redirectNote = {
    url: redirectPage.url(),
    status: response?.status(),
  }
  fs.writeFileSync(
    path.join(OUT_DIR, 'redirect-root.json'),
    JSON.stringify(redirectNote, null, 2)
  )
  await redirectPage.close()

  await browser.close()
  console.log(`Saved screenshots to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
