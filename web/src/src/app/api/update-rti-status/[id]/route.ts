import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'RTI ID and status are required' }, { status: 400 });
  }

  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('rti_requests')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating RTI status:', error);
      return NextResponse.json({ error: 'Failed to update RTI status', details: error.message }, { status: 500 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'RTI request not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);

  } catch (err) {
    console.error(`API /api/update-rti-status/${id} Error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
