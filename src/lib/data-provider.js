import fs from 'fs/promises';
import path from 'path';
import { luhnCheck, BANK_RANGES, generateOCR, getRandomElement } from './utils.js';

// Cache the data in memory
let cachedData = {
  personnummer: null,
  samordningsnummer: null,
  locations: null,
  names: null
};

/**
 * Loads and parses JSON data from the local file system asynchronously.
 */
async function loadData(type) {
  if (cachedData[type]) return cachedData[type];

  try {
    const fileName = type + '.json';
    const filePath = path.join(process.cwd(), 'data', fileName);
    
    // Asynkron filinläsning för att inte blockera event-loopen
    const fileContent = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(fileContent);

    if (type === 'locations' || type === 'names') {
        cachedData[type] = json; 
        return cachedData[type];
    }

    let rawList;
    if (Array.isArray(json)) {
      rawList = json;
    } else {
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

export async function generateBankAccount() {
    const namesData = await loadData('names');
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
        const yearPart = parseInt(clean.substring(0, 2));
        const currentYear = new Date().getFullYear() % 100;
        return yearPart > currentYear ? 1900 + yearPart : 2000 + yearPart;
    }
    return 0;
}

export async function validateAddress(zip, city = null) {
    const locations = await loadData('locations');
    if (!locations.length) return { valid: false, error: 'Databasen är inte laddad' };
    const cleanZip = zip.replace(/\s/g, ''); 
    const matches = locations.filter(loc => loc.zip.replace(/\s/g, '') === cleanZip);
    if (matches.length === 0) return { valid: false, error: 'Postnumret hittades inte' };
    if (city) {
        const cityMatch = matches.some(loc => loc.city.toLowerCase() === city.toLowerCase());
        if (!cityMatch) return { valid: false, error: `Postnumret ${zip} tillhör inte ${city}`, suggestedCity: matches[0].city };
    }
    return { valid: true, city: matches[0].city, zip: matches[0].zip };
}

export async function getOfficialIdentity(type = 'personnummer', options = {}) {
  const { gender, minYear, maxYear } = options;
  const namesData = await loadData('names');

  if (type === 'company') {
      const orgNumber = generateOrgNumber();
      const template = Math.floor(Math.random() * 3);
      let name = '';
      if (template === 0) {
          name = `${getRandomElement(namesData.lastNames)}s ${getRandomElement(namesData.company.sectors)} ${getRandomElement(namesData.company.suffixes)}`;
      } else if (template === 1) {
          name = `${getRandomElement(namesData.company.locations)} ${getRandomElement(namesData.company.sectors)} ${getRandomElement(namesData.company.suffixes)}`;
      } else {
          name = `${getRandomElement(namesData.company.sectors)} & ${getRandomElement(namesData.company.sectors)} i ${getRandomElement(namesData.company.locations).replace(/s$/, '')} AB`;
      }
      return { orgNumber, name, vatNumber: `SE${orgNumber.replace('-', '')}01`, type: 'company' };
  }

  if (type === 'bankgiro') return { bankgiro: generateBankgiro(), bank: 'Bankgirot', type: 'bankgiro' };
  if (type === 'plusgiro') return { plusgiro: generatePlusgiro(), bank: 'Plusgirot', type: 'plusgiro' };
  if (type === 'bank_account') return { ...(await generateBankAccount()), type: 'bank_account' };
  if (type === 'ocr') {
      const ocr = generateOCR(options.length || 10, options.lengthCheck || false);
      return { ocr, length: options.length || 10, type: 'ocr' };
  }

  const list = await loadData(type);
  const locations = await loadData('locations');
  
  if (!list.length) return null;
  let candidates = list;
  if (gender) candidates = candidates.filter(ssn => getGender(ssn) === gender);
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
  const firstName = getRandomElement(namesData.firstNames[actualGender]);
  const lastName = getRandomElement(namesData.lastNames);
  const location = getRandomElement(locations) || { street: 'Storgatan', zip: '111 22', city: 'Stockholm' };

  if (ssn.length === 12) ssn = ssn.slice(2);

  return {
    ssn, firstName, lastName, gender: actualGender, type: 'person',
    address: {
      street: `${location.street} ${Math.floor(Math.random() * 100) + 1}`,
      zip: location.zip, city: location.city
    }
  };
}
