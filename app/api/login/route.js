import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
    });

    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan." },
      { status: 500 },
    );
  }
}