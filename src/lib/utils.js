import { validateSwedishBank, BANK_DATA } from './bank-rules';

/**
 * Calculates the Luhn checksum for a string of digits.
 * @param {string} str - The numeric string to check.
 * @returns {boolean} True if the Luhn checksum is valid.
 */
export function luhnCheck(str) {
    const cleanStr = str.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanStr.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanStr.charAt(i));
        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
}

/**
 * Validates a Swedish Personnummer.
 */
export function validatePersonnummer(ssn) {
    const clean = ssn.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    if (!luhnCheck(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra (Luhn)' };
    
    const month = parseInt(tenDigit.slice(2, 4));
    const day = parseInt(tenDigit.slice(4, 6));
    if (month < 1 || month > 12) return { valid: false, error: 'Ogiltig månad' };
    if (day > 60) {
         if (day < 61 || day > 91) return { valid: false, error: 'Ogiltig dag (Samordningsnummer)' };
    } else {
         if (day < 1 || day > 31) return { valid: false, error: 'Ogiltig dag' };
    }
    return { valid: true };
}

export function validateOrgNumber(org) {
    const clean = org.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    
    if (!luhnCheck(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    
    const middlePair = parseInt(tenDigit.slice(2, 4));
    if (middlePair < 20) return { valid: false, error: 'Mellanpar < 20 (Ogiltig Org.nr)' };
    
    return { valid: true };
}

export function validateVAT(vat) {
    const clean = vat.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean.startsWith('SE') || !clean.endsWith('01')) return { valid: false, error: 'Måste börja med SE och sluta med 01' };
    if (clean.length !== 14) return { valid: false, error: 'Felaktig längd (ska vara 14 tecken)' };
    
    const orgPart = clean.slice(2, 12);
    return validateOrgNumber(orgPart);
}

export function validateBankgiro(bg) {
    const clean = bg.replace(/\D/g, '');
    if (clean.length < 7 || clean.length > 8) return { valid: false, error: 'Felaktig längd' };
    return { valid: luhnCheck(clean), error: luhnCheck(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validatePlusgiro(pg) {
    const clean = pg.replace(/\D/g, '');
    // Plusgiro is 2-8 digits
    if (clean.length < 2 || clean.length > 8) return { valid: false, error: 'Felaktig längd (2-8 siffror)' };
    return { valid: luhnCheck(clean), error: luhnCheck(clean) ? null : 'Felaktig kontrollsiffra' };
}

// Re-export BANK_RANGES for data-provider.js compatibility
export const BANK_RANGES = BANK_DATA;

export function getBankFromClearing(clearing) {
    const c = parseInt(clearing.replace(/\D/g, '').slice(0, 4));
    const bank = BANK_DATA.find(r => c >= r.min && c <= r.max);
    return bank ? bank.name : 'Okänd Bank';
}

/**
 * Validates a Bank Account using the robust bank-rules engine.
 */
export function validateBankAccount(clearing, account) {
    if (!clearing || !account) return { valid: false, error: 'Saknar clearing eller kontonummer' };
    return validateSwedishBank(clearing, account);
}

/**
 * Generates an OCR reference number.
 * @param {number} length - Total length including check digits.
 * @param {boolean} lengthCheck - If true, embeds length indicator.
 */
export function generateOCR(length = 10, lengthCheck = false) {
    // Reserve space for Check digit (1) and optional Length digit (1)
    const payloadLen = length - 1 - (lengthCheck ? 1 : 0);
    let payload = '';
    
    // Generate random payload
    for (let i = 0; i < payloadLen; i++) {
        payload += Math.floor(Math.random() * 10);
    }

    if (lengthCheck) {
        // Add length indicator (Length % 10)
        payload += (length % 10).toString();
    }

    // Add Luhn check digit
    const checkDigit = getLuhnDigit(payload);
    return payload + checkDigit;
}

/**
 * Helper for generating luhn digit (reused from data-provider concept)
 */
function getLuhnDigit(payload) {
    for (let i = 0; i <= 9; i++) {
        if (luhnCheck(payload + i)) {
            return i.toString();
        }
    }
    return '0';
}

/**
 * Validates an OCR number.
 */
export function validateOCR(ocr) {
    const clean = ocr.replace(/\D/g, '');
    if (clean.length < 2) return { valid: false, error: 'För kort' };
    
    // Basic Luhn validation
    if (!luhnCheck(clean)) return { valid: false, error: 'Felaktig kontrollsiffra (Luhn)' };

    // Advanced: Check for Length Indicator (Hard check)
    // This is tricky because we don't know IF the number uses length check just by looking at it.
    return { valid: true };
}

export function getRandomElement(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
