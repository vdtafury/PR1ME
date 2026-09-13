/**
 * Normalizes Egyptian phone numbers to standard 11 digits format (e.g. 01012345678)
 * Strips out spaces, dashes, +20, 0020, or leading 20.
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return "";
  
  // Remove all non-digit characters except leading +
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, "").trim();

  // Strip international prefixes for Egypt (+20, 0020, 20)
  if (cleaned.startsWith("+20")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("0020")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("20") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Ensure it starts with 0 if it starts with 1 (e.g. 1012345678 -> 01012345678)
  if (cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = "0" + cleaned;
  }

  return cleaned;
}

/**
 * Checks if two phone strings match using normalized format
 */
export function phonesMatch(p1?: string | null, p2?: string | null): boolean {
  if (!p1 || !p2) return false;
  return normalizePhone(p1) === normalizePhone(p2);
}
