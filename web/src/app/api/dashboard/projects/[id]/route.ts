import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/dbConnect";

type Params = { params: { id: string } };

const uploadProjectReport = async (projectId: string, file: File) => {
  const safeName = file.name.replace(/\s+/g, "-");
  const filePath = `${projectId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("project_reports")
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabaseAdmin.storage.from("project_reports").getPublicUrl(filePath);
  return data.publicUrl;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error("GET /api/dashboard/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const updatePayload: Record<string, unknown> = {};

    const isMultipart = (req.headers.get("content-type") || "").includes("multipart/form-data");

    if (isMultipart) {
      const formData = await req.formData();
      const projectName = formData.get("project_name");
      const category = formData.get("category");
      const budget = formData.get("budget");
      const deadline = formData.get("deadline");
      const status = formData.get("status");
      const latitude = formData.get("latitude");
      const longitude = formData.get("longitude");
      const description = formData.get("description");
      const department = formData.get("department");
      const report = formData.get("report");
      const vendorId = formData.get("vendor_id");
      const reportFile = formData.get("report_file");

      if (projectName !== null) updatePayload.project_name = String(projectName || "").trim();
      if (category !== null) updatePayload.category = String(category || "").trim();
      if (budget !== null) updatePayload.budget = String(budget).trim() === "" ? null : Number(budget);
      if (deadline !== null) updatePayload.deadline = String(deadline).trim() || null;
      if (status !== null) updatePayload.status = String(status).trim() || "Planned";
      if (latitude !== null) updatePayload.latitude = String(latitude).trim() === "" ? null : Number(latitude);
      if (longitude !== null) updatePayload.longitude = String(longitude).trim() === "" ? null : Number(longitude);
      if (description !== null) updatePayload.description = String(description).trim() || null;
      if (department !== null) updatePayload.department = String(department).trim() || null;
      if (report !== null) updatePayload.report = String(report).trim() || null;
      if (vendorId !== null) updatePayload.vendor_id = String(vendorId).trim() === "" ? null : Number(vendorId);

      if (reportFile instanceof File && reportFile.size > 0) {
        updatePayload.report = await uploadProjectReport(id, reportFile);
      }
    } else {
      const body = await req.json();
      if (body.project_name !== undefined) updatePayload.project_name = body.project_name;
      if (body.category !== undefined) updatePayload.category = body.category;
      if (body.budget !== undefined) updatePayload.budget = body.budget === "" ? null : Number(body.budget);
      if (body.deadline !== undefined) updatePayload.deadline = body.deadline || null;
      if (body.status !== undefined) updatePayload.status = body.status;
      if (body.latitude !== undefined) updatePayload.latitude = body.latitude === "" ? null : Number(body.latitude);
      if (body.longitude !== undefined) updatePayload.longitude = body.longitude === "" ? null : Number(body.longitude);
      if (body.description !== undefined) updatePayload.description = body.description || null;
      if (body.department !== undefined) updatePayload.department = body.department || null;
      if (body.report !== undefined) updatePayload.report = body.report || null;
      if (body.vendor_id !== undefined) updatePayload.vendor_id = body.vendor_id === "" || body.vendor_id === null ? null : Number(body.vendor_id);
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error("PATCH /api/dashboard/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dashboard/projects/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
