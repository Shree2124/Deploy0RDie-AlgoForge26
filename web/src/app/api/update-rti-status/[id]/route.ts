import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, reason, responseText, attachments } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'RTI ID and status are required' }, { status: 400 });
  }

  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  try {
    // 1. Update the status on the main rti_requests table
    let updatePayload: any = { status };

    const { data: updatedRti, error: updateError } = await supabaseAdmin
      .from('rti_requests')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Error updating RTI status:', updateError);
      return NextResponse.json({ error: 'Failed to update RTI status', details: updateError.message }, { status: 500 });
    }

    if (updatedRti.length === 0) {
      return NextResponse.json({ error: 'RTI request not found' }, { status: 404 });
    }

    // 2. Insert into rti_response table if Approved or Rejected
    if (status === 'Approved' || status === 'Rejected') {
      const responsePayload: any = {
        rti_id: parseInt(id),
        response_type: status,
      };

      if (status === 'Approved') {
        responsePayload.response_text = responseText || null;
        responsePayload.attachments = attachments || null;
      } else if (status === 'Rejected') {
        responsePayload.rejection_reason = reason || null;
      }

      const { error: responseError } = await supabaseAdmin
        .from('rti_response')
        .insert(responsePayload);

      if (responseError) {
        console.error('Error inserting RTI response:', responseError);
      }
    }

    // 3. Log the action into rti_logs
    let notes = null;
    if (status === 'Approved') notes = 'RTI Approved and formal response dispatched.';
    if (status === 'Rejected') notes = `Rejected Context: ${reason || 'No reason provided'}`;
    if (status === 'Pending') notes = 'Administrative status reverted to Pending Review.';

    const { error: logError } = await supabaseAdmin
      .from('rti_logs')
      .insert({
        rti_id: parseInt(id),
        action: `Status updated to ${status}`,
        notes: notes
      });

    if (logError) {
      console.error('Error inserting RTI log:', logError);
    }

    return NextResponse.json(updatedRti[0]);

  } catch (err) {
    console.error(`API /api/update-rti-status/${id} Error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
