import { NextRequest, NextResponse } from "next/server";
import { statements } from "@/lib/db";
import { hashPassword, setAuthCookie } from "@/lib/auth";

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
    const { name, email, password, profile_picture } = body;

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar se o email já está cadastrado
    const existingUser = statements.getUserByEmail.get(email) as DbUser | undefined;
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const result = statements.createUser.run(
      name,
      email,
      hashedPassword,
      profile_picture || null
    );

    const userId = result.lastInsertRowid as number;

    // Buscar usuário criado
    const user = statements.getUser.get(userId) as DbUser;

    // Criar sessão
    await setAuthCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      profile_picture: user.profile_picture,
    });

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
