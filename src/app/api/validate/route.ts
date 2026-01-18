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

/**
 * API Validator Route
 * 
 * Handles real-time validation of Swedish identifiers.
 * Returns 200 for successful validation (regardless of result),
 * 400 for bad request syntax, and 500 for internal errors.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const value = searchParams.get('value');
    const value2 = searchParams.get('value2');

    // 1. Basic Request Validation
    if (!type) {
        return NextResponse.json({ 
            error: 'Missing parameter: type', 
            code: 'MISSING_TYPE' 
        }, { status: 400 });
    }
    if (!value) {
        return NextResponse.json({ 
            error: 'Missing parameter: value', 
            code: 'MISSING_VALUE' 
        }, { status: 400 });
    }

    let result: ValidationResult;

    // 2. Routing logic
    switch (type.toLowerCase()) {
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
                return NextResponse.json({ 
                    error: 'Missing parameter: value2 (required for account number)',
                    code: 'MISSING_ACCOUNT_NUMBER'
                }, { status: 400 });
            }
            result = validateBankAccount(value, value2);
            break;
        default:
            return NextResponse.json({ 
                error: `Invalid validation type: ${type}`,
                code: 'INVALID_TYPE'
            }, { status: 400 });
    }

    // 3. Return result
    // We return 200 even if 'valid' is false, because the validation process itself succeeded.
    // However, we ensure the structure is consistent.
    return NextResponse.json({
        ...result,
        timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Validation API Error:', error);
    return NextResponse.json({ 
        error: 'An internal error occurred during validation',
        code: 'INTERNAL_ERROR',
        message: (error as Error).message
    }, { status: 500 });
  }
}