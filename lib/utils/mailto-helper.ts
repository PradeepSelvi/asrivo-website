/**
 * Utility for safely constructing mailto URIs with proper percent-encoding.
 * Prevents mailto parameter injection (CWE-116) from user-controlled email addresses,
 * subjects, or bodies.
 */

export interface MailtoOptions {
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}

/**
 * Builds a safe mailto: URI where the mailbox address and all query parameters
 * are strictly percent-encoded so that special characters (like `?`, `&`, `#`, `=`, etc.)
 * cannot alter the URI structure or inject unintended parameters.
 */
export function buildSafeMailto(email?: string | null, options?: MailtoOptions): string {
  if (!email || typeof email !== 'string') {
    return '#';
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return '#';
  }

  // RFC 6068: In a mailto URI, characters such as ?, =, &, # in the email address
  // must be percent-encoded to prevent query injection into the mailto scheme.
  // Using encodeURIComponent on the mailbox address safely isolates it.
  const encodedEmail = encodeURIComponent(trimmedEmail);

  if (!options) {
    return `mailto:${encodedEmail}`;
  }

  const queryParts: string[] = [];

  if (options.subject) {
    queryParts.push(`subject=${encodeURIComponent(options.subject)}`);
  }
  if (options.body) {
    queryParts.push(`body=${encodeURIComponent(options.body)}`);
  }
  if (options.cc) {
    queryParts.push(`cc=${encodeURIComponent(options.cc)}`);
  }
  if (options.bcc) {
    queryParts.push(`bcc=${encodeURIComponent(options.bcc)}`);
  }

  if (queryParts.length === 0) {
    return `mailto:${encodedEmail}`;
  }

  return `mailto:${encodedEmail}?${queryParts.join('&')}`;
}

