import { webcrypto } from 'crypto';

/**
 * Returns a cryptographically secure random integer between min (inclusive) and max (inclusive).
 */
export function secureRandom(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const cutoff = Math.floor((256 ** bytesNeeded) / range) * range;
  const bytes = new Uint8Array(bytesNeeded);
  const value = new DataView(bytes.buffer);

  while (true) {
    // Use global crypto in browser/Edge or node's webcrypto
    (globalThis.crypto || webcrypto).getRandomValues(bytes);
    
    let randNum = 0;
    for (let i = 0; i < bytesNeeded; i++) {
        randNum = (randNum << 8) + bytes[i];
    }

    if (randNum < cutoff) {
      return min + (randNum % range);
    }
  }
}

/**
 * Slumpar ett element från en array säkert.
 */
export function getRandomElement<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[secureRandom(0, arr.length - 1)];
}