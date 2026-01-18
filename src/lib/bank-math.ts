/**
 * Standard Luhn (Modulo 10) algorithm.
 * Used by Swedbank, Nordea Personkonto, etc.
 */
export function mod10(number: string): boolean {
    let len = number.length;
    let bit = 1;
    let sum = 0;
    let val: number;
    let arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
  
    while (len) {
      val = parseInt(number.charAt(--len), 10);
      sum += (bit ^= 1) ? arr[val] : val;
    }
  
    return sum > 0 && sum % 10 === 0;
  }
  
  /**
   * Modulo 11 algorithm.
   * Used by Handelsbanken, SEB, etc.
   * Weights: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2...
   */
  export function mod11(number: string): boolean {
    const len = number.length;
    let sum = 0;
    let weight = 1;
  
    for (let i = len - 1; i >= 0; i--) {
      const val = parseInt(number.charAt(i), 10);
      sum += val * weight;
      weight++;
      if (weight > 10) weight = 1;
    }
  
    return sum > 0 && sum % 11 === 0;
  }