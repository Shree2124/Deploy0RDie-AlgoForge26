import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// POST: Log in hone par session cookie set karna
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Cookie set kar rahe hain (Next.js cookies API use karke)
    const cookieStore = await cookies();
    cookieStore.set({
      name: "civic_session_token", // Is naam ko apne middleware me use karna
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days valid
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Log out hone par session cookie clear karna
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("civic_session_token");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}