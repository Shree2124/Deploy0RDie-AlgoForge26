import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auditProject } from "@/services/geminiService";
import { supabaseAdmin } from "@/lib/dbConnect";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("civic_session_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({
        message: "Success!",
        userId: user.id
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { reportId, imageUrl, latitude, longitude, notes, category } = body;

        if (!reportId || !imageUrl) {
            return NextResponse.json({ error: "Missing required data" }, { status: 400 });
        }

        // Temporarily commented out nearest project logic
        /*
        const { data: projects, error: rpcError } = await supabaseAdmin.rpc('find_nearest_project', {
            lat: latitude,
            long: longitude
        });

        if (rpcError || !projects || projects.length === 0) {
            console.error('Could not find nearest project:', rpcError);
            return NextResponse.json({ error: 'Could not find a nearby project to audit against.' }, { status: 404 });
        }

        const project = projects[0];
        */

        // Fallback to dummy project data
        const { data: projects } = await supabaseAdmin
            .from('official_records')
            .select('*')
            .limit(1);

        const project = projects?.[0] || {
            project_name: "General Infrastructure",
            status: "In Progress",
            category: category || "General",
            budget: 0,
            contractor: "Unknown"
        };

        // 2. Run the AI Audit
        const auditResult = await auditProject(project, { imageUrl, notes });

        // 3. Update the report with AI results
        const { error: updateError } = await supabaseAdmin
            .from('citizen_reports')
            .update({
                ai_risk_level: auditResult.risk_level,
                ai_verdict: auditResult.ai_verdict,
                status: 'Audited'
            })
            .eq('id', reportId);

        if (updateError) {
            console.error("Failed to update report with audit result:", updateError);
        }

        return NextResponse.json({
            success: true,
            audit: auditResult
        });

    } catch (err) {
        console.error("Audit API Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}