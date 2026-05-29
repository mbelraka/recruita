/**
 * Returns the first property value on `source` that is neither `null` nor `undefined`.
 * Keys are tried in array order (same precedence as prior `??` chains).
 */
export function firstDefinedValue<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[]
): T[K] | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

/** Like {@link firstDefinedValue}, but coerces to a trimmed string or `undefined`. */
export function firstDefinedTrimmedString<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[]
): string | undefined {
  const raw = firstDefinedValue(source, keys);
  if (raw === undefined) {
    return undefined;
  }
  const normalized = String(raw).trim();
  return normalized || undefined;
}
