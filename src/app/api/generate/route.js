import { NextResponse } from 'next/server';
import { getOfficialIdentity } from '../../../lib/data-provider';

/**
 * API v3 - Streaming Support
 * Handles large-scale data generation without memory issues.
 */

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'personnummer';
  
  // Options
  const gender = searchParams.get('gender');
  const minYear = searchParams.get('minYear');
  const maxYear = searchParams.get('maxYear');
  
  // Count - increased limit to 100k
  let count = parseInt(searchParams.get('count') || '1');
  if (count < 1) count = 1;
  if (count > 100000) count = 100000; 

  const format = searchParams.get('format') || 'json';

  // For small requests, keep it simple
  if (count === 1 && format === 'json') {
      const identity = getOfficialIdentity(type, { gender, minYear, maxYear });
      return NextResponse.json(identity);
  }

  // For large requests, use Streaming
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      if (format === 'json') {
        controller.enqueue(encoder.encode('['));
      } else if (format === 'csv') {
        // CSV Header - adjust based on type
        let header = 'ssn,firstName,lastName,gender,street,zip,city\n';
        if (type === 'company') header = 'orgNumber,name,vatNumber\n';
        if (type === 'bankgiro') header = 'bankgiro,bank\n';
        if (type === 'plusgiro') header = 'plusgiro,bank\n';
        if (type === 'bank_account') header = 'bank,clearing,account\n';
        if (type === 'ocr') header = 'ocr,length,lengthCheck\n';
        controller.enqueue(encoder.encode(header));
      }

      for (let i = 0; i < count; i++) {
        const identity = getOfficialIdentity(type, { gender, minYear, maxYear });
        if (!identity) continue;

        let chunk = '';
        if (format === 'json') {
          chunk = (i > 0 ? ',' : '') + JSON.stringify(identity);
        } else if (format === 'csv') {
          // Flatten object to CSV line
          if (type === 'company') {
            chunk = `${identity.orgNumber},"${identity.name}",${identity.vatNumber}\n`;
          } else if (type === 'bankgiro') {
            chunk = `${identity.bankgiro},"${identity.bank}"\n`;
          } else if (type === 'plusgiro') {
            chunk = `${identity.plusgiro},"${identity.bank}"\n`;
          } else if (type === 'bank_account') {
            chunk = `"${identity.bank}",${identity.clearing},${identity.account}\n`;
          } else if (type === 'ocr') {
            chunk = `${identity.ocr},${identity.length},${identity.lengthCheck}\n`;
          } else {
            // Person
            chunk = `${identity.ssn},"${identity.firstName}","${identity.lastName}",${identity.gender},"${identity.address.street}",${identity.address.zip},"${identity.address.city}"\n`;
          }
        }

        controller.enqueue(encoder.encode(chunk));
        
        // Yield to event loop every 100 items to prevent blocking
        if (i % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      if (format === 'json') {
        controller.enqueue(encoder.encode(']'));
      }
      controller.close();
    },
  });

  const contentType = format === 'csv' ? 'text/csv' : 'application/json';
  const fileName = `luhn_export_${type}.${format}`;

  return new Response(stream, {
    headers: { 
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`, 
        'Transfer-Encoding': 'chunked'
    },
  });
}
