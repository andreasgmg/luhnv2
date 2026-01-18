/**
 * Standard Luhn (Modulo 10) algorithm.
 * Used by Personnummer, Organisationsnummer, Bankgiro, etc.
 * 
 * Logic: Every second digit (from the right) is multiplied by 2. 
 * If the result is > 9, subtract 9. Sum all digits.
 */
export function mod10(str: string): boolean {
    const cleanStr = str.replace(/\D/g, '');
    if (!cleanStr) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    // Iterate from right to left
    for (let i = cleanStr.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanStr.charAt(i), 10);
        
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
}

/**
 * Modulo 11 algorithm.
 * Used by Handelsbanken, SEB, etc.
 * Weights: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2...
 */
export function mod11(str: string): boolean {
    const cleanStr = str.replace(/\D/g, '');
    if (!cleanStr) return false;
    
    let sum = 0;
    let weight = 1;

    // Iterate from right to left
    for (let i = cleanStr.length - 1; i >= 0; i--) {
        const digit = parseInt(cleanStr.charAt(i), 10);
        sum += digit * weight;
        
        weight++;
        if (weight > 10) weight = 1;
    }

    // A valid Mod11 number must result in a sum divisible by 11 and not be zero
    return sum > 0 && sum % 11 === 0;
}