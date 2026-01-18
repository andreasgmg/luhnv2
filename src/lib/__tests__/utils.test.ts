import { describe, it, expect } from 'vitest';
import { 
    luhnCheck, 
    validatePersonnummer, 
    validateOrgNumber, 
    validateBankgiro, 
    validatePlusgiro 
} from '../utils';

describe('luhnCheck', () => {
    it('skall godkänna giltiga nummer (Verifierat personnummer)', () => {
        // 670919-9530 är ett bekräftat giltigt nummer
        expect(luhnCheck('6709199530')).toBe(true);
        expect(luhnCheck('5560004615')).toBe(true); // Org.nr
    });

    it('skall neka ogiltiga nummer', () => {
        expect(luhnCheck('6709199531')).toBe(false);
    });
});

describe('validatePersonnummer', () => {
    it('skall godkänna giltiga personnummer', () => {
        expect(validatePersonnummer('670919-9530').valid).toBe(true);
        expect(validatePersonnummer('196709199530').valid).toBe(true);
    });

    it('skall neka felaktig luhn', () => {
        const res = validatePersonnummer('6709199531');
        expect(res.valid).toBe(false);
        expect(res.error).toContain('Luhn');
    });

    describe('Samordningsnummer (SKV 704)', () => {
        it('skall godkänna vanliga samordningsnummer (dag 61-91)', () => {
            // Beräknat från 6709(19+60)9530 -> 670979953?
            // 6*2(3) + 7*1(7) + 0*2(0) + 9*1(9) + 7*2(5) + 9*1(9) + 9*2(9) + 5*1(5) + 3*2(6) = 53. X = 7 för 60.
            expect(validatePersonnummer('6709799537').valid).toBe(true);
        });

        it('skall godkänna "okänt födelsedatum" (dag 60)', () => {
            // 670960953?
            // 6*2(3) + 7*1(7) + 0*2(0) + 9*1(9) + 6*2(3) + 0*1(0) + 9*2(9) + 5*1(5) + 3*2(6) = 42. X = 8 för 50.
            expect(validatePersonnummer('6709609538').valid).toBe(true);
        });

        it('skall godkänna övernummerserier (+20 på månad)', () => {
            // 6729199536 -> Summa 60
            expect(validatePersonnummer('6729199536').valid).toBe(true);
        });
    });
});

describe('validateOrgNumber', () => {
    it('skall godkänna giltiga organisationsnummer', () => {
        expect(validateOrgNumber('556000-4615').valid).toBe(true);
    });

    it('skall neka om mellanparet är under 20', () => {
        expect(validateOrgNumber('5510004611').valid).toBe(false);
    });
});

describe('Bank & Plusgiro', () => {
    it('skall validera Bankgiro', () => {
        expect(validateBankgiro('5402-9681').valid).toBe(true);
    });

    it('skall validera Plusgiro', () => {
        expect(validatePlusgiro('286543-4').valid).toBe(true);
    });
});
