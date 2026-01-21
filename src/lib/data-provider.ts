import fs from 'fs/promises';
import path from 'path';
import { mod10 } from './bank-math';
import { BANK_DATA } from './bank-data';
import { getRandomElement } from './helpers';
import { generateOCR, generateCarPlate, generateSwish, generateMobileNumber, generatePlusgiro } from './generators';
import { ValidationResult } from './validators';

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

export interface Plusgiro {
  plusgiro: string;
  bank: string;
  type: 'plusgiro';
}

export interface OCR {
  ocr: string;
  length: number;
  type: 'ocr';
}

export interface LicensePlate {
  plate: string;
  type: 'license-plate';
}

export interface SwishNumber {
  swish: string;
  type: 'swish';
}

export interface MobileNumber {
  mobile: string;
  type: 'mobile';
}

export type Identity = Person | Company | BankAccount | Bankgiro | Plusgiro | OCR | LicensePlate | SwishNumber | MobileNumber;

export interface NamesData {
  firstNames: { male: string[]; female: string[]; };
  lastNames: string[];
  company: { locations: string[]; sectors: string[]; suffixes: string[]; };
  banks: string[];
}

export interface LocationEntry { street: string; zip: string; city: string; }

// --- Type Guards ---

function isNamesData(data: unknown): data is NamesData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as any;
  return typeof d.firstNames === 'object' && Array.isArray(d.firstNames.male);
}

function isLocationArray(data: unknown): data is LocationEntry[] {
  return Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null && 'street' in item);
}

// --- Cache ---

interface Cache {
  personnummer: string[] | null;
  samordningsnummer: string[] | null;
  locations: LocationEntry[] | null;
  names: NamesData | null;
}

const cachedData: Cache = { personnummer: null, samordningsnummer: null, locations: null, names: null };

