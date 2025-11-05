import { hashPassword } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validação básica
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar token válido no banco
    const resetToken = statements.getPasswordResetToken.get(token) as
      | {
          id: number;
          user_id: number;
          token: string;
          expires_at: string;
          used: number;
        }
      | undefined;

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha do usuário
    statements.updateUserPassword.run(hashedPassword, resetToken.user_id);

    // Marcar token como usado
    statements.markTokenAsUsed.run(token);

    // Limpar tokens expirados
    statements.deleteExpiredTokens.run();

    return NextResponse.json({
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}
