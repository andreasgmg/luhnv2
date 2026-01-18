import fs from 'fs';
import path from 'path';
import { 
  FIRST_NAMES, 
  LAST_NAMES, 
  COMPANY_LOCATIONS, 
  COMPANY_SECTORS, 
  COMPANY_SUFFIXES, 
  getRandomElement 
} from './names.js';
import { luhnCheck, BANK_RANGES, generateOCR } from './utils.js';

// Cache the data in memory
let cachedData = {
  personnummer: null,
  samordningsnummer: null,
  locations: null
};

/**
 * Loads and parses JSON data.
 */
function loadData(type) {
  if (cachedData[type]) return cachedData[type];

  try {
    const fileName = type + '.json';
    const filePath = path.join(process.cwd(), 'data', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(fileContent);

    if (type === 'locations') {
        cachedData[type] = json; // Locations are already a clean array
        return cachedData[type];
    }

    let rawList;
    if (Array.isArray(json)) {
      rawList = json;
    } else {
      // Aggregate ALL arrays found in the object
      rawList = Object.values(json).reduce((acc, val) => {
        if (Array.isArray(val)) {
          return acc.concat(val);
        }
        return acc;
      }, []);
    }

    cachedData[type] = rawList.map(item => Object.values(item)[0]);
    return cachedData[type];
  } catch (error) {
    console.error(`❌ Failed to load ${type}:`, error.message);
    return [];
  }
}

// ... (Luhn Check functions remain the same) ...

function getLuhnDigit(payload) {
    for (let i = 0; i <= 9; i++) {
        if (luhnCheck(payload + i)) {
            return i.toString();
        }
    }
    return '0';
}

export function generateOrgNumber() {
    const firstPair = Math.floor(Math.random() * 90) + 10;
    const middlePair = Math.floor(Math.random() * 80) + 20;
    const thirdPair = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const prefix = `${firstPair}${middlePair}${thirdPair}`;
    const suffixStart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const payload = prefix + suffixStart;
    const checkDigit = getLuhnDigit(payload);
    
    return `${prefix}-${suffixStart}${checkDigit}`;
}

export function generateBankgiro() {
    // 998-xxxx (Test Series)
    let payload = '998';
    for(let i=0; i<3; i++) {
        payload += Math.floor(Math.random() * 10);
    }
    const checkDigit = getLuhnDigit(payload);
    const full = payload + checkDigit;
    return `${full.slice(0, 3)}-${full.slice(3)}`;
}

export function generatePlusgiro() {
    const len = Math.floor(Math.random() * 7) + 1; 
    let payload = '';
    payload += Math.floor(Math.random() * 9) + 1;
    for(let i=1; i<len; i++) payload += Math.floor(Math.random() * 10);
    const checkDigit = getLuhnDigit(payload);
    const full = payload + checkDigit;
    return `${full.slice(0, -1)}-${full.slice(-1)}`;
}

export function generateBankAccount() {
    const bank = getRandomElement(BANK_RANGES);
    const clearing = Math.floor(Math.random() * (bank.max - bank.min + 1)) + bank.min;
    const accLen = Math.floor(Math.random() * 4) + 7; 
    let account = '';
    for(let i=0; i<accLen; i++) account += Math.floor(Math.random() * 10);

    return {
        bank: bank.name,
        clearing: clearing.toString(),
        account: account
    };
}

function getGender(ssn) {
  const clean = ssn.replace(/[^0-9]/g, '').slice(-4); 
  if (clean.length < 3) return 'unknown'; 
  const genderDigit = parseInt(clean[2]); 
  return genderDigit % 2 === 0 ? 'female' : 'male';
}

function getYearFromSSN(ssn) {
    const clean = ssn.replace(/[^0-9]/g, '');
    if (clean.length === 12) return parseInt(clean.substring(0, 4));
    if (clean.length === 10) {
        // Assume 19xx or 20xx based on current year or context.
        // For simplicity in this dataset (which contains 1936-2026), we can infer.
        // Actually, the dataset often has 12 digits in the key.
        // If 10, let's assume 1900 + year unless year < 26.
        const yearPart = parseInt(clean.substring(0, 2));
        const currentYear = new Date().getFullYear() % 100;
        return yearPart > currentYear ? 1900 + yearPart : 2000 + yearPart;
    }
    return 0;
}

export function getOfficialIdentity(type = 'personnummer', options = {}) {
  const { gender, minYear, maxYear } = options;

  if (type === 'company') {
      const orgNumber = generateOrgNumber();
      const template = Math.floor(Math.random() * 3);
      let name = '';
      if (template === 0) {
          const lastName = getRandomElement(LAST_NAMES);
          const sector = getRandomElement(COMPANY_SECTORS);
          const suffix = getRandomElement(COMPANY_SUFFIXES);
          name = `${lastName}s ${sector} ${suffix}`;
      } else if (template === 1) {
          const loc = getRandomElement(COMPANY_LOCATIONS);
          const sector = getRandomElement(COMPANY_SECTORS);
          const suffix = getRandomElement(COMPANY_SUFFIXES);
          name = `${loc} ${sector} ${suffix}`;
      } else {
          const sec1 = getRandomElement(COMPANY_SECTORS);
          const sec2 = getRandomElement(COMPANY_SECTORS);
          const loc = getRandomElement(COMPANY_LOCATIONS).replace(/s$/, ''); 
          name = `${sec1} & ${sec2} i ${loc} AB`;
      }
      return { orgNumber, name, vatNumber: `SE${orgNumber.replace('-', '')}01`, type: 'company' };
  }

  if (type === 'bankgiro') return { bankgiro: generateBankgiro(), bank: 'Bankgirot', type: 'bankgiro' };
  if (type === 'plusgiro') return { plusgiro: generatePlusgiro(), bank: 'Plusgirot', type: 'plusgiro' };
  if (type === 'bank_account') return { ...generateBankAccount(), type: 'bank_account' };
  if (type === 'ocr') {
      const length = Math.floor(Math.random() * 20) + 6; 
      const useLengthCheck = Math.random() > 0.5;
      const ocr = generateOCR(length, useLengthCheck);
      return { ocr, length, lengthCheck: useLengthCheck, type: 'ocr' };
  }

  const list = loadData(type);
  const locations = loadData('locations');
  
  if (!list.length) return null;

  let candidates = list;
  
  // Filter by Gender
  if (gender) {
    candidates = candidates.filter(ssn => getGender(ssn) === gender);
  }

  // Filter by Year
  if (minYear || maxYear) {
      candidates = candidates.filter(ssn => {
          const y = getYearFromSSN(ssn);
          if (minYear && y < parseInt(minYear)) return false;
          if (maxYear && y > parseInt(maxYear)) return false;
          return true;
      });
  }

  if (!candidates.length) return null;

  let ssn = getRandomElement(candidates);
  const actualGender = getGender(ssn);
  const firstName = getRandomElement(FIRST_NAMES[actualGender]);
  const lastName = getRandomElement(LAST_NAMES);
  const location = locations.length > 0 ? getRandomElement(locations) : { street: 'Storgatan', zip: '111 22', city: 'Stockholm' };

  if (ssn.length === 12) {
    ssn = ssn.slice(2);
  }

  return {
    ssn,
    firstName,
    lastName,
    gender: actualGender,
    type: 'person',
    address: {
      street: `${location.street} ${Math.floor(Math.random() * 100) + 1}`,
      zip: location.zip,
      city: location.city
    }
  };
}
