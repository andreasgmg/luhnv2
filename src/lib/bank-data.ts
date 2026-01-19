export interface BankConfig {
    name: string;
    min: number;
    max: number;
    type: 1 | 2;
}

export const BANK_DATA: BankConfig[] = [
    { name: 'Svea Bank', min: 9660, max: 9669, type: 2 },
    { name: 'Swedbank', min: 8000, max: 8999, type: 1 },
    { name: 'Handelsbanken', min: 6000, max: 6999, type: 2 },
    { name: 'Nordea', min: 1100, max: 1199, type: 1 },
    { name: 'Nordea', min: 1401, max: 2099, type: 1 },
    { name: 'Nordea', min: 3000, max: 3399, type: 1 },
    { name: 'Nordea', min: 3410, max: 4999, type: 1 },
    { name: 'SEB', min: 5000, max: 5999, type: 1 },
    { name: 'SEB', min: 9120, max: 9124, type: 1 },
    { name: 'SEB', min: 9130, max: 9149, type: 1 },
    { name: 'Skandiabanken', min: 9150, max: 9169, type: 2 },
    { name: 'Danske Bank', min: 1200, max: 1399, type: 1 },
    { name: 'Danske Bank', min: 2400, max: 2499, type: 1 },
    { name: 'Länsförsäkringar Bank', min: 3400, max: 3409, type: 1 },
    { name: 'Länsförsäkringar Bank', min: 9020, max: 9029, type: 2 },
    { name: 'ICA Banken', min: 9270, max: 9279, type: 1 },
    { name: 'Marginalen Bank', min: 9230, max: 9239, type: 1 }
];
