// localStorage is shared by every path on an origin. Keep the preview site's
// progress and preferences separate from the published game's existing keys.
export function scopeStorageKey(key, pathname = globalThis.location?.pathname ?? "") {
  try { pathname = decodeURIComponent(pathname); } catch { /* Keep malformed escapes unchanged. */ }
  const normalizedPath = pathname.replace(/\/{2,}/g, "/");
  return /^\/DIS1(?:\/|$)/.test(normalizedPath) ? `${key}-DIS1` : key;
}
