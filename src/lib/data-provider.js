import fs from 'fs';
import path from 'path';
import { 
  FIRST_NAMES, 
  LAST_NAMES, 
  COMPANY_PREFIXES, 
  COMPANY_SUFFIXES, 
  getRandomElement 
} from './names.js';
import { luhnCheck, BANK_RANGES } from './utils.js';

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

export function generateBankAccount() {
    const bank = getRandomElement(BANK_RANGES);
    const clearing = Math.floor(Math.random() * (bank.max - bank.min + 1)) + bank.min;
    
    // Generate random account number (usually 7-10 digits)
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

export function getOfficialIdentity(type = 'personnummer', genderFilter = null) {
  
  if (type === 'company') {
      const orgNumber = generateOrgNumber();
      const prefix = getRandomElement(COMPANY_PREFIXES);
      const suffix = getRandomElement(COMPANY_SUFFIXES);
      
      return {
          orgNumber,
          name: `${prefix} ${suffix} AB`,
          vatNumber: `SE${orgNumber.replace('-', '')}01`,
          type: 'company'
      };
  }

  if (type === 'bankgiro') {
      const bankgiro = generateBankgiro();
      return {
          bankgiro,
          bank: 'Bankgirot',
          type: 'bankgiro'
      };
  }

  if (type === 'bank_account') {
      const account = generateBankAccount();
      return {
          ...account,
          type: 'bank_account'
      };
  }

  const list = loadData(type);
  const locations = loadData('locations');
  
  if (!list.length) return null;

  let candidates = list;
  if (genderFilter) {
    candidates = list.filter(ssn => getGender(ssn) === genderFilter);
  }

  if (!candidates.length) return null;

  let ssn = getRandomElement(candidates);
  const actualGender = getGender(ssn);
  
  const firstName = getRandomElement(FIRST_NAMES[actualGender]);
  const lastName = getRandomElement(LAST_NAMES);
  
  // Get random real location
  const location = locations.length > 0 
    ? getRandomElement(locations) 
    : { street: 'Storgatan', zip: '111 22', city: 'Stockholm' }; // Fallback

  // Normalize to 10 digits
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
