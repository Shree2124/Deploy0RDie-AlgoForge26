import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, reason } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'RTI ID and status are required' }, { status: 400 });
  }

  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  try {
    let updatePayload: any = { status };

    if (status === 'Rejected' && reason) {
      const { data: currentRti } = await supabaseAdmin
        .from('rti_requests')
        .select('extract_data')
        .eq('id', id)
        .single();

      const extractData = currentRti?.extract_data || {};
      extractData.rejection_reason = reason;
      updatePayload.extract_data = extractData;
    }

    const { data, error } = await supabaseAdmin
      .from('rti_requests')
      .update(updatePayload)
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
