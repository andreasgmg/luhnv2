const SENSITIVE_KEYS = new Set([
  // Identiteter
  'ssn', 'personnummer', 'samordningsnummer', 
  'id', 'value', 'value2', // Generiska fält som i detta projekt ofta bär PII
  
  // Bank & Finans
  'account', 'kontonummer', 'accountnumber',
  'clearing', 'clearingnumber', 'clearingnummer',
  'orgnumber', 'organisationsnummer', 
  'iban', 'bic', 'creditcard', 'cardnumber', 'cvv', 'cvc',
  'swish', 'bg', 'bankgiro', 'pg', 'plusgiro', 'ocr',

  // Kontaktinfo
  'mobile', 'mobil', 'phone', 'telephone', 'phonenumber',
  'email', 'mail',
  'name', 'firstname', 'lastname', 'fullname',
  'street', 'adress', 'address', 'zip', 'postcode', 'postnummer', 'city', 'ort',
  
  // Fordon
  'plate', 'licenseplate', 'carplate', 'regnr', 'registreringsnummer',

  // Säkerhet (Generella)
  'password', 'secret', 'token', 'key', 'auth', 'authorization', 'cookie', 'bearer'
]);

function sanitize(obj: any): any {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const cleaned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Exakt matchning (case-insensitive) för att undvika false positives (t.ex. "providerId" vs "id")
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        cleaned[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        cleaned[key] = sanitize(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ 
        level: 'info', 
        message, 
        ...sanitize(meta), 
        timestamp: new Date().toISOString() 
    }));
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...sanitize(meta), 
      timestamp: new Date().toISOString() 
    }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ 
        level: 'warn', 
        message, 
        ...sanitize(meta), 
        timestamp: new Date().toISOString() 
    }));
  }
};
