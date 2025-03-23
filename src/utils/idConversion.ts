// src/utils/idConversion.ts

/**
 * Converts a string ID to a number.
 * @param id The string ID to convert
 * @returns The numeric ID or 0 if conversion failed
 */
export function stringIdToNumber(id: string | undefined): number {
  if (!id) return 0;

  const numId = parseInt(id, 10);
  return isNaN(numId) ? 0 : numId;
}

/**
 * Converts a number ID to a string.
 * @param id The number ID to convert
 * @returns The string ID or undefined if conversion failed
 */
export function numberIdToString(id: number | undefined): string | undefined {
  if (id === undefined || id === null) return undefined;
  return id.toString();
}

/**
 * Safely converts a number ID to a non-undefined string.
 * @param id The number ID to convert
 * @param defaultValue Optional default value if ID is invalid
 * @returns The string ID or defaultValue (empty string if not specified)
 */
export function safeNumberIdToString(
  id: number | undefined,
  defaultValue: string = ''
): string {
  const stringId = numberIdToString(id);
  return stringId === undefined ? defaultValue : stringId;
}

/**
 * Safely converts a string ID to a non-zero number.
 * @param id The string ID to convert
 * @param defaultValue Optional default value if ID is invalid
 * @returns The numeric ID or defaultValue (0 if not specified)
 */
export function safeStringIdToNumber(
  id: string | undefined,
  defaultValue: number = 0
): number {
  const numId = stringIdToNumber(id);
  return numId === 0 ? defaultValue : numId;
}
