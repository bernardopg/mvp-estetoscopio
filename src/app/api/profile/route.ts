import { getAuthUser, hashPassword, setAuthCookie } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const dbUser = statements.getUser.get(user.id) as
      | {
          id: number;
          name: string;
          email: string;
          profile_picture: string | null;
          created_at: string;
        }
      | undefined;

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Não retornar a senha
    const { ...userWithoutPassword } = dbUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword, profile_picture } = body;

    // Validação básica
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já está em uso por outro usuário
    if (email !== user.email) {
      const existingUser = statements.getUserByEmail.get(email) as
        | { id: number }
        | undefined;

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: "Este email já está em uso" },
          { status: 400 }
        );
      }
    }

    // Se for alterar a senha, validar senha atual
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Senha atual é obrigatória para alterar a senha" },
          { status: 400 }
        );
      }

      const dbUser = statements.getUser.get(user.id) as
        | { password: string }
        | undefined;

      if (!dbUser) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }

      const bcrypt = await import("bcryptjs");
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        dbUser.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Senha atual incorreta" },
          { status: 400 }
        );
      }

      // Atualizar senha
      const hashedPassword = await hashPassword(newPassword);
      statements.updateUserPassword.run(hashedPassword, user.id);
    }

    // Atualizar dados do usuário
    statements.updateUser.run(name, email, profile_picture || null, user.id);

    // Buscar dados atualizados
    const updatedUser = statements.getUser.get(user.id) as {
      id: number;
      name: string;
      email: string;
      profile_picture: string | null;
    };

    // Atualizar cookie com novos dados
    await setAuthCookie({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile_picture: updatedUser.profile_picture,
    });

    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile_picture: updatedUser.profile_picture,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}
