import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }
  return process.argv[index + 1]
}

type CompareResult = {
  file: string
  pixels: number
  ratio: number
  width: number
  height: number
  status: 'pass' | 'fail' | 'missing'
  message?: string
}

const MAX_DIFF_RATIO = 0.001

async function compareFile(
  baselineDir: string,
  treatmentDir: string,
  diffDir: string,
  file: string,
): Promise<CompareResult> {
  const baselinePath = path.join(baselineDir, file)
  const treatmentPath = path.join(treatmentDir, file)

  let baseline: Buffer
  let treatment: Buffer
  try {
    baseline = await readFile(baselinePath)
    treatment = await readFile(treatmentPath)
  } catch (error) {
    return {
      file,
      pixels: -1,
      ratio: 1,
      width: 0,
      height: 0,
      status: 'missing',
      message: error instanceof Error ? error.message : 'missing screenshot',
    }
  }

  const baselinePng = PNG.sync.read(baseline)
  const treatmentPng = PNG.sync.read(treatment)
  if (baselinePng.width !== treatmentPng.width || baselinePng.height !== treatmentPng.height) {
    return {
      file,
      pixels: -1,
      ratio: 1,
      width: baselinePng.width,
      height: baselinePng.height,
      status: 'fail',
      message: `size mismatch ${baselinePng.width}x${baselinePng.height} vs ${treatmentPng.width}x${treatmentPng.height}`,
    }
  }

  const diff = new PNG({ width: baselinePng.width, height: baselinePng.height })
  const pixels = pixelmatch(
    baselinePng.data,
    treatmentPng.data,
    diff.data,
    baselinePng.width,
    baselinePng.height,
    { threshold: 0.1 },
  )
  const ratio = pixels / (baselinePng.width * baselinePng.height)
  const status = ratio <= MAX_DIFF_RATIO ? 'pass' : 'fail'
  if (pixels > 0) {
    await writeFile(path.join(diffDir, file), PNG.sync.write(diff))
  }

  return {
    file,
    pixels,
    ratio,
    width: baselinePng.width,
    height: baselinePng.height,
    status,
  }
}

async function main(): Promise<void> {
  const baselineDir = argValue('--baseline')
  const treatmentDir = argValue('--treatment')
  const outDir = argValue('--out')
  if (!baselineDir || !treatmentDir || !outDir) {
    throw new Error('Usage: compare.ts --baseline <dir> --treatment <dir> --out <dir>')
  }

  const diffDir = path.join(outDir, 'diff')
  await mkdir(diffDir, { recursive: true })

  const baselineFiles = (await readdir(baselineDir)).filter((file) => file.endsWith('.png')).sort()
  const treatmentFiles = (await readdir(treatmentDir)).filter((file) => file.endsWith('.png')).sort()
  const files = [...new Set([...baselineFiles, ...treatmentFiles])]

  const results: CompareResult[] = []
  for (const file of files) {
    const result = await compareFile(baselineDir, treatmentDir, diffDir, file)
    results.push(result)
    const detail = result.message ?? `${result.pixels}px (${(result.ratio * 100).toFixed(4)}%)`
    console.log(`${result.status.toUpperCase()} ${file} ${detail}`)
  }

  const failed = results.filter((result) => result.status !== 'pass')
  const report = {
    maxDiffRatio: MAX_DIFF_RATIO,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  }
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)

  if (failed.length > 0) {
    process.exit(1)
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
