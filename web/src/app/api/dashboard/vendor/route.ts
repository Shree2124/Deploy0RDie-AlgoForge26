import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/dbConnect";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("vendor")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendors: data || [] });
  } catch (error) {
    console.error("GET /api/dashboard/vendor error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    }

    const payload = {
      name,
      email: email || null,
      years_of_experience:
        body.years_of_experience !== undefined && body.years_of_experience !== null && body.years_of_experience !== ""
          ? Number(body.years_of_experience)
          : null,
      phone_number:
        body.phone_number !== undefined && body.phone_number !== null && body.phone_number !== ""
          ? Number(body.phone_number)
          : null,
      risk_score:
        body.risk_score !== undefined && body.risk_score !== null && body.risk_score !== ""
          ? Number(body.risk_score)
          : null,
    };

    const { data, error } = await supabaseAdmin
      .from("vendor")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vendor: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/vendor error:", error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
