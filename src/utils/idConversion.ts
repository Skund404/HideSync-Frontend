// src/utils/idConversion.ts

/**
 * Converts a string ID (e.g. from URL params) to a number ID for API calls.
 * Returns undefined if the conversion fails.
 */
export const stringIdToNumber = (
  id: string | undefined
): number | undefined => {
  if (!id) return undefined;

  const numericId = parseInt(id, 10);
  return isNaN(numericId) ? undefined : numericId;
};

/**
 * Converts a number ID to a string ID (e.g. for URL params or display).
 * Returns undefined if the input is undefined.
 */
export const numberIdToString = (
  id: number | undefined
): string | undefined => {
  if (id === undefined) return undefined;
  return id.toString();
};

/**
 * Safely converts a string ID to a number ID, or returns a fallback value if conversion fails.
 */
export const safeStringIdToNumber = (
  id: string | undefined,
  fallback: number
): number => {
  const numericId = stringIdToNumber(id);
  return numericId !== undefined ? numericId : fallback;
};

/**
 * Checks if a string ID is valid (can be converted to a number).
 */
export const isValidStringId = (id: string | undefined): boolean => {
  return stringIdToNumber(id) !== undefined;
};
