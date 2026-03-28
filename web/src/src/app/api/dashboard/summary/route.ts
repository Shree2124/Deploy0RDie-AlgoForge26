import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/dbConnect";
import { auditProject } from "@/services/geminiService";
import { OfficialRecord } from "@/types/types";

const reportCount = async () => {
  const { count, error } = await supabaseAdmin
    .from("citizen_reports")
    .select("*", { count: "exact", head: true });

  if (error) return 0;

  return count;
};

const riskCount = async (riskLevel: string) => {
  const { count, error } = await supabaseAdmin
    .from("citizen_reports")
    .select("*", { count: "exact", head: true })
    .eq("risk_level", riskLevel);

  if (error) return 0;
  return count;
};

const countTotalProjects = async()=>{
    const { count, error } = await supabaseAdmin
    .from("government_projects")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error("error while fetching projects reports");

  return count;
}

export async function GET(req: NextRequest) {
  try {
    const totalCount = await reportCount();
    console.log(totalCount)
    const highRiskCount = await riskCount("High");
    const mediumRiskCount = await riskCount("Medium");
    const lowRiskCount = await riskCount("Low");
    const totalProjects = await countTotalProjects()

    return NextResponse.json({totalProjects, toatalReportCount: totalCount, highRiskCount, mediumRiskCount, lowRiskCount})
  } catch (error) {
    console.error("DASHBOARD/SUMMARY API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
