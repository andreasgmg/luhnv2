import { validateSwedishBank, BANK_DATA } from './bank-rules';
import { mod10 } from './bank-math';

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
 */
export function validatePersonnummer(ssn: string): ValidationResult {
    const clean = ssn.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    
    // Luhn körs alltid på 10 siffror
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    if (!mod10(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra (Luhn)' };
    
    let month = parseInt(tenDigit.slice(2, 4));
    let day = parseInt(tenDigit.slice(4, 6));

    // Hantera Övernummerserier
    if (month > 60 && month <= 72) month -= 60;
    else if (month > 40 && month <= 52) month -= 40;
    else if (month > 20 && month <= 32) month -= 20;

    if (month < 1 || month > 12) return { valid: false, error: 'Ogiltig månad' };

    if (day >= 60) {
        if (day < 60 || day > 91) return { valid: false, error: 'Ogiltig dag för samordningsnummer' };
    } else {
        if (day < 1 || day > 31) return { valid: false, error: 'Ogiltig dag' };
    }

    return { valid: true };
}

export function validateOrgNumber(org: string): ValidationResult {
    const clean = org.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    
    if (!mod10(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    
    const middlePair = parseInt(tenDigit.slice(2, 4));
    if (middlePair < 20) return { valid: false, error: 'Ogiltigt organisationsnummer (mellanpar < 20)' };
    
    return { valid: true };
}

export function validateVAT(vat: string): ValidationResult {
    const clean = vat.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean.startsWith('SE') || !clean.endsWith('01')) return { valid: false, error: 'Måste börja med SE och sluta med 01' };
    if (clean.length !== 14) return { valid: false, error: 'Felaktig längd' };
    const orgPart = clean.slice(2, 12);
    return validateOrgNumber(orgPart);
}

export function validateBankgiro(bg: string): ValidationResult {
    const clean = bg.replace(/\D/g, '');
    if (clean.length < 7 || clean.length > 8) return { valid: false, error: 'Felaktig längd' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validatePlusgiro(pg: string): ValidationResult {
    const clean = pg.replace(/\D/g, '');
    if (clean.length < 2 || clean.length > 8) return { valid: false, error: 'Felaktig längd' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
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
    
    const getDigit = (p: string) => {
        for (let i = 0; i <= 9; i++) if (mod10(p + i)) return i.toString();
        return '0';
    };
    return payload + getDigit(payload);
}

export function validateOCR(ocr: string): ValidationResult {
    const clean = ocr.replace(/\D/g, '');
    if (clean.length < 2) return { valid: false, error: 'För kort' };
    if (!mod10(clean)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    return { valid: true };
}

export function getRandomElement<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
