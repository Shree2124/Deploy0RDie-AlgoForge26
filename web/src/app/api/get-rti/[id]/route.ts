import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'RTI ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('rti_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error code for no rows found
        return NextResponse.json({ error: 'RTI request not found' }, { status: 404 });
      }
      console.error('Error fetching RTI request:', error);
      return NextResponse.json({ error: 'Failed to fetch RTI request', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error(`API /api/get-rti/${id} Error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
