import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const contentType = request.headers.get('content-type') || '';
    let status: string, reason: string | null = null, responseText: string | null = null, attachments: string[] | null = null;
    let file: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      status = formData.get('status') as string;
      reason = formData.get('reason') as string | null;
      responseText = formData.get('responseText') as string | null;
      file = formData.get('file') as File | null;
      const existingAttachments = formData.get('attachments');
      attachments = existingAttachments ? JSON.parse(existingAttachments as string) : [];
    } else {
      const body = await request.json();
      status = body.status;
      reason = body.reason;
      responseText = body.responseText;
      attachments = body.attachments || [];
    }

    if (!id || !status) {
      return NextResponse.json({ error: 'RTI ID and status are required' }, { status: 400 });
    }

    // 1. Handle File Upload if present (Server-side bypasses RLS)
    if (file && status === 'Approved') {
      const filePath = `admin-responses/${id}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('rti-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Server-side upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload resolution file' }, { status: 500 });
      }

      const { data } = supabaseAdmin.storage.from('rti-documents').getPublicUrl(filePath);
      if (!attachments) attachments = [];
      attachments.push(data.publicUrl);
    }

    // 2. Update the status on the main rti_requests table
    const { data: updatedRti, error: updateError } = await supabaseAdmin
      .from('rti_requests')
      .update({ status })
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Error updating RTI status:', updateError);
      return NextResponse.json({ error: 'Failed to update RTI status' }, { status: 500 });
    }

    // 3. Insert into rti_response table
    if (status === 'Approved' || status === 'Rejected') {
      const responsePayload: any = {
        rti_id: parseInt(id),
        response_type: status,
      };

      if (status === 'Approved') {
        responsePayload.response_text = responseText || null;
        responsePayload.attachments = attachments || [];
      } else if (status === 'Rejected') {
        responsePayload.rejection_reason = reason || null;
      }

      const { error: responseError } = await supabaseAdmin
        .from('rti_response')
        .insert(responsePayload);

      if (responseError) console.error('Error inserting RTI response:', responseError);
    }

    // 4. Log the action
    let logNotes = status === 'Approved' ? 'RTI Approved and formal response dispatched.' :
      status === 'Rejected' ? `Rejected Context: ${reason}` :
        'Status reverted to Pending Review.';

    await supabaseAdmin.from('rti_logs').insert({
      rti_id: parseInt(id),
      action: `Status updated to ${status}`,
      notes: logNotes
    });

    return NextResponse.json(updatedRti[0]);

  } catch (err) {
    console.error(`API /api/update-rti-status/${id} Error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
