import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect'; // Ensure path is correct

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, projectName, category, budget, contractor, deadline, status, latitude, longitude, description } = body;

    if (!id || !projectName || !contractor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        id,
        project_name: projectName,
        category,
        budget: parseFloat(budget),
        contractor,
        deadline,
        status: status || 'Planned',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}