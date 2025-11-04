import { NextRequest, NextResponse } from "next/server";
import { statements } from "@/lib/db";
import { comparePassword, setAuthCookie } from "@/lib/auth";

interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string;
  profile_picture: string | null;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    const user = statements.getUserByEmail.get(email) as DbUser | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    // Criar sessão
    await setAuthCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      profile_picture: user.profile_picture,
    });

    return NextResponse.json({
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
