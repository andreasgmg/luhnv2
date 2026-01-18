import fs from 'fs/promises';
import path from 'path';
import { luhnCheck, BANK_RANGES, generateOCR, getRandomElement, ValidationResult } from './utils';

export interface Person {
  ssn: string;
  firstName: string;
  lastName: string;
  gender: string;
  type: 'person';
  address: {
    street: string;
    zip: string;
    city: string;
  };
}

export interface Company {
  orgNumber: string;
  name: string;
  vatNumber: string;
  type: 'company';
}

export interface BankAccount {
  bank: string;
  clearing: string;
  account: string;
  type: 'bank_account';
}

export interface Bankgiro {
  bankgiro: string;
  bank: string;
  type: 'bankgiro';
}

export interface OCR {
  ocr: string;
  length: number;
  type: 'ocr';
}

export type Identity = Person | Company | BankAccount | Bankgiro | OCR;

interface NamesData {
  firstNames: {
    male: string[];
    female: string[];
  };
  lastNames: string[];
  company: {
    locations: string[];
    sectors: string[];
    suffixes: string[];
  };
  banks: string[];
}

interface Location {
  street: string;
  zip: string;
  city: string;
}

// Cache the data in memory
let cachedData: {
  personnummer: string[] | null;
  samordningsnummer: string[] | null;
  locations: Location[] | null;
  names: NamesData | null;
} = {
  personnummer: null,
  samordningsnummer: null,
  locations: null,
  names: null
};

/**
 * Loads and parses JSON data from the local file system asynchronously.
 */
async function loadData(type: string): Promise<any> {
  if (cachedData[type]) return cachedData[type];

  try {
    const fileName = type + '.json';
    const filePath = path.join(process.cwd(), 'data', fileName);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(fileContent);

    if (type === 'locations' || type === 'names') {
        cachedData[type] = json; 
        return cachedData[type];
    }

    let rawList: any[];
    if (Array.isArray(json)) {
      rawList = json;
    } else {
      rawList = Object.values(json).reduce((acc: any[], val: any) => {
        if (Array.isArray(val)) {
          return acc.concat(val);
        }
        return acc;
      }, []);
    }

    cachedData[type] = rawList.map(item => Object.values(item)[0] as string);
    return cachedData[type];
  } catch (error) {
    console.error(`❌ Failed to load ${type}:`, error.message);
    return [];
  }
}

function getLuhnDigit(payload: string): string {
    for (let i = 0; i <= 9; i++) {
        if (luhnCheck(payload + i)) {
            return i.toString();
        }
    }
    return '0';
}

export function generateOrgNumber(): string {
    const firstPair = Math.floor(Math.random() * 90) + 10;
    const middlePair = Math.floor(Math.random() * 80) + 20;
    const thirdPair = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const prefix = `${firstPair}${middlePair}${thirdPair}`;
    const suffixStart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const payload = prefix + suffixStart;
    const checkDigit = getLuhnDigit(payload);
    return `${prefix}-${suffixStart}${checkDigit}`;
}

export function generateBankgiro(): string {
    let payload = '998';
    for(let i=0; i<3; i++) {
        payload += Math.floor(Math.random() * 10);
    }
    const checkDigit = getLuhnDigit(payload);
    const full = payload + checkDigit;
    return `${full.slice(0, 3)}-${full.slice(3)}`;
}

export function generatePlusgiro(): string {
    const len = Math.floor(Math.random() * 7) + 1; 
    let payload = '';
    payload += Math.floor(Math.random() * 9) + 1;
    for(let i=1; i<len; i++) payload += Math.floor(Math.random() * 10);
    const checkDigit = getLuhnDigit(payload);
    const full = payload + checkDigit;
    return `${full.slice(0, -1)}-${full.slice(-1)}`;
}

export async function generateBankAccount(): Promise<Omit<BankAccount, 'type'>> {
    const namesData = (await loadData('names')) as NamesData;
    const bankConfig = getRandomElement(BANK_RANGES);
    const clearing = Math.floor(Math.random() * (bankConfig.max - bankConfig.min + 1)) + bankConfig.min;
    const accLen = Math.floor(Math.random() * 4) + 7; 
    let account = '';
    for(let i=0; i<accLen; i++) account += Math.floor(Math.random() * 10);

    return {
        bank: bankConfig.name,
        clearing: clearing.toString(),
        account: account
    };
}

function getGender(ssn: string): 'male' | 'female' | 'unknown' {
  const clean = ssn.replace(/[^0-9]/g, '').slice(-4); 
  if (clean.length < 3) return 'unknown'; 
  const genderDigit = parseInt(clean[2]); 
  return genderDigit % 2 === 0 ? 'female' : 'male';
}

function getYearFromSSN(ssn: string): number {
    const clean = ssn.replace(/[^0-9]/g, '');
    let yearPart = 0;
    let monthPart = 0;

    if (clean.length === 12) {
        yearPart = parseInt(clean.substring(0, 4));
        monthPart = parseInt(clean.substring(4, 6));
    } else if (clean.length === 10) {
        const yy = parseInt(clean.substring(0, 2));
        monthPart = parseInt(clean.substring(2, 4));
        const currentYear = new Date().getFullYear() % 100;
        yearPart = yy > currentYear ? 1900 + yy : 2000 + yy;
    }

    // Normalisera månad om det är en övernummerserie
    if (monthPart > 60) monthPart -= 60;
    else if (monthPart > 40) monthPart -= 40;
    else if (monthPart > 20) monthPart -= 20;

    return yearPart;
}

export async function validateAddress(zip: string, city: string | null = null): Promise<ValidationResult> {
    const locations = (await loadData('locations')) as Location[];
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

export async function getOfficialIdentity(type: string = 'personnummer', options: any = {}): Promise<Identity | null> {
  const { gender, minYear, maxYear } = options;
  const namesData = (await loadData('names')) as NamesData;

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

  const list = (await loadData(type)) as string[];
  const locations = (await loadData('locations')) as Location[];
  
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

  let ssn = getRandomElement(candidates) as string;
  const actualGender = getGender(ssn);
  const firstName = getRandomElement(namesData.firstNames[actualGender === 'unknown' ? 'male' : actualGender]) as string;
  const lastName = getRandomElement(namesData.lastNames) as string;
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