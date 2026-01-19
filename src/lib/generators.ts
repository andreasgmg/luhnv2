import { mod10 } from './bank-math';

/**
 * Genererar ett giltigt OCR-nummer med Luhn-kontroll.
 */
export function generateOCR(length = 10, lengthCheck = false): string {
    const payloadLen = length - 1 - (lengthCheck ? 1 : 0);
    let payload = '';
    for (let i = 0; i < payloadLen; i++) payload += Math.floor(Math.random() * 10);
    if (lengthCheck) payload += (length % 10).toString();
    
    // Hitta rätt kontrollsiffra
    const getDigit = (p: string) => {
        for (let i = 0; i <= 9; i++) if (mod10(p + i)) return i.toString();
        return '0';
    };
    return payload + getDigit(payload);
}
