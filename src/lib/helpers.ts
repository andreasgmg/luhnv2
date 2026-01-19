/**
 * Slumpar ett element från en array.
 */
export function getRandomElement<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
