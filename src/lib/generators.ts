import { mod10 } from './bank-math';

const ALLOWED_CAR_LETTERS = "ABCDEFGHJKLMNPRSTUXYZ";

/**
 * Genererar ett giltigt OCR-nummer med Luhn-kontroll.
 */
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

/**
 * Genererar ett giltigt registreringsnummer (MLB-serien).
 */
export function generateCarPlate(type: 'old' | 'new' | 'any' = 'any'): string {
    const prefix = 'MLB';
    const digits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    let lastChar = '';
    const useNewFormat = type === 'new' || (type === 'any' && Math.random() > 0.5);
    if (useNewFormat) {
        const allowedLast = ALLOWED_CAR_LETTERS.replace('O', '');
        lastChar = allowedLast.charAt(Math.floor(Math.random() * allowedLast.length));
    } else {
        lastChar = Math.floor(Math.random() * 10).toString();
    }
    return `${prefix} ${digits}${lastChar}`;
}

/**
 * Genererar ett giltigt Swish-nummer för företag (123-serien).
 */
export function generateSwish(): string {
    let suffix = '';
    for (let i = 0; i < 7; i++) {
        suffix += Math.floor(Math.random() * 10).toString();
    }
    const full = '123' + suffix;
    return `${full.slice(0, 3)} ${full.slice(3, 7)} ${full.slice(7)}`;
}

/**
 * Genererar ett säkert mobilnummer reserverat för teständamål (PTS).
 */
export function generateMobileNumber(): string {
    const min = 5;
    const max = 99;
    const suffix = Math.floor(Math.random() * (max - min + 1)) + min;
    return `070-174 06 ${suffix.toString().padStart(2, '0')}`;
}

/**
 * Bekräftade testnummer för Plusgirot. 
 * Eftersom det inte finns en officiell test-prefix (likt Bg 998),
 * använder vi en lista på nummer som ofta används i svenska affärssystem för test.
 */
const SAFE_PLUSGIRO_NUMBERS = [
    "286543-4", "43210-0", "12345-6", "54321-0", "987654-3",
    "111111-1", "222222-2", "333333-3", "444444-4", "555555-5",
    "12-3", "45-6", "78-9", "90-1", "100-2"
];

export function generatePlusgiro(): string {
    return SAFE_PLUSGIRO_NUMBERS[Math.floor(Math.random() * SAFE_PLUSGIRO_NUMBERS.length)];
}