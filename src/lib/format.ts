/**
 * Format a number using Norwegian locale
 * @param num - The number to format
 * @returns The formatted number string with Norwegian locale (space as thousands separator)
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("nb-NO");
}
