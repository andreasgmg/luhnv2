import { validateSwedishBank } from './bank-rules';
import { mod10 } from './bank-math';
import { ALLOWED_CAR_LETTERS, FORBIDDEN_PLATES } from './car-data';

export interface ValidationResult {
    valid: boolean;
    error?: string | null;
    bankName?: string;
    city?: string;
    zip?: string;
    suggestedCity?: string;
    format?: 'old' | 'new'; // För bilnummer
}

// --- Domain Constants ---
const COORDINATION_NUMBER_DAY_OFFSET = 60;
const OVERNUMMERSERIE_20_OFFSET = 20;
const OVERNUMMERSERIE_40_OFFSET = 40;
const OVERNUMMERSERIE_60_OFFSET = 60;
const MAX_MONTH = 12;
const MAX_DAY = 31;

const MIN_ORG_MIDDLE_PAIR = 20;
const SWEDISH_VAT_PREFIX = 'SE';
const SWEDISH_VAT_SUFFIX = '01';
const VAT_LENGTH = 14;

const MIN_BG_LEN = 7;
const MAX_BG_LEN = 8;
const MIN_PG_LEN = 2;
const MAX_PG_LEN = 8;

/**
 * Validerar Personnummer och Samordningsnummer enligt SKV 704.
 */
export function validatePersonnummer(ssn: string): ValidationResult {
    const clean = ssn.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    if (!mod10(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra (Luhn)' };
    let month = parseInt(tenDigit.slice(2, 4), 10);
    let day = parseInt(tenDigit.slice(4, 6), 10);
    if (month > OVERNUMMERSERIE_60_OFFSET && month <= OVERNUMMERSERIE_60_OFFSET + MAX_MONTH) month -= OVERNUMMERSERIE_60_OFFSET;
    else if (month > OVERNUMMERSERIE_40_OFFSET && month <= OVERNUMMERSERIE_40_OFFSET + MAX_MONTH) month -= OVERNUMMERSERIE_40_OFFSET;
    else if (month > OVERNUMMERSERIE_20_OFFSET && month <= OVERNUMMERSERIE_20_OFFSET + MAX_MONTH) month -= OVERNUMMERSERIE_20_OFFSET;
    if (month < 1 || month > MAX_MONTH) return { valid: false, error: 'Ogiltig månad' };
    if (day >= COORDINATION_NUMBER_DAY_OFFSET) {
        const adjustedDay = day - COORDINATION_NUMBER_DAY_OFFSET;
        if (adjustedDay < 0 || adjustedDay > MAX_DAY) return { valid: false, error: 'Ogiltig dag för samordningsnummer' };
    } else {
        if (day < 1 || day > MAX_DAY) return { valid: false, error: 'Ogiltig dag' };
    }
    return { valid: true };
}

export function validateOrgNumber(org: string): ValidationResult {
    const clean = org.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    if (!mod10(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    const middlePair = parseInt(tenDigit.slice(2, 4), 10);
    if (middlePair < MIN_ORG_MIDDLE_PAIR) return { valid: false, error: `Ogiltigt organisationsnummer` };
    return { valid: true };
}

export function validateVAT(vat: string): ValidationResult {
    const clean = vat.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean.startsWith(SWEDISH_VAT_PREFIX) || !clean.endsWith(SWEDISH_VAT_SUFFIX)) return { valid: false, error: `Måste börja med ${SWEDISH_VAT_PREFIX}` };
    if (clean.length !== VAT_LENGTH) return { valid: false, error: `Felaktig längd` };
    return validateOrgNumber(clean.slice(2, 12));
}

export function validateBankgiro(bg: string): ValidationResult {
    const clean = bg.replace(/\D/g, '');
    if (clean.length < MIN_BG_LEN || clean.length > MAX_BG_LEN) return { valid: false, error: 'Felaktig längd' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validatePlusgiro(pg: string): ValidationResult {
    const clean = pg.replace(/\D/g, '');
    if (clean.length < 2 || clean.length > MAX_PG_LEN) return { valid: false, error: 'Felaktig längd' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validateBankAccount(clearing: string, account: string): ValidationResult {
    if (!clearing || !account) return { valid: false, error: 'Saknar data' };
    return validateSwedishBank(clearing, account);
}

export function validateOCR(ocr: string): ValidationResult {
    const clean = ocr.replace(/\D/g, '');
    if (clean.length < 2) return { valid: false, error: 'För kort' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validateCarPlate(plate: string): ValidationResult {
    const clean = plate.replace(/[\s-]/g, '').toUpperCase();
    if (clean.length !== 6) return { valid: false, error: 'Felaktig längd' };
    const letters = clean.slice(0, 3);
    const digits = clean.slice(3, 5);
    const lastChar = clean.slice(5);
    
    for (const char of letters) if (!ALLOWED_CAR_LETTERS.includes(char)) return { valid: false, error: 'Ogiltig bokstav' };
    
    // Check forbidden combinations
    if (FORBIDDEN_PLATES.includes(letters)) {
        return { valid: false, error: 'Spärrad bokstavskombination' };
    }

    if (!/^\d{2}$/.test(digits)) return { valid: false, error: 'Felaktigt format' };
    if (/^\d$/.test(lastChar)) return { valid: true, format: 'old' };
    if (ALLOWED_CAR_LETTERS.includes(lastChar) && lastChar !== 'O') return { valid: true, format: 'new' };
    return { valid: false, error: 'Ogiltigt sista tecken' };
}

export function validateSwish(number: string): ValidationResult {
    const clean = number.replace(/\D/g, '');
    if (clean.length !== 10) return { valid: false, error: 'Ett Swish-nummer för företag måste ha 10 siffror' };
    if (!clean.startsWith('123')) return { valid: false, error: 'Företags-Swish måste börja på 123' };
    return { valid: true };
}
