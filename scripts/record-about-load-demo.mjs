import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, devices } from 'playwright'

const root = fileURLToPath(new URL('../', import.meta.url))
const outputDir = path.join(root, '.github/pr-demos/now-playing-ssr-load')
const baseUrl = process.env.DEMO_BASE_URL ?? 'http://localhost:4321'

async function recordLoad({ name, viewport, userAgent, isMobile }) {
  const profileDir = path.join(outputDir, `.tmp-${name}`)
  await rm(profileDir, { recursive: true, force: true })
  await mkdir(profileDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...viewport,
    userAgent,
    isMobile,
    hasTouch: isMobile,
    recordVideo: {
      dir: profileDir,
      size: viewport.viewport,
    },
    colorScheme: 'light',
  })

  const page = await context.newPage()
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.about-intro-blurb', { timeout: 15_000 })
  await page.waitForFunction(
    () =>
      document.body.innerText.includes('Recently listened to') ||
      document.body.innerText.includes('Currently listening to'),
    { timeout: 15_000 },
  )
  await page.waitForTimeout(1_000)

  await context.close()
  await browser.close()

  const artifacts = await readdir(profileDir)
  const webm = artifacts.find((file) => file.endsWith('.webm'))
  if (!webm) {
    throw new Error(`No recording produced for ${name}`)
  }

  const target = path.join(outputDir, `${name}.webm`)
  await rename(path.join(profileDir, webm), target)
  await rm(profileDir, { recursive: true, force: true })
  return target
}

await mkdir(outputDir, { recursive: true })

const desktopPath = await recordLoad({
  name: 'about-load-desktop',
  viewport: { viewport: { width: 1280, height: 800 } },
  isMobile: false,
})

const mobilePath = await recordLoad({
  name: 'about-load-mobile',
  viewport: devices['iPhone 14'],
  isMobile: true,
})

console.log('Recorded demos:')
console.log(desktopPath)
console.log(mobilePath)
