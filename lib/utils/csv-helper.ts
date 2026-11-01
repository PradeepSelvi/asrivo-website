/**
 * Utility for formatting and sanitizing CSV cells and rows (CWE-1236 prevention).
 * Neutralizes spreadsheet formula elements (=, +, -, @, \t, \r, %) and handles RFC 4180 escaping.
 */

export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  // Neutralize formula prefixes (CWE-1236: CSV Injection)
  if (/^[=+\-@\t\r%]/.test(str)) {
    str = `'${str}`
  }
  // RFC 4180 double-quote escaping
  return `"${str.replace(/"/g, '""')}"`
}

export function formatCsvRow(cells: unknown[]): string {
  return cells.map(escapeCsvCell).join(',')
}

