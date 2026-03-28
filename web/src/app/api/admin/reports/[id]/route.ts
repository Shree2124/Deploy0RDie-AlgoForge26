import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status, reason } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Optionally append rejection reason to notes
        let notesUpdate = {};
        if (status === 'Rejected' && reason) {
            const { data: existingReport } = await supabaseAdmin.from('citizen_reports').select('notes').eq('id', id).single();
            const existingNotes = existingReport?.notes || '';
            notesUpdate = { notes: `${existingNotes}\n\nAdmin Rejection Reason: ${reason}` };
        }

        const { data, error } = await supabaseAdmin
            .from('citizen_reports')
            .update({ status, ...notesUpdate })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Admin Report Update Error:', error);
            return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('Admin Report PATCH Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
