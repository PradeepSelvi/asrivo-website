/**
 * Currency utilities for CRM
 * Manages currency settings and provides default currencies
 */

export interface Currency {
  code: string
  symbol: string
  name: string
  isDefault: boolean
  exchangeRate?: number // Rate relative to base currency (default currency = 1.0)
}

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', isDefault: true, exchangeRate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', isDefault: false, exchangeRate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', isDefault: false, exchangeRate: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', isDefault: false, exchangeRate: 83.12 },
]

/**
 * Get currencies from localStorage or return defaults
 * This runs on client-side only
 */
export function getCurrencies(): Currency[] {
  if (typeof window === 'undefined') {
    return DEFAULT_CURRENCIES
  }

  try {
    const stored = localStorage.getItem('crm_currencies')
    if (stored) {
      const currencies = JSON.parse(stored) as Currency[]
      return currencies.length > 0 ? currencies : DEFAULT_CURRENCIES
    }
  } catch (error) {
    console.error('Failed to load currencies:', error)
  }

  return DEFAULT_CURRENCIES
}

/**
 * Get the default currency code
 */
export function getDefaultCurrency(): string {
  const currencies = getCurrencies()
  const defaultCurrency = currencies.find(c => c.isDefault)
  return defaultCurrency?.code || 'USD'
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currencies = getCurrencies()
  const currency = currencies.find(c => c.code === code)
  return currency?.symbol || '$'
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currencyCode: string = 'USD'): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${value.toLocaleString()}`
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const currencies = getCurrencies()
  const fromCurr = currencies.find(c => c.code === fromCurrency)
  const toCurr = currencies.find(c => c.code === toCurrency)

  if (!fromCurr || !toCurr) {
    return amount
  }

  // Convert to base currency first, then to target currency
  const fromRate = fromCurr.exchangeRate || 1.0
  const toRate = toCurr.exchangeRate || 1.0

  return (amount / fromRate) * toRate
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return 1.0
  }

  const currencies = getCurrencies()
  const fromCurr = currencies.find(c => c.code === fromCurrency)
  const toCurr = currencies.find(c => c.code === toCurrency)

  if (!fromCurr || !toCurr) {
    return 1.0
  }

  const fromRate = fromCurr.exchangeRate || 1.0
  const toRate = toCurr.exchangeRate || 1.0

  return toRate / fromRate
}
