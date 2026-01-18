import { describe, it, expect } from 'vitest';
import { mod10, mod11 } from '../bank-math';

describe('bank-math', () => {
    describe('mod10 (Luhn)', () => {
        it('skall validera korrekta strängar', () => {
            expect(mod10('5560004615')).toBe(true);
        });
    });

    describe('mod11', () => {
        it('skall validera giltiga tal enligt vikterna 1,2,3...', () => {
            // Test: "15" -> 5*1 + 1*2 = 7 (Falskt)
            // Test: "91" -> 1*1 + 9*2 = 19 (Falskt)
            // Test: "34" -> 4*1 + 3*2 = 10 (Falskt)
            // Test: "44" -> 4*1 + 4*2 = 12 (Falskt)
            
            // Låt oss hitta ett giltigt:
            // "31" -> 1*1 + 3*2 = 7
            // "41" -> 1*1 + 4*2 = 9
            // "51" -> 1*1 + 5*2 = 11 (SANT!)
            expect(mod11('51')).toBe(true);
            
            // "121" -> 1*1 + 2*2 + 1*3 = 8
            // "221" -> 1*1 + 2*2 + 2*3 = 11 (SANT!)
            expect(mod11('221')).toBe(true);
        });

        it('skall neka ogiltiga tal', () => {
            expect(mod11('52')).toBe(false);
        });
    });
});