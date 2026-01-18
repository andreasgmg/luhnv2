import { mod10, mod11 } from './bank-math';
import { ValidationResult } from './utils';

export enum AccountType {
  TYPE_1 = 'TYPE_1', // Mod11 on Account only (Standard)
  TYPE_2 = 'TYPE_2', // Mod11 on Clearing + Account (Handelsbanken)
  TYPE_3 = 'TYPE_3', // Mod10 on Clearing + Account (Nordea Personkonto)
  TYPE_4 = 'TYPE_4', // Swedbank (Complex: 5-digit clearing Mod10 + Account Mod10 OR 4-digit Mod10)
}

export interface BankConfig {
  name: string;
  min: number;
  max: number;
  type: AccountType;
}

export const BANK_DATA: BankConfig[] = [
  { name: 'Svea Bank', min: 9660, max: 9669, type: AccountType.TYPE_1 },
  { name: 'Svea Bank', min: 9670, max: 9679, type: AccountType.TYPE_1 },
  { name: 'Avanza Bank', min: 9550, max: 9569, type: AccountType.TYPE_1 },
  { name: 'BlueStep Finans', min: 9680, max: 9689, type: AccountType.TYPE_1 },
  { name: 'BNP Paribas', min: 9470, max: 9479, type: AccountType.TYPE_1 },
  { name: 'Citibank', min: 9040, max: 9049, type: AccountType.TYPE_1 },
  { name: 'Danske Bank', min: 1200, max: 1399, type: AccountType.TYPE_1 },
  { name: 'Danske Bank', min: 2400, max: 2499, type: AccountType.TYPE_1 },
  { name: 'DnB Bank', min: 9180, max: 9189, type: AccountType.TYPE_1 },
  { name: 'Ekobanken', min: 9700, max: 9709, type: AccountType.TYPE_1 },
  { name: 'Forex Bank', min: 9400, max: 9449, type: AccountType.TYPE_1 },
  { name: 'Handelsbanken', min: 6000, max: 6999, type: AccountType.TYPE_2 },
  { name: 'ICA Banken', min: 9270, max: 9279, type: AccountType.TYPE_1 },
  { name: 'IKANO Bank', min: 9170, max: 9179, type: AccountType.TYPE_1 },
  { name: 'Länsförsäkringar', min: 3400, max: 3409, type: AccountType.TYPE_1 },
  { name: 'Länsförsäkringar', min: 9020, max: 9029, type: AccountType.TYPE_1 },
  { name: 'Länsförsäkringar', min: 9060, max: 9069, type: AccountType.TYPE_1 },
  { name: 'Marginalen', min: 9230, max: 9239, type: AccountType.TYPE_1 },
  { name: 'Nordax Bank', min: 9640, max: 9649, type: AccountType.TYPE_1 },
  { name: 'Nordea', min: 1100, max: 1199, type: AccountType.TYPE_1 },
  { name: 'Nordea', min: 1400, max: 2099, type: AccountType.TYPE_1 },
  { name: 'Nordea', min: 3000, max: 3299, type: AccountType.TYPE_1 },
  { name: 'Nordea', min: 3301, max: 3399, type: AccountType.TYPE_3 },
  { name: 'Nordea', min: 3410, max: 3781, type: AccountType.TYPE_1 },
  { name: 'Nordea', min: 3783, max: 3999, type: AccountType.TYPE_1 },
  { name: 'Nordea', min: 4000, max: 4999, type: AccountType.TYPE_3 },
  { name: 'Nordnet Bank', min: 9100, max: 9109, type: AccountType.TYPE_1 },
  { name: 'Resurs Bank', min: 9280, max: 9289, type: AccountType.TYPE_1 },
  { name: 'Riksgälden', min: 9880, max: 9889, type: AccountType.TYPE_1 },
  { name: 'Santander', min: 9460, max: 9469, type: AccountType.TYPE_1 },
  { name: 'SBAB', min: 9250, max: 9259, type: AccountType.TYPE_1 },
  { name: 'SEB', min: 5000, max: 5999, type: AccountType.TYPE_1 },
  { name: 'SEB', min: 9120, max: 9124, type: AccountType.TYPE_1 },
  { name: 'SEB', min: 9130, max: 9149, type: AccountType.TYPE_1 },
  { name: 'Skandiabanken', min: 9150, max: 9169, type: AccountType.TYPE_1 },
  { name: 'Sparbanken Syd', min: 9570, max: 9579, type: AccountType.TYPE_4 },
  { name: 'Swedbank', min: 7000, max: 7999, type: AccountType.TYPE_4 },
  { name: 'Swedbank', min: 8000, max: 8999, type: AccountType.TYPE_4 },
  { name: 'Swedbank', min: 9300, max: 9329, type: AccountType.TYPE_4 },
  { name: 'Swedbank', min: 9330, max: 9349, type: AccountType.TYPE_4 },
  { name: 'Ålandsbanken', min: 2300, max: 2399, type: AccountType.TYPE_1 },
];

export function validateSwedishBank(clearing: string, account: string): ValidationResult {
  const cl = clearing.replace(/\D/g, '');
  const ac = account.replace(/\D/g, '');
  const clNum = parseInt(cl.substring(0, 4), 10);

  const bank = BANK_DATA.find(b => clNum >= b.min && clNum <= b.max);
  if (!bank) {
    return { valid: false, error: 'Okänt clearingnummer (finns ej i registret)', bankName: 'Okänd' };
  }

  let isValid = false;
  let method = '';
  let errorMsg: string | null = null;

  switch (bank.type) {
    case AccountType.TYPE_1:
      method = 'Modulo 11 (på kontonummer)';
      isValid = mod11(ac); 
      break;

    case AccountType.TYPE_2:
      method = 'Modulo 11 (Clearing + Konto)';
      isValid = mod11(cl + ac);
      break;

    case AccountType.TYPE_3:
      method = 'Modulo 10 (Clearing + Konto)';
      isValid = mod10(cl + ac);
      break;

    case AccountType.TYPE_4:
      if (cl.startsWith('8')) {
          method = 'Swedbank 8-serie (Clearing Mod10 + Konto Mod10)';
          let validClearing = true;
          if (cl.length === 5) {
              validClearing = mod10(cl);
              if (!validClearing) {
                  errorMsg = 'Felaktig kontrollsiffra i clearingnumret (5:e siffran)';
              }
          }
          const validAccount = mod10(ac);
          if (!validAccount && !errorMsg) {
              errorMsg = 'Felaktig kontrollsiffra i kontonumret (Mod10)';
          }
          isValid = validClearing && validAccount;
      } else {
          method = 'Modulo 10 (på kontonummer)';
          isValid = mod10(ac);
      }
      break;
  }

  return {
    valid: isValid,
    bankName: bank.name,
    error: isValid ? null : (errorMsg || `Fel kontrollsiffra (${method})`)
  };
}