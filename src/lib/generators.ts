import { mod10 } from './bank-math';
import { ALLOWED_CAR_LETTERS } from './car-data';
import { secureRandom } from './helpers';

/**
 * Genererar ett giltigt OCR-nummer med Luhn-kontroll.
 */
export function generateOCR(length = 10, lengthCheck = false): string {
    const payloadLen = length - 1 - (lengthCheck ? 1 : 0);
    let payload = '';
    for (let i = 0; i < payloadLen; i++) payload += secureRandom(0, 9);
    if (lengthCheck) payload += (length % 10).toString();
    const getDigit = (p: string) => {
        for (let i = 0; i <= 9; i++) if (mod10(p + i)) return i.toString();
        return '0';
    };
    return payload + getDigit(payload);
}

/**
 * Genererar ett giltigt registreringsnummer.
 * Vi använder uteslutande 'MLB' serien för att tydligt markera det som testdata.
 */
export function generateCarPlate(type: 'old' | 'new' | 'any' = 'any'): string {
    const prefix = 'MLB';
    const digits = secureRandom(0, 99).toString().padStart(2, '0');
    
    let lastChar = '';
    const useNewFormat = type === 'new' || (type === 'any' && secureRandom(0, 1) === 1);

    if (useNewFormat) {
        // Nytt format: Sista är en bokstav (ej O)
        const allowedLast = ALLOWED_CAR_LETTERS.replace('O', '');
        lastChar = allowedLast.charAt(secureRandom(0, allowedLast.length - 1));
    } else {
        // Gammalt format: Sista är en siffra
        lastChar = secureRandom(0, 9).toString();
    }

    return `${prefix} ${digits}${lastChar}`;
}

export function generateSwish(): string {
    let suffix = '';
    for (let i = 0; i < 7; i++) {
        suffix += secureRandom(0, 9).toString();
    }
    const full = '123' + suffix;
    return `${full.slice(0, 3)} ${full.slice(3, 7)} ${full.slice(7)}`;
}

export function generateMobileNumber(): string {
    const min = 5;
    const max = 99;
    const suffix = secureRandom(min, max);
    return `070-174 06 ${suffix.toString().padStart(2, '0')}`;
}

const SAFE_PLUSGIRO_NUMBERS = [
    "286543-4", "43210-0", "12345-6", "54321-0", "987654-3",
    "111111-1", "222222-2", "333333-3", "444444-4", "555555-5",
    "12-3", "45-6", "78-9", "90-1", "100-2"
];

export function generatePlusgiro(): string {
    return SAFE_PLUSGIRO_NUMBERS[secureRandom(0, SAFE_PLUSGIRO_NUMBERS.length - 1)];
}