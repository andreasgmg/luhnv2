import fs from 'fs/promises';
import path from 'path';
import { luhnCheck, BANK_RANGES, generateOCR, getRandomElement, ValidationResult } from './utils';

// --- Interfaces ---

export interface Address {
  street: string;
  zip: string;
  city: string;
}

export interface Person {
  ssn: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'unknown';
  type: 'person';
  address: Address;
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

export interface NamesData {
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

export interface LocationEntry {
  street: string;
  zip: string;
  city: string;
}

// --- Type Guards ---

function isNamesData(data: unknown): data is NamesData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as any;
  return (
    typeof d.firstNames === 'object' &&
    Array.isArray(d.firstNames.male) &&
    Array.isArray(d.lastNames) &&
    typeof d.company === 'object'
  );
}

function isLocationArray(data: unknown): data is LocationEntry[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && item !== null && 'street' in item && 'zip' in item
  );
}

// --- Cache ---

interface Cache {
  personnummer: string[] | null;
  samordningsnummer: string[] | null;
  locations: LocationEntry[] | null;
  names: NamesData | null;
}

const cachedData: Cache = {
  personnummer: null,
  samordningsnummer: null,
  locations: null,
  names: null
};

/**
 * Generic JSON loader with runtime validation
 */
async function loadData<T>(type: keyof Cache, validator: (data: unknown) => data is T): Promise<T> {
  const cached = cachedData[type];
  if (cached) return cached as unknown as T;

  try {
    const fileName = `${type}.json`;
    const filePath = path.join(process.cwd(), 'data', fileName);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const json: unknown = JSON.parse(fileContent);

    let processed: unknown = json;

    // Special logic for SSN lists which are nested by year in the raw JSON
    if (type === 'personnummer' || type === 'samordningsnummer') {
      if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
        processed = Object.values(json).reduce<string[]>((acc, val) => {
          if (Array.isArray(val)) {
            return acc.concat(val.map(item => String(Object.values(item)[0])));
          }
          return acc;
        }, []);
      }
    }

    if (!validator(processed)) {
      throw new Error(`Data validation failed for type: ${type}`);
    }

    (cachedData as any)[type] = processed;
    return processed as T;
  } catch (error) {
    console.error(`❌ Failed to load ${type}:`, (error as Error).message);
    // Return empty state matching the expected type to avoid crashing
    if (type === 'names') throw error; // Critical failure
    return [] as unknown as T;
  }
}

// --- Helpers ---

function getLuhnDigit(payload: string): string {
    for (let i = 0; i <= 9; i++) {
        if (luhnCheck(payload + i)) {
            return i.toString();
        }
    }
    return '0';
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

    if (monthPart > 60) monthPart -= 60;
    else if (monthPart > 40) monthPart -= 40;
    else if (monthPart > 20) monthPart -= 20;

    return yearPart;
}

// --- Exported Functions ---

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

export async function generateBankAccount(): Promise<Omit<BankAccount, 'type'>> {
    const bankConfig = getRandomElement(BANK_RANGES);
    if (!bankConfig) throw new Error('Bank config missing');
    
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

export async function validateAddress(zip: string, city: string | null = null): Promise<ValidationResult> {
    const locations = await loadData<LocationEntry[]>('locations', isLocationArray);
    const cleanZip = zip.replace(/\s/g, ''); 
    const matches = locations.filter(loc => loc.zip.replace(/\s/g, '') === cleanZip);
    
    if (matches.length === 0) return { valid: false, error: 'Postnumret hittades inte' };
    
    if (city) {
        const cityMatch = matches.some(loc => loc.city.toLowerCase() === city.toLowerCase());
        if (!cityMatch) return { valid: false, error: `Postnumret ${zip} tillhör inte ${city}`, suggestedCity: matches[0].city };
    }
    
    return { valid: true, city: matches[0].city, zip: matches[0].zip };
}

export async function getOfficialIdentity(
  type: string = 'personnummer', 
  options: { gender?: string, minYear?: string, maxYear?: string, length?: number, lengthCheck?: boolean } = {}
): Promise<Identity | null> {
  
  const namesData = await loadData<NamesData>('names', isNamesData);

  if (type === 'company') {
      const orgNumber = generateOrgNumber();
      const template = Math.floor(Math.random() * 3);
      let name = '';
      if (template === 0) {
          name = `${getRandomElement(namesData.lastNames)}s ${getRandomElement(namesData.company.sectors)} ${getRandomElement(namesData.company.suffixes)}`;
      } else if (template === 1) {
          name = `${getRandomElement(namesData.company.locations)} ${getRandomElement(namesData.company.sectors)} ${getRandomElement(namesData.company.suffixes)}`;
      } else {
          name = `${getRandomElement(namesData.company.sectors)} & ${getRandomElement(namesData.company.sectors)} i ${getRandomElement(namesData.company.locations)?.replace(/s$/, '')} AB`;
      }
      return { orgNumber, name, vatNumber: `SE${orgNumber.replace('-', '')}01`, type: 'company' };
  }

  if (type === 'bankgiro') {
      const bg = '998' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const full = bg + getLuhnDigit(bg);
      return { bankgiro: `${full.slice(0, 3)}-${full.slice(3)}`, bank: 'Bankgirot', type: 'bankgiro' };
  }

  if (type === 'plusgiro') {
      const pg = Math.floor(Math.random() * 1000000).toString();
      const full = pg + getLuhnDigit(pg);
      return { plusgiro: `${full.slice(0, -1)}-${full.slice(-1)}` as any, bank: 'Plusgirot', type: 'plusgiro' as any };
  }

  if (type === 'bank_account') return { ...(await generateBankAccount()), type: 'bank_account' };
  
  if (type === 'ocr') {
      const ocr = generateOCR(options.length || 10, options.lengthCheck || false);
      return { ocr, length: options.length || 10, type: 'ocr' };
  }

  // Identity logic
  const isStringArray = (d: unknown): d is string[] => Array.isArray(d) && d.every(i => typeof i === 'string');
  const ssnType = type === 'samordningsnummer' ? 'samordningsnummer' : 'personnummer';
  const list = await loadData<string[]>(ssnType, isStringArray);
  const locations = await loadData<LocationEntry[]>('locations', isLocationArray);
  
  let candidates = list;
  if (options.gender) candidates = candidates.filter(ssn => getGender(ssn) === options.gender);
  if (options.minYear || options.maxYear) {
      candidates = candidates.filter(ssn => {
          const y = getYearFromSSN(ssn);
          if (options.minYear && y < parseInt(options.minYear)) return false;
          if (options.maxYear && y > parseInt(options.maxYear)) return false;
          return true;
      });
  }

  if (!candidates.length) return null;

  const ssn = getRandomElement(candidates)!;
  const actualGender = getGender(ssn);
  const firstNameList = actualGender === 'female' ? namesData.firstNames.female : namesData.firstNames.male;
  
  const firstName = getRandomElement(firstNameList)!;
  const lastName = getRandomElement(namesData.lastNames)!;
  const location = getRandomElement(locations) || { street: 'Storgatan', zip: '111 22', city: 'Stockholm' };

  let displaySsn = ssn;
  if (displaySsn.length === 12) displaySsn = displaySsn.slice(2);

  return {
    ssn: displaySsn, 
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
