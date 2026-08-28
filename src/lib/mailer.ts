import nodemailer from "nodemailer";

/**
 * Serviço de envio de email (SMTP).
 *
 * Configuração via variáveis de ambiente:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *   NEXT_PUBLIC_APP_URL (URL base para links)
 *
 * Se as variáveis SMTP não estiverem definidas, o app roda em modo
 * "email desabilitado": os links (ex.: recuperação de senha) são
 * registrados no log do servidor em desenvolvimento.
 */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || "MVP Estetoscópio <no-reply@localhost>";

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER as string,
      pass: SMTP_PASS as string,
    },
  });
}

interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetLink: string;
}

/**
 * Envia o email de recuperação de senha com template HTML + texto plano.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: PasswordResetEmailParams): Promise<void> {
  const transporter = createTransporter();

  const subject = "Recuperação de Senha - MVP Estetoscópio";

  const text = [
    `Olá ${name},`,
    "",
    "Recebemos uma solicitação para redefinir a senha da sua conta.",
    "Clique no link abaixo para criar uma nova senha:",
    "",
    resetLink,
    "",
    "Este link expira em 1 hora e pode ser usado apenas uma vez.",
    "Se você não solicitou a redefinição, ignore este email — sua senha permanecerá a mesma.",
    "",
    "Atenciosamente,",
    "Equipe MVP Estetoscópio",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#18181b;padding:20px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;">🩺 MVP Estetoscópio</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">Recuperação de senha</h1>
                <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46;">
                  Olá <strong>${escapeHtml(name)}</strong>,
                </p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#3f3f46;">
                  Recebemos uma solicitação para redefinir a senha da sua conta.
                  Clique no botão abaixo para criar uma nova senha:
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <a href="${resetLink}"
                         style="display:inline-block;background-color:#3b82f6;color:#ffffff;text-decoration:none;
                                font-size:14px;font-weight:bold;padding:12px 32px;border-radius:8px;">
                        Redefinir senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#3f3f46;">
                  Ou copie e cole este link no navegador:
                </p>
                <p style="margin:0 0 24px;font-size:12px;word-break:break-all;color:#3b82f6;">
                  ${resetLink}
                </p>
                <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:#71717a;">
                  ⏱️ Este link expira em <strong>1 hora</strong> e pode ser usado apenas uma vez.
                </p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                  Se você não solicitou a redefinição, ignore este email — sua senha permanecerá a mesma.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#fafafa;padding:16px 32px;border-top:1px solid #e4e4e7;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;">
                  Este é um email automático. Por favor, não responda.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
}

/** Previne injeção de HTML no template. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
