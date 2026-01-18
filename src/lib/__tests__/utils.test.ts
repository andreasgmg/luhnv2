import { describe, it, expect } from 'vitest';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateBankgiro, 
    validatePlusgiro 
} from '../utils';
import { mod10 } from '../bank-math';

describe('mod10', () => {
    it('skall godkänna giltiga nummer (Verifierat personnummer)', () => {
        // 670919-9530 är ett bekräftat giltigt nummer
        expect(mod10('6709199530')).toBe(true);
        expect(mod10('5560004615')).toBe(true); // Org.nr
    });

    it('skall neka ogiltiga nummer', () => {
        expect(mod10('6709199531')).toBe(false);
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
            expect(validatePersonnummer('6709799537').valid).toBe(true);
        });

        it('skall godkänna "okänt födelsedatum" (dag 60)', () => {
            expect(validatePersonnummer('6709609538').valid).toBe(true);
        });

        it('skall godkänna övernummerserier (+20 på månad)', () => {
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