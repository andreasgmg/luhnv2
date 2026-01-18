import { NextResponse } from 'next/server';
import { getOfficialIdentity } from '../../../lib/data-provider';

// Helper för XML-generering
function toXML(obj, type) {
    let xml = `<${type}>
`;
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            xml += `  <${key}>
`;
            for (let subKey in obj[key]) {
                xml += `    <${subKey}>${obj[key][subKey]}</${subKey}>
`;
            }
            xml += `  </${key}>
`;
        } else {
            xml += `  <${key}>${obj[key]}</${key}>
`;
        }
    }
    xml += `</${type}>
`;
    return xml;
}

/**
 * API v3 - Streaming Support
 * Hanterar massiv generering (upp till 100k rader) via Web Streams.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'personnummer';
  const format = searchParams.get('format') || 'json';
  
  // Höj taket till 100 000
  let count = parseInt(searchParams.get('count') || '1');
  if (count < 1) count = 1;
  if (count > 100000) count = 100000;

  const options = {
    gender: searchParams.get('gender'),
    minYear: searchParams.get('minYear'),
    maxYear: searchParams.get('maxYear')
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // JSON Start
      if (format === 'json' && count > 1) {
        controller.enqueue(encoder.encode('['));
      }
      
      // CSV Header
      if (format === 'csv') {
        let header = '';
        if (type === 'company') header = 'orgNumber,name,vatNumber\n';
        else if (type === 'bankgiro') header = 'bankgiro,bank\n';
        else if (type === 'plusgiro') header = 'plusgiro,bank\n';
        else if (type === 'ocr') header = 'ocr,length,lengthCheck\n';
        else if (type === 'bank_account') header = 'bank,clearing,account\n';
        else header = 'ssn,firstName,lastName,gender,street,zip,city\n';
        controller.enqueue(encoder.encode(header));
      }

      // XML Start
      if (format === 'xml') {
        controller.enqueue(encoder.encode('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n'));
      }

      for (let i = 0; i < count; i++) {
        const identity = getOfficialIdentity(type, options);
        if (!identity) continue;

        let chunk = '';
        if (format === 'json') {
          chunk = (i > 0 && count > 1 ? ',' : '') + JSON.stringify(identity);
        } else if (format === 'csv') {
          if (type === 'company') {
            chunk = `${identity.orgNumber},"${identity.name}",${identity.vatNumber}\n`;
          } else if (type === 'bankgiro' || type === 'plusgiro') {
            chunk = `${identity.bankgiro || identity.plusgiro},"${identity.bank}"\n`;
          } else if (type === 'bank_account') {
            chunk = `"${identity.bank}",${identity.clearing},${identity.account}\n`;
          } else if (type === 'ocr') {
            chunk = `${identity.ocr},${identity.length},${identity.lengthCheck}\n`;
          } else {
            chunk = `${identity.ssn},"${identity.firstName}","${identity.lastName}",${identity.gender},"${identity.address.street}",${identity.address.zip},"${identity.address.city}"\n`;
          }
        } else if (format === 'xml') {
          chunk = toXML(identity, 'item');
        }

        controller.enqueue(encoder.encode(chunk));

        // Motverka att blockera tråden vid stora jobb
        if (i % 200 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Finalize
      if (format === 'json' && count > 1) controller.enqueue(encoder.encode(']'));
      if (format === 'xml') controller.enqueue(encoder.encode('</root>'));
      
      controller.close();
    },
  });

  const contentTypes = {
    json: 'application/json',
    csv: 'text/csv',
    xml: 'application/xml'
  };

  return new Response(stream, {
    headers: { 
        'Content-Type': contentTypes[format] || 'application/json',
        'Content-Disposition': count > 1 ? `attachment; filename="luhn_export_${type}.${format}"` : 'inline',
        'Cache-Control': 'no-cache'
    },
  });
}