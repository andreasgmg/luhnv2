import { NextResponse } from 'next/server';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validatePlusgiro,
    validateBankAccount 
} from '../../../lib/utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const value = searchParams.get('value');
  const value2 = searchParams.get('value2'); // For account number

  if (!type || !value) {
      return NextResponse.json({ error: 'Missing type or value' }, { status: 400 });
  }

  let result = { valid: false, error: 'Unknown type' };

  switch (type) {
      case 'ssn':
      case 'personnummer':
      case 'samordningsnummer':
          result = validatePersonnummer(value);
          break;
      case 'org':
      case 'organisation':
          result = validateOrgNumber(value);
          break;
      case 'vat':
      case 'moms':
          result = validateVAT(value);
          break;
      case 'bg':
      case 'bankgiro':
          result = validateBankgiro(value);
          break;
      case 'pg':
      case 'plusgiro':
          result = validatePlusgiro(value);
          break;
      case 'account':
      case 'bank_account':
          if (!value2) {
              result = { valid: false, error: 'Missing account number (value2)' };
          } else {
              result = validateBankAccount(value, value2);
          }
          break;
      default:
          return NextResponse.json({ error: 'Invalid validation type' }, { status: 400 });
  }

  return NextResponse.json(result);
}