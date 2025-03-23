// src/utils/enumUtils.ts

/**
 * Safely compares two enum values as strings to avoid type issues with enums
 * from different files that have the same values.
 *
 * @param value1 The first enum value to compare
 * @param value2 The second enum value to compare
 * @returns True if the string representations match, false otherwise
 */
export function compareEnumValues<
  T extends string | number,
  U extends string | number
>(value1: T, value2: U): boolean {
  return String(value1) === String(value2);
}

/**
 * Gets an enum value by its string representation from any enum type
 *
 * @param enumType The enum object to search in
 * @param value The string representation to look for
 * @returns The enum value if found, undefined otherwise
 */
export function getEnumValueByString<T extends Record<string, string | number>>(
  enumType: T,
  value: string
): T[keyof T] | undefined {
  const entries = Object.entries(enumType);
  const found = entries.find(
    ([_, val]) => String(val).toLowerCase() === value.toLowerCase()
  );

  return found ? (found[1] as T[keyof T]) : undefined;
}

/**
 * Safely formats an enum value for display by replacing underscores with spaces
 * and title-casing the result
 *
 * @param value The enum value to format
 * @returns Formatted string for display
 */
export function formatEnumValue(value: string | number): string {
  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
