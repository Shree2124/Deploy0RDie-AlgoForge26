import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
        const { reportId, imageUrl, latitude, longitude, notes, category, userId, citizenId } = body;

        let issueId: string = reportId;

        if (!issueId) {
            if (!imageUrl || typeof latitude !== "number" || typeof longitude !== "number") {
                return NextResponse.json({ error: "Missing required data" }, { status: 400 });
            }

            const { data: insertedReport, error: insertError } = await supabaseAdmin
                .from("citizen_reports")
                .insert({
                    image_url: imageUrl,
                    latitude,
                    longitude,
                    notes: notes || null,
                    user_id: userId || citizenId || null,
                    status: "Pending AI",
                })
                .select("id")
                .single();

            if (insertError || !insertedReport) {
                console.error("Failed to insert report:", insertError);
                return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
            }

            issueId = insertedReport.id;
        }

        const { data: report, error: reportError } = await supabaseAdmin
            .from("citizen_reports")
            .select("id, image_url, notes, latitude, longitude, user_id")
            .eq("id", issueId)
            .single();

        if (reportError || !report) {
            console.error("Failed to load report for audit:", reportError);
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const effectiveCitizenId = report.user_id || userId || citizenId;
        if (!effectiveCitizenId) {
            return NextResponse.json({ error: "Citizen ID is required for AI audit" }, { status: 400 });
        }

        const imageResponse = await fetch(report.image_url);
        if (!imageResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch report image" }, { status: 500 });
        }

        const imageBlob = await imageResponse.blob();
        const imageType = imageBlob.type || "image/jpeg";
        const imageFile = new File([imageBlob], `report-${issueId}.jpg`, { type: imageType });

        const issueAIFormData = new FormData();
        issueAIFormData.append("issueId", issueId);
        issueAIFormData.append("citizenId", String(effectiveCitizenId));
        issueAIFormData.append(
            "userInput",
            JSON.stringify({
                notes: report.notes || notes || "",
                category: category || "General",
                latitude: report.latitude,
                longitude: report.longitude,
            })
        );
        issueAIFormData.append("image", imageFile);

        const issueAiUrl = new URL("/api/issue-ai", request.url);
        const issueAiResponse = await fetch(issueAiUrl.toString(), {
            method: "POST",
            body: issueAIFormData,
        });

        if (!issueAiResponse.ok) {
            const errorBody = await issueAiResponse.text();
            console.error("Issue AI call failed:", errorBody);
            return NextResponse.json({ error: "Failed to process issue AI" }, { status: 500 });
        }

        const issueAiResult = await issueAiResponse.json();

        return NextResponse.json({
            success: true,
            issueId,
            issueAi: issueAiResult,
        });

    } catch (err) {
        console.error("Audit API Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}