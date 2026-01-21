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
 * Genererar ett giltigt registreringsnummer.
 * Vi använder uteslutande 'MLB' serien för att tydligt markera det som testdata.
 */
export function generateCarPlate(type: 'old' | 'new' | 'any' = 'any'): string {
    const prefix = 'MLB';
    const digits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    let lastChar = '';
    const useNewFormat = type === 'new' || (type === 'any' && Math.random() > 0.5);

    if (useNewFormat) {
        // Nytt format: Sista är en bokstav (ej O)
        const allowedLast = ALLOWED_CAR_LETTERS.replace('O', '');
        lastChar = allowedLast.charAt(Math.floor(Math.random() * allowedLast.length));
    } else {
        // Gammalt format: Sista är en siffra
        lastChar = Math.floor(Math.random() * 10).toString();
    }

    return `${prefix} ${digits}${lastChar}`;
}

export function generateSwish(): string {
    let suffix = '';
    for (let i = 0; i < 7; i++) {
        suffix += Math.floor(Math.random() * 10).toString();
    }
    const full = '123' + suffix;
    return `${full.slice(0, 3)} ${full.slice(3, 7)} ${full.slice(7)}`;
}

export function generateMobileNumber(): string {
    const min = 5;
    const max = 99;
    const suffix = Math.floor(Math.random() * (max - min + 1)) + min;
    return `070-174 06 ${suffix.toString().padStart(2, '0')}`;
}