async function loadData<T>(type: keyof Cache, validator: (data: unknown) => data is T): Promise<T> {
  const cached = cachedData[type];
  if (cached) return cached as unknown as T;
  try {
    const filePath = path.join(process.cwd(), 'data', `${type}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const json: unknown = JSON.parse(fileContent);
    let processed: unknown = json;
    if (type === 'personnummer' || type === 'samordningsnummer') {
      if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
        processed = Object.values(json).reduce<string[]>((acc, val) => {
          if (Array.isArray(val)) return acc.concat(val.map(item => String(Object.values(item)[0])));
          return acc;
        }, []);
      }
    }
    if (!validator(processed)) throw new Error(`Validation failed for ${type}`);
    (cachedData as any)[type] = processed;
    return processed as T;
  } catch (error) {
    console.error(`❌ Failed to load ${type}:`, (error as Error).message);
    if (type === 'names') throw error;
    return [] as unknown as T;
  }
}

// --- Helpers ---

function getLuhnDigit(payload: string): string {
    for (let i = 0; i <= 9; i++) if (mod10(payload + i)) return i.toString();
    return '0';
}

function getGender(ssn: string): 'male' | 'female' | 'unknown' {
  const clean = ssn.replace(/[^0-9]/g, '').slice(-4); 
  if (clean.length < 3) return 'unknown'; 
  return parseInt(clean[2]) % 2 === 0 ? 'female' : 'male';
}

function getYearFromSSN(ssn: string): number {
    const clean = ssn.replace(/[^0-9]/g, '');
    let yearPart = 0; let monthPart = 0;
    const OVERNUMMERSERIE_20 = 20;
    const OVERNUMMERSERIE_40 = 40;
    const OVERNUMMERSERIE_60 = 60;
    if (clean.length === 12) {
        yearPart = parseInt(clean.substring(0, 4), 10);
        monthPart = parseInt(clean.substring(4, 6), 10);
    } else if (clean.length === 10) {
        const yy = parseInt(clean.substring(0, 2), 10);
        monthPart = parseInt(clean.substring(2, 4), 10);
        const currentYear = new Date().getFullYear() % 100;
        yearPart = yy > currentYear ? 1900 + yy : 2000 + yy;
    }
    if (monthPart > OVERNUMMERSERIE_60) monthPart -= OVERNUMMERSERIE_60;
    else if (monthPart > OVERNUMMERSERIE_40) monthPart -= OVERNUMMERSERIE_40;
    else if (monthPart > OVERNUMMERSERIE_20) monthPart -= OVERNUMMERSERIE_20;
    return yearPart;
}

// --- Exports ---

export function generateOrgNumber(): string {
    const prefix = `${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 80) + 20}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    const suffixStart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${suffixStart}${getLuhnDigit(prefix + suffixStart)}`;
}

export async function generateBankAccount(): Promise<Omit<BankAccount, 'type'>> {
    const bankConfig = getRandomElement(BANK_DATA);
    if (!bankConfig) throw new Error('Bank config missing');
    const clearing = Math.floor(Math.random() * (bankConfig.max - bankConfig.min + 1)) + bankConfig.min;
    let account = ''; for(let i=0; i<8; i++) account += Math.floor(Math.random() * 10);
    return { bank: bankConfig.name, clearing: clearing.toString(), account: account };
}

export async function validateAddress(zip: string, city: string | null = null): Promise<ValidationResult> {
    const locations = await loadData<LocationEntry[]>('locations', isLocationArray);
    const cleanZip = zip.replace(/\s+/g, '');
    const matches = locations.filter(loc => loc.zip.replace(/\s+/g, '') === cleanZip);
    if (matches.length === 0) return { valid: false, error: 'Postnumret hittades inte' };
    if (city && !matches.some(loc => loc.city.toLowerCase() === city.toLowerCase())) return { valid: false, error: `Postnumret tillhör inte ${city}`, suggestedCity: matches[0].city };
    return { valid: true, city: matches[0].city, zip: matches[0].zip };
}

export async function getOfficialIdentity(
  type: string = 'personnummer', 
  options: { gender?: string, minYear?: string, maxYear?: string, length?: number, lengthCheck?: boolean } = {}
): Promise<Identity | null> {
  const namesData = await loadData<NamesData>('names', isNamesData);
  if (type === 'license-plate' || type === 'car-plate') return { plate: generateCarPlate(), type: 'license-plate' };
  if (type === 'swish') return { swish: generateSwish(), type: 'swish' };
  if (type === 'mobile') return { mobile: generateMobileNumber(), type: 'mobile' };
  if (type === 'company') {
      const orgNumber = generateOrgNumber();
      const name = `${getRandomElement(namesData.lastNames)}s ${getRandomElement(namesData.company.sectors)} ${getRandomElement(namesData.company.suffixes)}`;
      return { orgNumber, name, vatNumber: `SE${orgNumber.replace('-', '')}01`, type: 'company' };
  }
  if (type === 'bankgiro') {
      const bg = '998' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return { bankgiro: `${bg}-${getLuhnDigit(bg)}`, bank: 'Bankgirot', type: 'bankgiro' };
  }
  if (type === 'plusgiro') return { plusgiro: generatePlusgiro(), bank: 'Plusgirot', type: 'plusgiro' };
  if (type === 'bank_account') return { ...(await generateBankAccount()), type: 'bank_account' };
  if (type === 'ocr') return { ocr: generateOCR(options.length || 10, options.lengthCheck || false), length: options.length || 10, type: 'ocr' };

  const ssnType = type === 'samordningsnummer' ? 'samordningsnummer' : 'personnummer';
  const list = await loadData<string[]>(ssnType, (d: unknown): d is string[] => Array.isArray(d));
  const locations = await loadData<LocationEntry[]>('locations', isLocationArray);
  let candidates = list;
  if (options.gender) candidates = candidates.filter(ssn => getGender(ssn) === options.gender);
  if (options.minYear || options.maxYear) {
      candidates = candidates.filter(ssn => {
          const y = getYearFromSSN(ssn);
          return !(options.minYear && y < parseInt(options.minYear)) && !(options.maxYear && y > parseInt(options.maxYear));
      });
  }
  if (!candidates.length) return null;
  const ssn = getRandomElement(candidates)!;
  const actualGender = getGender(ssn);
  const location = getRandomElement(locations) || { street: 'Storgatan', zip: '111 22', city: 'Stockholm' };
  return {
    ssn: ssn.length === 12 ? ssn.slice(2) : ssn, 
    firstName: getRandomElement(actualGender === 'female' ? namesData.firstNames.female : namesData.firstNames.male)!, 
    lastName: getRandomElement(namesData.lastNames)!, 
    gender: actualGender, type: 'person',
    address: { street: `${location.street} ${Math.floor(Math.random() * 100) + 1}`, zip: location.zip, city: location.city }
  };
}
