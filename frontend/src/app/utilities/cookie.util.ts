/** Reads a cookie value from a `document.cookie` header string. */
export function readCookieValue(
  cookieHeader: string,
  name: string
): string | null {
  if (!cookieHeader || !name) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const part of cookies) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) {
      continue;
    }
    const value = trimmed.slice(name.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}
