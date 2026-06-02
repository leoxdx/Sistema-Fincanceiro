export const MAX_TRANSACTION_AMOUNT = 99000

export function parseCurrencyAmount(value: string): number | null {
  const cleanValue = value.trim().replace(/\s/g, '').replace(/^R\$/i, '')

  if (!cleanValue) return null

  let normalizedValue = cleanValue

  if (cleanValue.includes(',')) {
    normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.')
  } else {
    const dotMatches = cleanValue.match(/\./g) ?? []
    const hasThousandSeparator = /^\d{1,3}(\.\d{3})+$/.test(cleanValue)

    if (hasThousandSeparator) {
      normalizedValue = cleanValue.replace(/\./g, '')
    } else if (dotMatches.length > 1) {
      const lastDotIndex = cleanValue.lastIndexOf('.')
      normalizedValue = `${cleanValue.slice(0, lastDotIndex).replace(/\./g, '')}.${cleanValue.slice(lastDotIndex + 1)}`
    }
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) return null

  const amount = Number(normalizedValue)
  return Number.isFinite(amount) ? amount : null
}

export function validateTransactionAmount(value: string): string | null {
  const amount = parseCurrencyAmount(value)

  if (amount === null) return 'Valor invalido'
  if (amount <= 0) return 'Valor deve ser maior que zero'
  if (amount > MAX_TRANSACTION_AMOUNT) return 'Valor deve ser de ate R$ 99.000,00'

  return null
}
