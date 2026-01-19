import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '../../../../lib/data-provider';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validatePlusgiro,
    validateBankAccount,
    ValidationResult
} from '../../../../lib/validators';

export async function GET(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    const { type } = params;
    const { searchParams } = new URL(request.url);
    const normalizedType = type.toLowerCase();

    let result: ValidationResult;

    try {
        switch (normalizedType) {
            case 'personnummer':
            case 'ssn':
            case 'samordningsnummer': {
                const id = searchParams.get('id') || searchParams.get('value');
                if (!id) return missingParam('id');
                result = validatePersonnummer(id);
                break;
            }
            case 'organisation':
            case 'org': {
                const id = searchParams.get('id') || searchParams.get('value');
                if (!id) return missingParam('id');
                result = validateOrgNumber(id);
                break;
            }
            case 'moms':
            case 'vat': {
                const id = searchParams.get('id') || searchParams.get('value');
                if (!id) return missingParam('id');
                result = validateVAT(id);
                break;
            }
            case 'bankgiro':
            case 'bg': {
                const id = searchParams.get('id') || searchParams.get('value');
                if (!id) return missingParam('id');
                result = validateBankgiro(id);
                break;
            }
            case 'plusgiro':
            case 'pg': {
                const id = searchParams.get('id') || searchParams.get('value');
                if (!id) return missingParam('id');
                result = validatePlusgiro(id);
                break;
            }
            case 'bank-account':
            case 'account': {
                const clearing = searchParams.get('clearing');
                const account = searchParams.get('account') || searchParams.get('number');
                if (!clearing) return missingParam('clearing');
                if (!account) return missingParam('account');
                result = validateBankAccount(clearing, account);
                break;
            }
            case 'adress':
            case 'zip': {
                const zip = searchParams.get('zip') || searchParams.get('value');
                const city = searchParams.get('city');
                if (!zip) return missingParam('zip');
                result = await validateAddress(zip, city);
                break;
            }
            default:
                return NextResponse.json({ 
                    error: `Unknown validation type: ${type}`,
                    code: 'INVALID_TYPE',
                    valid: false
                }, { status: 404 });
        }

        return NextResponse.json({
            ...result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Validation Error:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            code: 'INTERNAL_ERROR',
            message: (error as Error).message
        }, { status: 500 });
    }
}

function missingParam(name: string) {
    return NextResponse.json({ 
        error: `Missing required parameter: ${name}`,
        code: `MISSING_${name.toUpperCase()}`,
        valid: false
    }, { status: 400 });
}