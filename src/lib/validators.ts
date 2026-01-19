import { validateSwedishBank } from './bank-rules';
import { mod10 } from './bank-math';

export interface ValidationResult {
    valid: boolean;
    error?: string | null;
    bankName?: string;
    city?: string;
    zip?: string;
    suggestedCity?: string;
}

// --- Domain Constants (Module Scope) ---

// SKV 704 Constants
const COORDINATION_NUMBER_DAY_OFFSET = 60;
const OVERNUMMERSERIE_20_OFFSET = 20;
const OVERNUMMERSERIE_40_OFFSET = 40;
const OVERNUMMERSERIE_60_OFFSET = 60;

const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MIN_DAY = 1;
const MAX_DAY = 31;

// Business Rules
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

    // Hantera Övernummerserier (SKV 704)
    if (month > OVERNUMMERSERIE_60_OFFSET && month <= OVERNUMMERSERIE_60_OFFSET + MAX_MONTH) {
        month -= OVERNUMMERSERIE_60_OFFSET;
    } else if (month > OVERNUMMERSERIE_40_OFFSET && month <= OVERNUMMERSERIE_40_OFFSET + MAX_MONTH) {
        month -= OVERNUMMERSERIE_40_OFFSET;
    } else if (month > OVERNUMMERSERIE_20_OFFSET && month <= OVERNUMMERSERIE_20_OFFSET + MAX_MONTH) {
        month -= OVERNUMMERSERIE_20_OFFSET;
    }

    if (month < MIN_MONTH || month > MAX_MONTH) return { valid: false, error: 'Ogiltig månad' };

    // Hantera Samordningsnummer
    if (day >= COORDINATION_NUMBER_DAY_OFFSET) {
        const adjustedDay = day - COORDINATION_NUMBER_DAY_OFFSET;
        if (adjustedDay < 0 || adjustedDay > MAX_DAY) {
            return { valid: false, error: 'Ogiltig dag för samordningsnummer' };
        }
    } else {
        if (day < MIN_DAY || day > MAX_DAY) return { valid: false, error: 'Ogiltig dag' };
    }

    return { valid: true };
}

export function validateOrgNumber(org: string): ValidationResult {
    const clean = org.replace(/\D/g, '');
    if (clean.length !== 10 && clean.length !== 12) return { valid: false, error: 'Felaktig längd' };
    const tenDigit = clean.length === 12 ? clean.slice(2) : clean;
    
    if (!mod10(tenDigit)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    
    const middlePair = parseInt(tenDigit.slice(2, 4), 10);
    if (middlePair < MIN_ORG_MIDDLE_PAIR) return { valid: false, error: `Ogiltigt organisationsnummer (mellanpar < ${MIN_ORG_MIDDLE_PAIR})` };
    
    return { valid: true };
}

export function validateVAT(vat: string): ValidationResult {
    const clean = vat.replace(/[^a-zA-Z0-9]/g, '');

    if (!clean.startsWith(SWEDISH_VAT_PREFIX) || !clean.endsWith(SWEDISH_VAT_SUFFIX)) {
        return { valid: false, error: `Måste börja med ${SWEDISH_VAT_PREFIX} och sluta med ${SWEDISH_VAT_SUFFIX}` };
    }
    if (clean.length !== VAT_LENGTH) return { valid: false, error: `Felaktig längd (förväntade ${VAT_LENGTH} tecken)` };
    
    const orgPart = clean.slice(2, 12);
    return validateOrgNumber(orgPart);
}

export function validateBankgiro(bg: string): ValidationResult {
    const clean = bg.replace(/\D/g, '');
    if (clean.length < MIN_BG_LEN || clean.length > MAX_BG_LEN) return { valid: false, error: 'Felaktig längd' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validatePlusgiro(pg: string): ValidationResult {
    const clean = pg.replace(/\D/g, '');
    if (clean.length < MIN_PG_LEN || clean.length > MAX_PG_LEN) return { valid: false, error: 'Felaktig längd' };
    return { valid: mod10(clean), error: mod10(clean) ? null : 'Felaktig kontrollsiffra' };
}

export function validateBankAccount(clearing: string, account: string): ValidationResult {
    if (!clearing || !account) return { valid: false, error: 'Saknar clearing eller kontonummer' };
    return validateSwedishBank(clearing, account);
}

export function validateOCR(ocr: string): ValidationResult {
    const clean = ocr.replace(/\D/g, '');
    if (clean.length < 2) return { valid: false, error: 'För kort' };
    if (!mod10(clean)) return { valid: false, error: 'Felaktig kontrollsiffra' };
    return { valid: true };
}
