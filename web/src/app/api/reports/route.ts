import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect';
import { RiskLevel } from '@/types/types';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('citizen_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Reports fetch error:', error);
      return NextResponse.json([], { status: 200 });
    }

    // Transform DB rows into the Report[] shape expected by map components
    const reports = (data || [])
      .filter((r: any) => r.latitude != null && r.longitude != null)
      .map((r: any) => {
        const riskMap: Record<string, RiskLevel> = {
          'High': RiskLevel.HIGH,
          'Medium': RiskLevel.MEDIUM,
          'Low': RiskLevel.LOW,
        };

        return {
          id: r.id,
          evidence: {
            image: r.image_url || '',
            timestamp: new Date(r.created_at).getTime(),
            coordinates: { lat: r.latitude, lng: r.longitude },
            userComment: r.notes || undefined,
          },
          auditResult: r.ai_risk_level
            ? {
                riskLevel: riskMap[r.ai_risk_level] || RiskLevel.UNKNOWN,
                discrepancies: r.ai_discrepancies || [],
                reasoning: r.ai_verdict || '',
                confidenceScore: r.ai_detection,
              }
            : undefined,
          status: r.status === 'Verified' ? 'Verified' : r.status === 'Audited' ? 'Audited' : 'Pending',
          category: r.category || 'Other',
        };
      });

    return NextResponse.json(reports);
  } catch (err) {
    console.error('Reports API Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
