import { mod10, mod11 } from './bank-math';
import { BANK_DATA } from './bank-data';
import { ValidationResult } from './validators';

export function validateSwedishBank(clearing: string, account: string): ValidationResult {
    const clearingInt = parseInt(clearing.substring(0, 4));
    const bank = BANK_DATA.find(b => clearingInt >= b.min && clearingInt <= b.max);

    if (!bank) return { valid: false, error: 'Okänt clearingnummer' };

    const fullNumber = clearing + account.replace(/\D/g, '');

    // Typ 1: Valideras med Mod10 på hela numret (clearing + konto)
    if (bank.type === 1) {
        return { 
            valid: mod10(fullNumber), 
            bankName: bank.name, 
            error: mod10(fullNumber) ? null : 'Felaktig kontrollsiffra (Mod10)' 
        };
    }

    // Typ 2: Valideras med Mod11 på hela numret (clearing + konto)
    if (bank.type === 2) {
        return { 
            valid: mod11(fullNumber), 
            bankName: bank.name, 
            error: mod11(fullNumber) ? null : 'Felaktig kontrollsiffra (Mod11)' 
        };
    }

    return { valid: false, error: 'Okänd banktyp' };
}
