import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '../../../lib/data-provider';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validatePlusgiro,
    validateBankAccount,
    ValidationResult
} from '../../../lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const value = searchParams.get('value');
  const value2 = searchParams.get('value2');

  if (!type) {
      return NextResponse.json({ error: 'Missing parameter: type' }, { status: 400 });
  }
  if (!value) {
      return NextResponse.json({ error: 'Missing parameter: value' }, { status: 400 });
  }

  let result: ValidationResult = { valid: false };

  switch (type) {
      case 'address':
      case 'zip':
          result = await validateAddress(value, value2);
          break;
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
              return NextResponse.json({ error: 'Missing parameter: value2 (required for account number)' }, { status: 400 });
          }
          result = validateBankAccount(value, value2);
          break;
      default:
          return NextResponse.json({ error: `Invalid validation type: ${type}` }, { status: 400 });
  }

  return NextResponse.json(result);
}
