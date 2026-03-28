import { NextResponse } from 'next/server';
import { MOCK_OFFICIAL_RECORDS } from '@/lib/constants';

export async function GET() {
  // Return official records (using constants; swap with DB query when government_projects table is populated)
  return NextResponse.json(MOCK_OFFICIAL_RECORDS);
}
