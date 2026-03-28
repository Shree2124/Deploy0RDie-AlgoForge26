import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function GET() {
    try {
        // Fetch reports joined with audit_results and government_projects
        // Note: Supabase joins require foreign key relationships to be defined.
        const { data, error } = await supabaseAdmin
            .from('citizen_reports')
            .select(`
        *,
        audit_results (
          *,
          government_projects (*)
        )
      `);

        if (error) {
            console.error('Map data fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Map API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
