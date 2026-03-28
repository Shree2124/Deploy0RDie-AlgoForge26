import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 1. Safely extract fields (Supports both your Frontend UI and new schema)
    const department = formData.get('department') as string;
    const subject = formData.get('subject') as string || formData.get('title') as string;
    const query = formData.get('query') as string || formData.get('description') as string || formData.get('questions') as string;
    
    const is_anonymous = formData.get('is_anonymous') === 'true';
    const location_address = formData.get('location_address') as string;
    const locationString = formData.get('location') as string | null;
    const userId = formData.get('userId') as string | null;
    const file = formData.get('file') as File | null;
    const linkedReportId = formData.get('linkedReportId') as string | null;

    // Basic validation
    if (!department || !subject || !query) {
      return NextResponse.json({ error: 'Department, subject, and query are required' }, { status: 400 });
    }

    // 2. Handle file upload securely
    let documentUrl: string | null = null;
    if (file) {
      const filePath = `rti-documents/${userId || 'public'}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('rti-files') 
        .upload(filePath, file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
      }
      const { data } = supabaseAdmin.storage.from('rti-files').getPublicUrl(filePath);
      documentUrl = data.publicUrl;
    }

    // 3. Prepare data for insertion (Dynamically building to avoid DB column errors)
    const insertData: any = {
      department,
      subject,
      query,
      status: 'Pending Review', // Standardized status matching Admin Dashboard
      linked_report_id: linkedReportId || null,
      document_url: documentUrl,
    };

    // Only add optional new-schema fields if they exist in the payload
    if (!is_anonymous && userId) insertData.user_id = userId;
    if (is_anonymous) insertData.is_anonymous = true;
    if (location_address) insertData.location_address = location_address;
    
    if (locationString) {
      try {
        insertData.location = JSON.parse(locationString);
      } catch (e) {
        console.error('Failed to parse location JSON');
      }
    }

    // 4. Execute Insertion
    const { data: rtiData, error: insertError } = await supabaseAdmin
      .from('rti_requests')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('RTI insert error:', insertError);
      return NextResponse.json({ error: 'Failed to submit RTI request', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: rtiData });

  } catch (err) {
    console.error('API /api/rti Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}