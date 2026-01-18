import { mod10, mod11 } from './bank-math';

const ACCOUNT_TYPES = {
  TYPE_1: 'TYPE_1', // Mod11 on Account only (Standard)
  TYPE_2: 'TYPE_2', // Mod11 on Clearing + Account (Handelsbanken)
  TYPE_3: 'TYPE_3', // Mod10 on Clearing + Account (Nordea Personkonto)
  TYPE_4: 'TYPE_4', // Swedbank (Complex: 5-digit clearing Mod10 + Account Mod10 OR 4-digit Mod10)
};

const BANK_DATA = [
  { name: 'Svea Bank', min: 9660, max: 9669, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Svea Bank', min: 9670, max: 9679, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Avanza Bank', min: 9550, max: 9569, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'BlueStep Finans', min: 9680, max: 9689, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'BNP Paribas', min: 9470, max: 9479, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Citibank', min: 9040, max: 9049, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Danske Bank', min: 1200, max: 1399, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Danske Bank', min: 2400, max: 2499, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'DnB Bank', min: 9180, max: 9189, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Ekobanken', min: 9700, max: 9709, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Forex Bank', min: 9400, max: 9449, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Handelsbanken', min: 6000, max: 6999, type: ACCOUNT_TYPES.TYPE_2 }, // Special case
  { name: 'ICA Banken', min: 9270, max: 9279, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'IKANO Bank', min: 9170, max: 9179, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Länsförsäkringar', min: 3400, max: 3409, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Länsförsäkringar', min: 9020, max: 9029, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Länsförsäkringar', min: 9060, max: 9069, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Marginalen', min: 9230, max: 9239, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordax Bank', min: 9640, max: 9649, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordea', min: 1100, max: 1199, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordea', min: 1400, max: 2099, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordea', min: 3000, max: 3299, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordea', min: 3301, max: 3399, type: ACCOUNT_TYPES.TYPE_3 }, // Personkonto Mod10
  { name: 'Nordea', min: 3410, max: 3781, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordea', min: 3783, max: 3999, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Nordea', min: 4000, max: 4999, type: ACCOUNT_TYPES.TYPE_3 }, // Personkonto Mod10
  { name: 'Nordnet Bank', min: 9100, max: 9109, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Resurs Bank', min: 9280, max: 9289, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Riksgälden', min: 9880, max: 9889, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Santander', min: 9460, max: 9469, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'SBAB', min: 9250, max: 9259, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'SEB', min: 5000, max: 5999, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'SEB', min: 9120, max: 9124, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'SEB', min: 9130, max: 9149, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Skandiabanken', min: 9150, max: 9169, type: ACCOUNT_TYPES.TYPE_1 },
  { name: 'Sparbanken Syd', min: 9570, max: 9579, type: ACCOUNT_TYPES.TYPE_4 }, // Mod10
  { name: 'Swedbank', min: 7000, max: 7999, type: ACCOUNT_TYPES.TYPE_4 }, // Mod10
  { name: 'Swedbank', min: 8000, max: 8999, type: ACCOUNT_TYPES.TYPE_4 }, // Mod10 (5 digit clearing)
  { name: 'Swedbank', min: 9300, max: 9329, type: ACCOUNT_TYPES.TYPE_4 }, // Mod10
  { name: 'Swedbank', min: 9330, max: 9349, type: ACCOUNT_TYPES.TYPE_4 }, // Mod10
  { name: 'Ålandsbanken', min: 2300, max: 2399, type: ACCOUNT_TYPES.TYPE_1 },
];

export { BANK_DATA };

export function validateSwedishBank(clearing, account) {
  // 1. Clean Inputs
  const cl = clearing.replace(/\D/g, '');
  const ac = account.replace(/\D/g, '');
  const clNum = parseInt(cl.substring(0, 4), 10); // First 4 digits for lookup

  // 2. Identify Bank
  const bank = BANK_DATA.find(b => clNum >= b.min && clNum <= b.max);
  if (!bank) {
    return { valid: false, error: 'Okänt clearingnummer (finns ej i registret)', bankName: 'Okänd' };
  }

  let isValid = false;
  let method = '';
  let errorMsg = null;

  switch (bank.type) {
    case ACCOUNT_TYPES.TYPE_1: // Mod11 on Account Only
      method = 'Modulo 11 (på kontonummer)';
      isValid = mod11(ac); 
      break;

    case ACCOUNT_TYPES.TYPE_2: // Handelsbanken: Mod11 on Clearing + Account
      method = 'Modulo 11 (Clearing + Konto)';
      isValid = mod11(cl + ac);
      break;

    case ACCOUNT_TYPES.TYPE_3: // Nordea Personkonto: Mod10 on Clearing + Account
      method = 'Modulo 10 (Clearing + Konto)';
      isValid = mod10(cl + ac);
      break;

    case ACCOUNT_TYPES.TYPE_4: // Swedbank (Complex)
      if (cl.startsWith('8')) {
          // Swedbank 8xxx-x (5 digits)
          method = 'Swedbank 8-serie (Clearing Mod10 + Konto Mod10)';
          
          let validClearing = true;
          // If the user entered 5 digits, check the 5th digit (checksum)
          if (cl.length === 5) {
              validClearing = mod10(cl);
              if (!validClearing) {
                  errorMsg = 'Felaktig kontrollsiffra i clearingnumret (5:e siffran)';
              }
          }
          
          // Account check: Mod10 on account part
          const validAccount = mod10(ac);
          if (!validAccount && !errorMsg) {
              errorMsg = 'Felaktig kontrollsiffra i kontonumret (Mod10)';
          }

          isValid = validClearing && validAccount;

      } else {
          // Swedbank Standard (7xxx, 9xxx) -> Mod10 on Account only
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