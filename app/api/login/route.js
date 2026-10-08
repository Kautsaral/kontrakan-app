import { NextResponse } from "next/server";
import { createSessionToken, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message: "Password salah.",
        },
        { status: 401 },
      );
    }

    const sessionToken = await createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan.",
      },
      { status: 500 },
    );
  }
}
