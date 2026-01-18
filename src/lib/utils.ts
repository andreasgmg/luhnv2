import { validateSwedishBank, BANK_DATA } from './bank-rules';

/**
 * Beräknar Luhn-kontrollsumma för en siffersträng.
 */
export function luhnCheck(str: string): boolean {
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

export interface ValidationResult {
    valid: boolean;
    error?: string | null;
    bankName?: string;
    city?: string;
    zip?: string;
    suggestedCity?: string;
}

/**
 * Validerar Personnummer och Samordningsnummer enligt SKV 704.
 * Hanterar Övernummerserier (+20, +40, +60 på månad) och okända födelsedatum (dag 60).
 */
export function validatePersonnummer(ssn: string): ValidationResult {
    const clean = ssn.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    if (!luhnCheck(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra (Luhn)' };
    
    let month = parseInt(tenDigit.slice(2, 4));
    let day = parseInt(tenDigit.slice(4, 6));

    // 1. Hantera Övernummerserier (SKV 704)
    // Månaden kan vara MM+20, MM+40 eller MM+60 om ordinarie nummer är slut.
    if (month > 60 && month <= 72) month -= 60;
    else if (month > 40 && month <= 52) month -= 40;
    else if (month > 20 && month <= 32) month -= 20;

    if (month < 1 || month > 12) return { valid: false, error: 'Ogiltig månad (även efter justering för övernummerserie)' };

    // 2. Hantera Samordningsnummer (+60 på dag)
    if (day >= 60) {
        // Dag 60 betyder "Okänt födelsedatum" (Nytt i SKV 704)
        // Dag 61-91 är vanliga samordningsnummer
        if (day < 60 || day > 91) return { valid: false, error: 'Ogiltig dag för samordningsnummer (60-91)' };
    } else {
        // Vanligt personnummer (1-31)
        if (day < 1 || day > 31) return { valid: false, error: 'Ogiltig dag (1-31)' };
    }

    return { valid: true };
}

export function validateOrgNumber(org: string): ValidationResult {
    const clean = org.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    
    if (!luhnCheck(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    
    const middlePair = parseInt(tenDigit.slice(2, 4));
    // Enligt SKV 704 ska tredje siffran i org.nr vara lägst 2.
    if (middlePair < 20) return { valid: false, error: 'Ogiltigt organisationsnummer (mellanpar < 20)' };
    
    return { valid: true };
}

export function validateVAT(vat: string): ValidationResult {
    const clean = vat.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean.startsWith('SE') || !clean.endsWith('01')) return { valid: false, error: 'Måste börja med SE och sluta med 01' };
    if (clean.length !== 14) return { valid: false, error: 'Felaktig längd (14 tecken)' };
    const orgPart = clean.slice(2, 12);
    return validateOrgNumber(orgPart);
}

export function validateBankgiro(bg: string): ValidationResult {
    const clean = bg.replace(/\D/g, '');
    if (clean.length < 7 || clean.length > 8) return { valid: false, error: 'Felaktig längd' };
    return { valid: luhnCheck(clean), error: luhnCheck(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validatePlusgiro(pg: string): ValidationResult {
    const clean = pg.replace(/\D/g, '');
    if (clean.length < 2 || clean.length > 8) return { valid: false, error: 'Felaktig längd' };
    return { valid: luhnCheck(clean), error: luhnCheck(clean) ? null : 'Felaktig kontrollsiffra' };
}

export const BANK_RANGES = BANK_DATA;

export function validateBankAccount(clearing: string, account: string): ValidationResult {
    if (!clearing || !account) return { valid: false, error: 'Saknar clearing eller kontonummer' };
    return validateSwedishBank(clearing, account);
}

export function generateOCR(length = 10, lengthCheck = false): string {
    const payloadLen = length - 1 - (lengthCheck ? 1 : 0);
    let payload = '';
    for (let i = 0; i < payloadLen; i++) payload += Math.floor(Math.random() * 10);
    if (lengthCheck) payload += (length % 10).toString();
    
    // getLuhnDigit helper
    const getDigit = (p: string) => {
        for (let i = 0; i <= 9; i++) if (luhnCheck(p + i)) return i.toString();
        return '0';
    };
    return payload + getDigit(payload);
}

export function validateOCR(ocr: string): ValidationResult {
    const clean = ocr.replace(/\D/g, '');
    if (clean.length < 2) return { valid: false, error: 'För kort' };
    if (!luhnCheck(clean)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    return { valid: true };
}

export function getRandomElement<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
