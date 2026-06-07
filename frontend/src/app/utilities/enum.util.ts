export function createEnumGuard<T extends string>(
  enumObject: Record<string, T>
): (value: unknown) => value is T {
  const values = new Set<string>(Object.values(enumObject));
  return (value: unknown): value is T =>
    typeof value === 'string' && values.has(value);
}

export function joinEnumValues(
  enumObject: Record<string, string>,
  separator: string
): string {
  return Object.values(enumObject).join(separator);
}
