import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('citizen_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Admin Reports fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('Admin Reports API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
