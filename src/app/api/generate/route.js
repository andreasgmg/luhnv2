import { NextResponse } from 'next/server';
import { getOfficialIdentity } from '@/lib/data-provider';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'personnummer';
  
  // Logic is fast, no need for async usually, but good practice
  const identity = getOfficialIdentity(type);
  
  if (!identity) {
    return NextResponse.json({ error: 'Failed to generate identity' }, { status: 500 });
  }

  return NextResponse.json(identity);
}