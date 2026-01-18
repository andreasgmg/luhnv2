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
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Invalid length' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    if (!luhnCheck(tenDigit)) return { valid: false, error: 'Invalid Checksum' };
    
    // Simple Date Check
    const month = parseInt(tenDigit.slice(2, 4));
    const day = parseInt(tenDigit.slice(4, 6));
    if (month < 1 || month > 12) return { valid: false };
    if (day > 60) { // Samordningsnummer
         if (day < 61 || day > 91) return { valid: false };
    } else {
         if (day < 1 || day > 31) return { valid: false };
    }
    return { valid: true };
}

/**
 * Validates a Swedish Organization Number.
 * Format: XXXXXX-XXXX. Middle pair >= 20. Luhn check.
 */
export function validateOrgNumber(org) {
    const clean = org.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    
    if (!luhnCheck(tenDigit)) return { valid: false, error: 'Invalid Checksum' };
    
    const middlePair = parseInt(tenDigit.slice(2, 4));
    if (middlePair < 20) return { valid: false, error: 'Middle pair < 20' };
    
    return { valid: true };
}

/**
 * Validates a Swedish VAT Number (Momsnummer).
 * Format: SE + OrgNum + 01.
 */
export function validateVAT(vat) {
    const clean = vat.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean.startsWith('SE') || !clean.endsWith('01')) return { valid: false };
    if (clean.length !== 14) return { valid: false };
    
    const orgPart = clean.slice(2, 12);
    return validateOrgNumber(orgPart);
}

/**
 * Validates a Bankgiro number.
 * 7 or 8 digits. Luhn Check.
 */
export function validateBankgiro(bg) {
    const clean = bg.replace(/\D/g, '');
    if (clean.length < 7 || clean.length > 8) return { valid: false };
    return { valid: luhnCheck(clean) };
}

/**
 * Bank Clearing Number Ranges (Simplified)
 */
export const BANK_RANGES = [
    { name: 'Swedbank', min: 8000, max: 8999 },
    { name: 'Swedbank', min: 7000, max: 7999 }, // Partial, mostly Swedbank
    { name: 'Handelsbanken', min: 6000, max: 6999 },
    { name: 'SEB', min: 5000, max: 5999 },
    { name: 'SEB', min: 9120, max: 9124 },
    { name: 'Nordea', min: 1100, max: 1199 },
    { name: 'Nordea', min: 1400, max: 2099 },
    { name: 'Nordea', min: 3000, max: 3399 },
    { name: 'Nordea', min: 4000, max: 4999 }, // Nordea Personkonto
    { name: 'Danske Bank', min: 1200, max: 1399 },
    { name: 'Danske Bank', min: 2400, max: 2499 },
    { name: 'Länsförsäkringar', min: 3400, max: 3409 },
    { name: 'Länsförsäkringar', min: 9020, max: 9029 },
    { name: 'Länsförsäkringar', min: 9060, max: 9069 },
    { name: 'Skandia', min: 9150, max: 9169 },
    { name: 'SBAB', min: 9250, max: 9259 },
    { name: 'ICA Banken', min: 9270, max: 9279 }
];

/**
 * Identifies the bank from a clearing number.
 */
export function getBankFromClearing(clearing) {
    const c = parseInt(clearing.replace(/\D/g, '').slice(0, 4));
    const bank = BANK_RANGES.find(r => c >= r.min && c <= r.max);
    return bank ? bank.name : 'Unknown Bank';
}

/**
 * Validates a Bank Account (Basic).
 * Checks clearing number range and total length (usually 11-15 digits including clearing).
 * Note: Full modulo validation varies wildly by bank and is complex.
 */
export function validateBankAccount(clearing, account) {
    const cleanClearing = clearing.replace(/\D/g, '');
    const cleanAccount = account.replace(/\D/g, '');
    
    if (cleanClearing.length < 4 || cleanClearing.length > 5) return { valid: false, error: 'Invalid Clearing' };
    
    const bankName = getBankFromClearing(cleanClearing);
    if (bankName === 'Unknown Bank') return { valid: false, error: 'Unknown Clearing Range' };

    // Swedbank has 5 digit clearing sometimes, accounts vary.
    // Total length check (Clearing + Account)
    const totalLen = cleanClearing.length + cleanAccount.length;
    if (totalLen < 10 || totalLen > 15) return { valid: false, error: 'Invalid Total Length' };

    return { valid: true, bankName };
}