import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeAuthCookie();

    return NextResponse.json({
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 });
  }
}
