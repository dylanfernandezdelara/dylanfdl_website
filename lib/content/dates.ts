type DateFormat = 'full' | 'card'

type ParsedPostDate = {
  year: number
  month: number
  day: number
}

export function parseContentDate(
  date: string,
  allowedSegmentCounts: number[],
  validateCalendarDate = true
): ParsedPostDate | null {
  const segments = date.split('-')
  if (!allowedSegmentCounts.includes(segments.length)) {
    return null
  }

  if (segments.some((segment) => !/^\d+$/.test(segment))) {
    return null
  }

  const [year, month = 1, day = 1] = segments.map(Number)
  if (![year, month, day].every(Number.isInteger)) {
    return null
  }

  if (validateCalendarDate) {
    if (month < 1 || month > 12) {
      return null
    }

    const monthEnd = new Date(0)
    monthEnd.setFullYear(year, month, 0)
    const daysInMonth = monthEnd.getDate()
    if (day < 1 || day > daysInMonth) {
      return null
    }
  }

  return { year, month, day }
}

function toLocalDate({ year, month, day }: ParsedPostDate): Date {
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatParsedContentDate(
  date: string,
  locale: string,
  format: DateFormat,
  allowedSegmentCounts: number[],
  validateCalendarDate = true
): string {
  const parsed = parseContentDate(date, allowedSegmentCounts, validateCalendarDate)
  if (!parsed) {
    return date
  }

  const formatted = toLocalDate(parsed).toLocaleDateString(
    locale,
    format === 'full'
      ? {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      : {
          month: 'short',
          year: 'numeric',
        }
  )

  return format === 'card' ? formatted.replace(',', '') : formatted
}

export function formatContentDate(date: string, locale: string = 'en-US'): string {
  return formatParsedContentDate(date, locale, 'full', [3], false)
}

export function formatContentDateCardGrid(date: string, locale: string = 'en-US'): string {
  return formatParsedContentDate(date, locale, 'card', [1, 2, 3])
}
