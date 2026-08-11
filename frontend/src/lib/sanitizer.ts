/**
 * Client-Side Input Sanitizer & Security Utilities
 */

export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}

export function isValidIPFSHash(cid: string): boolean {
  if (!cid) return false;
  // Validates Qm... (v0 46 chars) or bafy... (v1 base32)
  const v0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const v1Regex = /^bafy[a-z0-9]{55,59}$/i;
  const sha256HexRegex = /^0x[a-fA-F0-9]{64}$/;
  return v0Regex.test(cid) || v1Regex.test(cid) || sha256HexRegex.test(cid);
}

export function formatTruncatedHash(hash: string, lead = 8, tail = 6): string {
  if (!hash || hash.length <= lead + tail) return hash;
  return `${hash.substring(0, lead)}...${hash.substring(hash.length - tail)}`;
}
