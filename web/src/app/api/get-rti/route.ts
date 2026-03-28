import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('rti_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('RTI Admin fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch RTI requests' }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err) {
        console.error('RTI Admin API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
