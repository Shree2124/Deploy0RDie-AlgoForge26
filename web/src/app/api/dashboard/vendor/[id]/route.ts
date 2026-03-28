import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/dbConnect";

type Params = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const vendorId = Number(params.id);
    if (Number.isNaN(vendorId)) {
      return NextResponse.json({ error: "Invalid vendor id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("vendor")
      .select("*")
      .eq("id", vendorId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendor: data });
  } catch (error) {
    console.error("GET /api/dashboard/vendor/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const vendorId = Number(params.id);
    if (Number.isNaN(vendorId)) {
      return NextResponse.json({ error: "Invalid vendor id" }, { status: 400 });
    }

    const body = await req.json();
    const updatePayload: Record<string, unknown> = {};

    if (body.name !== undefined) updatePayload.name = String(body.name || "").trim();
    if (body.email !== undefined) updatePayload.email = body.email ? String(body.email).trim() : null;
    if (body.years_of_experience !== undefined) {
      updatePayload.years_of_experience =
        body.years_of_experience === "" || body.years_of_experience === null
          ? null
          : Number(body.years_of_experience);
    }
    if (body.phone_number !== undefined) {
      updatePayload.phone_number =
        body.phone_number === "" || body.phone_number === null
          ? null
          : Number(body.phone_number);
    }
    if (body.risk_score !== undefined) {
      updatePayload.risk_score =
        body.risk_score === "" || body.risk_score === null
          ? null
          : Number(body.risk_score);
    }

    const { data, error } = await supabaseAdmin
      .from("vendor")
      .update(updatePayload)
      .eq("id", vendorId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendor: data });
  } catch (error) {
    console.error("PATCH /api/dashboard/vendor/[id] error:", error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const vendorId = Number(params.id);
    if (Number.isNaN(vendorId)) {
      return NextResponse.json({ error: "Invalid vendor id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("vendor").delete().eq("id", vendorId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dashboard/vendor/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
