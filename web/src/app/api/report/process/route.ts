import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  try {
    const { reportId, notes } = await req.json();

    if (!reportId) return NextResponse.json({ error: 'No report ID' }, { status: 400 });

    // MOCK DELAY: Simulate AI processing time (e.g., Python model + Gemini taking 3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // MOCK AI RESPONSE FROM YOUR FRIEND'S ARCHITECTURE
    const mockModelDetections = [
      { class_id: 2, class_name: "damaged", confidence: 0.89, bbox: [40, 508, 1808, 1000] },
      { class_id: 2, class_name: "damaged", confidence: 0.76, bbox: [421, 555, 1848, 1000] }
    ];

    // Mock Gemini Verification Result
    const mockAiVerdict = `Visual analysis confirms severe structural damage consistent with citizen notes ("${notes}"). Discrepancy confirmed against completion records.`;
    
    // UPDATE DB WITH AI RESULTS
    const { error } = await supabaseAdmin
      .from('citizen_reports')
      .update({
        status: 'Verified',
        ai_risk_level: 'High',
        ai_discrepancies: ['Major surface damage detected', 'Multiple cracks identified'],
        ai_verdict: mockAiVerdict,
        raw_detections: mockModelDetections // Saving raw model output
      })
      .eq('id', reportId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AI Processing Error:", error);
    return NextResponse.json({ error: "Failed to process AI" }, { status: 500 });
  }
}