const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function getTodayDateInputValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateOnlyParts(date: string) {
  const match = DATE_ONLY_PATTERN.exec(date)
  if (!match) return null

  const [, year, month, day] = match
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day)
  }
}

export function formatDateOnlyForDisplay(date: string): string {
  const parts = parseDateOnlyParts(date)
  if (!parts) return date

  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`
}

export function getDateOnlyMonthIndex(date: string): number {
  const parts = parseDateOnlyParts(date)
  return parts ? parts.month - 1 : -1
}

export function getDateOnlyYear(date: string): number {
  const parts = parseDateOnlyParts(date)
  return parts ? parts.year : Number.NaN
}

export function parseDateOnlyToUtcDate(date: string): Date {
  const parts = parseDateOnlyParts(date)
  if (!parts) return new Date(date)

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
}

export function formatDateOnlyFromDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function createMonthDateRange(year: string, month: string) {
  const yearNumber = Number(year)
  const monthNumber = Number(month)
  const start = new Date(Date.UTC(yearNumber, monthNumber - 1, 1))
  const end = new Date(Date.UTC(yearNumber, monthNumber, 1))

  return { start, end }
}

export function createDateOnlyRange(startDate: string, endDate: string) {
  const start = parseDateOnlyToUtcDate(startDate)
  const end = parseDateOnlyToUtcDate(endDate)
  end.setUTCDate(end.getUTCDate() + 1)

  return { start, end }
}
