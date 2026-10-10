/**
 * Path prefixes whose next segment is a secret (a token that grants access).
 * Used to redact logs (src/lib/csp-report.ts) and analytics (src/lib/analytics.ts).
 * Keep in sync with the privateHeaders entries in next.config.ts.
 *
 * This tool has no secret links, so the list is empty.
 */
export const secretPathPrefixes: readonly string[] = [];
