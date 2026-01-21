const SENSITIVE_KEYS = [
  'ssn', 'personnummer', 'samordningsnummer', 'id', 'value', 'value2',
  'account', 'kontonummer', 'clearing', 'orgNumber', 'organisationsnummer',
  'mobile', 'mobil', 'phone', 'email', 'name', 'firstName', 'lastName',
  'street', 'adress', 'zip', 'postnummer', 'city', 'ort',
  'swish', 'bg', 'bankgiro', 'pg', 'plusgiro', 'ocr', 'plate', 'car-plate', 'license-plate'
];

function sanitize(obj: any): any {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const cleaned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
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