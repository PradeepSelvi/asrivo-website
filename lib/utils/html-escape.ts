/**
 * HTML Escaping and Sanitization Utilities
 * Mitigates CWE-116: Improper Encoding or Escaping of Output
 */

/**
 * Encodes special characters to HTML entities so user input cannot break out
 * of HTML context or inject tags/scripts/links into HTML emails and documents.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Encodes special characters to HTML entities FIRST, and only then replaces
 * newline characters with `<br/>` tags.
 * This ensures multi-line user text preserves formatting without permitting HTML injection.
 */
export function escapeHtmlWithLineBreaks(str: unknown): string {
  return escapeHtml(str).replace(/\r\n|\n|\r/g, '<br/>')
}

/**
 * Sanitizes headers (such as email subject lines) to prevent email header injection (CRLF).
 */
export function sanitizeHeader(str: unknown, fallback = 'No Subject'): string {
  if (!str) return fallback
  const clean = String(str).replace(/[\r\n]+/g, ' ').trim()
  return clean || fallback
}
