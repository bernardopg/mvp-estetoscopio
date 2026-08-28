import { statements } from "@/lib/db";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validação básica
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário por email
    const user = statements.getUserByEmail.get(email) as
      | { id: number; name: string; email: string }
      | undefined;

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      return NextResponse.json({
        message:
          "Se o email existir em nossa base, você receberá um link de recuperação",
      });
    }

    // Gerar token único e seguro
    const token = crypto.randomBytes(32).toString("hex");

    // Token expira em 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Salvar token no banco
    statements.createPasswordResetToken.run(user.id, token, expiresAt);

    // Limpar tokens expirados
    statements.deleteExpiredTokens.run();

    const resetLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/redefinir-senha?token=${token}`;

    // Enviar email se o SMTP estiver configurado; caso contrário, apenas
    // registrar o link no log (modo desenvolvimento).
    if (isEmailConfigured()) {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetLink,
        });
      } catch (emailError) {
        // Não vazar detalhes do erro para o usuário (segurança);
        // registrar para diagnóstico do servidor.
        console.error("Erro ao enviar email de recuperação:", emailError);
      }
    } else {
      console.log("⚠️  SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS).");
      console.log("🔐 Link de recuperação de senha:", resetLink);
      console.log("📧 Email:", email);
      console.log("👤 Usuário:", user.name);
    }

    return NextResponse.json({
      message:
        "Se o email existir em nossa base, você receberá um link de recuperação",
      // Em desenvolvimento, incluímos o token na resposta
      ...(process.env.NODE_ENV === "development" && { token, resetLink }),
    });
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
