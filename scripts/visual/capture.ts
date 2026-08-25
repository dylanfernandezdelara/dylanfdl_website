import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { chromium, type Page } from 'playwright'

import { screenshotName, THEMES, VIEWPORTS, VISUAL_CASES, type VisualTheme } from './cases.ts'

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000'
const STABILIZE_CSS = `
  *, *::before, *::after {
    caret-color: transparent !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  video {
    visibility: hidden !important;
  }
`

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }
  return process.argv[index + 1]
}

async function applyTheme(page: Page, theme: VisualTheme): Promise<void> {
  await page.evaluate((nextTheme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(nextTheme)
    try {
      localStorage.setItem('theme', nextTheme)
    } catch {
      void 0
    }
  }, theme)
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }
    for (const video of document.querySelectorAll('video')) {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  })
  await page.waitForTimeout(150)
}

async function prepareState(page: Page, state: (typeof VISUAL_CASES)[number]['state']): Promise<void> {
  if (state === 'search') {
    await page.waitForTimeout(2100)
    await page.keyboard.press('Control+k')
    await page.waitForSelector('[data-search-overlay="true"]', { timeout: 5000 })
    await page.waitForTimeout(200)
    return
  }

  if (state === 'projects') {
    await page.getByRole('tab', { name: 'Projects' }).click()
    await page.waitForTimeout(200)
  }
}

async function main(): Promise<void> {
  const outDir = argValue('--out')
  if (!outDir) {
    throw new Error('Missing --out directory')
  }

  const baseUrl = argValue('--base-url') ?? DEFAULT_BASE_URL
  await mkdir(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  })
  const page = await context.newPage()
  page.on('pageerror', (error) => {
    console.error('pageerror', error.message)
  })

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport, height: 900 })
    for (const theme of THEMES) {
      for (const visualCase of VISUAL_CASES) {
        await page.goto(new URL(visualCase.route, baseUrl).toString(), {
          waitUntil: 'networkidle',
        })
        await page.addStyleTag({ content: STABILIZE_CSS })
        await applyTheme(page, theme)
        await prepareState(page, visualCase.state)
        await settle(page)

        const fileName = screenshotName(visualCase.id, viewport, theme)
        await page.screenshot({
          path: path.join(outDir, fileName),
          fullPage: true,
          animations: 'disabled',
        })
        console.log(`captured ${fileName}`)
      }
    }
  }

  await browser.close()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
