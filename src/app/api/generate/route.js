import { NextResponse } from 'next/server';
import { getOfficialIdentity } from '../../../lib/data-provider';

// Helper to convert object to simplified XML
function toXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    
    const serialize = (obj) => {
        let str = '';
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                str += `  <item>\n${serialize(item)}  </item>\n`;
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    str += `    <${key}>\n${serialize(value)}    </${key}>\n`;
                } else {
                    str += `    <${key}>${value}</${key}>\n`;
                }
            });
        }
        return str;
    };

    xml += serialize(data);
    xml += '</root>';
    return xml;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'personnummer';
  
  // Options
  const gender = searchParams.get('gender');
  const minYear = searchParams.get('minYear');
  const maxYear = searchParams.get('maxYear');
  
  // Batch
  let count = parseInt(searchParams.get('count') || '1');
  if (count < 1) count = 1;
  if (count > 500) count = 500; // Cap at 500

  // Format
  const format = searchParams.get('format') || 'json';

  const results = [];
  
  for (let i = 0; i < count; i++) {
      const identity = getOfficialIdentity(type, { gender, minYear, maxYear });
      if (identity) results.push(identity);
  }

  if (results.length === 0) {
    return NextResponse.json({ error: 'Failed to generate identity' }, { status: 500 });
  }

  const responseData = count === 1 ? results[0] : results;

  if (format === 'xml') {
      return new NextResponse(toXML(responseData), {
          headers: { 'Content-Type': 'application/xml' }
      });
  }

  return NextResponse.json(responseData);
}
