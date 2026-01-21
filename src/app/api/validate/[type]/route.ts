import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '../../../../lib/data-provider';
import { logger } from '../../../../lib/logger';
import { 
    validatePersonnummer, 
    validateOrgNumber, 
    validateVAT, 
    validateBankgiro, 
    validatePlusgiro, 
    validateBankAccount,
    validateCarPlate,
    validateSwish,
    ValidationResult
} from '../../../../lib/validators';

type ValidatorFn = (value: string) => ValidationResult;

const VALIDATORS: Record<string, ValidatorFn> = {
    personnummer: validatePersonnummer,
    ssn: validatePersonnummer,
    samordningsnummer: validatePersonnummer,
    organisation: validateOrgNumber,
    org: validateOrgNumber,
    vat: validateVAT,
    moms: validateVAT,
    bankgiro: validateBankgiro,
    bg: validateBankgiro,
    plusgiro: validatePlusgiro,
    pg: validatePlusgiro,
    'car-plate': validateCarPlate,
    'license-plate': validateCarPlate,
    bilnummer: validateCarPlate,
    swish: validateSwish
};

export async function GET(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    const { type } = params;
    const { searchParams } = new URL(request.url);
    const normalizedType = type.toLowerCase();

    try {
        let result: ValidationResult;

        // 1. Specialfall: Bankkonto (2 parametrar)
        if (normalizedType === 'bank-account' || normalizedType === 'account') {
            const clearing = searchParams.get('clearing');
            const account = searchParams.get('account') || searchParams.get('number');
            if (!clearing) return missingParam('clearing');
            if (!account) return missingParam('account');
            result = validateBankAccount(clearing, account);
        } 
        // 2. Specialfall: Adress (Async DB lookup)
        else if (normalizedType === 'adress' || normalizedType === 'zip' || normalizedType === 'postnummer') {
            const zip = searchParams.get('zip') || searchParams.get('value');
            const city = searchParams.get('city');
            if (!zip) return missingParam('zip');
            result = await validateAddress(zip, city);
        }
        // 3. Standard-validatorer (Strategy Pattern)
        else {
            const validator = VALIDATORS[normalizedType];
            if (!validator) {
                return NextResponse.json({ 
                    error: `Unknown validation type: ${type}`,
                    code: 'INVALID_TYPE',
                    valid: false
                }, { status: 404 });
            }

            const id = searchParams.get('id') || searchParams.get('value');
            if (!id) return missingParam('id');
            result = validator(id);
        }

        // Return result with caching headers for deterministic validation
        return NextResponse.json({
            ...result,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        logger.error('Validation API Error', error, { 
            path: request.nextUrl.pathname, // Endast path, inga query params med PII
            type: params.type 
        });
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            code: 'INTERNAL_ERROR'
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
