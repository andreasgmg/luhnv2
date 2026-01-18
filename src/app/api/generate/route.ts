import { NextRequest, NextResponse } from 'next/server';
import { getOfficialIdentity } from '../../../lib/data-provider';

// Helper för XML-escaping
function escapeXML(val: any): string {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;');
}

// Helper för XML-generering
function toXML(obj: any, type: string): string {
    let xml = `<${type}>
`;
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            xml += `  <${key}>
`;
            for (let subKey in obj[key]) {
                xml += `    <${subKey}>${escapeXML(obj[key][subKey])}</${subKey}>
`;
            }
            xml += `  </${key}>
`;
        } else {
            xml += `  <${key}>${escapeXML(obj[key])}</${key}>
`;
        }
    }
    xml += `</${type}>
`;
    return xml;
}

// Helper för korrekt CSV-escaping
function escapeCSV(val: any): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'personnummer';
  const format = searchParams.get('format') || 'json';
  
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
      if (format === 'json' && count > 1) {
        controller.enqueue(encoder.encode('['));
      }
      
      if (format === 'csv') {
        let header = '';
        if (type === 'company') header = 'orgNumber,name,vatNumber\n';
        else if (type === 'bankgiro' || type === 'plusgiro') header = 'bankgiro,bank\n';
        else if (type === 'ocr') header = 'ocr,length,lengthCheck\n';
        else if (type === 'bank_account') header = 'bank,clearing,account\n';
        else header = 'ssn,firstName,lastName,gender,street,zip,city\n';
        controller.enqueue(encoder.encode(header));
      }

      if (format === 'xml') {
        controller.enqueue(encoder.encode('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n'));
      }

      for (let i = 0; i < count; i++) {
        const identity = await getOfficialIdentity(type, options);
        if (!identity) continue;

        let chunk = '';
        if (format === 'json') {
          chunk = (i > 0 && count > 1 ? ',' : '') + JSON.stringify(identity);
        } else if (format === 'csv') {
          const id = identity as any;
          if (type === 'company') {
            chunk = `${id.orgNumber},${escapeCSV(id.name)},${id.vatNumber}\n`;
          } else if (type === 'bankgiro' || type === 'plusgiro') {
            chunk = `${id.bankgiro || id.plusgiro},${escapeCSV(id.bank)}\n`;
          } else if (type === 'bank_account') {
            chunk = `${escapeCSV(id.bank)},${id.clearing},${id.account}\n`;
          } else if (type === 'ocr') {
            chunk = `${id.ocr},${id.length},${id.lengthCheck}\n`;
          } else {
            chunk = `${id.ssn},${escapeCSV(id.firstName)},${escapeCSV(id.lastName)},${id.gender},${escapeCSV(id.address.street)},${id.address.zip},${escapeCSV(id.address.city)}\n`;
          }
        } else if (format === 'xml') {
          chunk = toXML(identity, 'item');
        }

        controller.enqueue(encoder.encode(chunk));

        if (i % 200 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      if (format === 'json' && count > 1) controller.enqueue(encoder.encode(']'));
      if (format === 'xml') controller.enqueue(encoder.encode('</root>'));
      
      controller.close();
    },
  });

  const contentTypes: Record<string, string> = {
    json: 'application/json',
    csv: 'text/csv',
    xml: 'application/xml'
  };

  return new Response(stream, {
    headers: { 
        'Content-Type': contentTypes[format] || 'application/json',
        'Content-Disposition': count > 10 ? `attachment; filename="luhn_export_${type}.${format}"` : 'inline',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
  });
}