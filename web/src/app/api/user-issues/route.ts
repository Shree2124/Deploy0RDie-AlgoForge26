import { supabase } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {

  try {
    const { userId } = await request.json();
    console.log(userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('citizen_reports')
      .select('id, category, notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user issues:', error);
      return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (err) {
    console.error('API /api/user-issues Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
