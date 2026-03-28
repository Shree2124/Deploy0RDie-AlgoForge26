import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/dbConnect";

const generateProjectId = () => `PRJ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

const uploadProjectReport = async (projectId: string, file: File) => {
  const safeName = file.name.replace(/\s+/g, "-");
  const filePath = `${projectId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("vendor_reports")
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    console.log(uploadError)

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabaseAdmin.storage.from("vendor_reports").getPublicUrl(filePath);
  return data.publicUrl;
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error("GET /api/dashboard/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isMultipart = (req.headers.get("content-type") || "").includes("multipart/form-data");

    let id = "";
    let project_name = "";
    let category = "";
    let status = "Planned";
    let budget: number | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;
    let vendor_id: number | null = null;
    let deadline: string | null = null;
    let description: string | null = null;
    let department: string | null = null;
    let report: string | null = null;

    if (isMultipart) {
      const formData = await req.formData();
      id = String(formData.get("id") || "").trim();
      if (!id) id = generateProjectId();
      project_name = String(formData.get("project_name") || formData.get("projectName") || "").trim();
      category = String(formData.get("category") || "").trim();
      status = String(formData.get("status") || "Planned").trim();

      const budgetRaw = formData.get("budget");
      const latRaw = formData.get("latitude");
      const lngRaw = formData.get("longitude");
      const vendorRaw = formData.get("vendor_id");

      budget = budgetRaw !== null && String(budgetRaw).trim() !== "" ? Number(budgetRaw) : null;
      latitude = latRaw !== null && String(latRaw).trim() !== "" ? Number(latRaw) : null;
      longitude = lngRaw !== null && String(lngRaw).trim() !== "" ? Number(lngRaw) : null;
      vendor_id = vendorRaw !== null && String(vendorRaw).trim() !== "" ? Number(vendorRaw) : null;

      deadline = (formData.get("deadline") as string) || null;
      description = (formData.get("description") as string) || null;
      department = (formData.get("department") as string) || null;
      report = (formData.get("report") as string) || null;

      const reportFile = formData.get("report_file");
      if (reportFile instanceof File && reportFile.size > 0) {
        report = await uploadProjectReport(id || "project", reportFile);
      }
    } else {
      const body = await req.json();
      id = String(body.id || "").trim();
      if (!id) id = generateProjectId();
      project_name = String(body.project_name || body.projectName || "").trim();
      category = String(body.category || "").trim();
      status = String(body.status || "Planned").trim();
      budget = body.budget !== undefined && body.budget !== null && body.budget !== "" ? Number(body.budget) : null;
      latitude = body.latitude !== undefined && body.latitude !== null && body.latitude !== "" ? Number(body.latitude) : null;
      longitude = body.longitude !== undefined && body.longitude !== null && body.longitude !== "" ? Number(body.longitude) : null;
      vendor_id = body.vendor_id !== undefined && body.vendor_id !== null && body.vendor_id !== "" ? Number(body.vendor_id) : null;
      deadline = body.deadline || null;
      description = body.description || null;
      department = body.department || null;
      report = body.report || null;
    }

    if (!project_name || !category || budget === null) {
      return NextResponse.json(
        { error: "project_name, category and budget are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        id,
        project_name,
        category,
        budget,
        deadline,
        status,
        latitude,
        longitude,
        description,
        department,
        vendor_id,
        report,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
