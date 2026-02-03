/**
 * Format a number using Norwegian locale
 * @param num - The number to format
 * @returns The formatted number string with Norwegian locale (space as thousands separator)
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }
  return num.toLocaleString("nb-NO");
}
