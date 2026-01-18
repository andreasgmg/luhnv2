import { NextRequest, NextResponse } from 'next/server';
import { getOfficialIdentity } from '../../../lib/data-provider';

// Helper för XML-escaping
function escapeXML(val: any): string {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
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

// Configuration Constants
const MAX_COUNT = 100000;
const YIELD_THRESHOLD = 200; // Yield control to event loop every X items

/**
 * API v3 - Streaming Support
 * Handles large-scale data generation (up to 100k rows) via Web Streams.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'personnummer';
    const format = searchParams.get('format') || 'json';
    
    let count = parseInt(searchParams.get('count') || '1');
    if (isNaN(count) || count < 1) count = 1;
    if (count > MAX_COUNT) count = MAX_COUNT;

    const options = {
      gender: searchParams.get('gender') ?? undefined,
      minYear: searchParams.get('minYear') ?? undefined,
      maxYear: searchParams.get('maxYear') ?? undefined
    };

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // JSON Start
          if (format === 'json' && count > 1) {
            controller.enqueue(encoder.encode('['));
          }
          
          // CSV Header
          if (format === 'csv') {
            let header = '';
            if (type === 'company') header = 'orgNumber,name,vatNumber\n';
            else if (type === 'bankgiro' || type === 'plusgiro') header = 'bankgiro,bank\n';
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

            // Periodically yield to event loop to keep the server responsive
            if (i % YIELD_THRESHOLD === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }

          // Finalize
          if (format === 'json' && count > 1) controller.enqueue(encoder.encode(']'));
          if (format === 'xml') controller.enqueue(encoder.encode('</root>'));
          
          controller.close();
        } catch (err) {
          console.error('Streaming Error:', err);
          controller.error(err);
        }
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

  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ 
        error: 'Failed to initialize data generation', 
        code: 'GENERATE_INIT_ERROR' 
    }, { status: 500 });
  }
}