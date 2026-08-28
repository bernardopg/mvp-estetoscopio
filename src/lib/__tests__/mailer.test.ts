/**
 * Testes do serviço de email (SMTP).
 * nodemailer é mockado — nenhum email real é enviado.
 */
const sendMailMock = jest.fn().mockResolvedValue({ messageId: "test-id" });
const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));

jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: (...args: unknown[]) => createTransportMock(...(args as [])) },
}));

const ORIGINAL_ENV = process.env;

/** Recarrega o módulo com as variáveis de ambiente atuais. */
async function loadMailer() {
  let mod!: typeof import("@/lib/mailer");
  await jest.isolateModulesAsync(async () => {
    mod = await import("@/lib/mailer");
  });
  return mod;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("isEmailConfigured", () => {
  it("retorna false sem variáveis SMTP", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const { isEmailConfigured } = await loadMailer();
    expect(isEmailConfigured()).toBe(false);
  });

  it("retorna false com configuração incompleta", async () => {
    process.env.SMTP_HOST = "smtp.exemplo.com";
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const { isEmailConfigured } = await loadMailer();
    expect(isEmailConfigured()).toBe(false);
  });

  it("retorna true com host, user e pass definidos", async () => {
    process.env.SMTP_HOST = "smtp.exemplo.com";
    process.env.SMTP_USER = "usuario";
    process.env.SMTP_PASS = "senha";

    const { isEmailConfigured } = await loadMailer();
    expect(isEmailConfigured()).toBe(true);
  });
});

describe("sendPasswordResetEmail", () => {
  const resetLink = "https://app.exemplo.com/redefinir-senha?token=abc123";

  beforeEach(() => {
    process.env.SMTP_HOST = "smtp.exemplo.com";
    process.env.SMTP_USER = "usuario";
    process.env.SMTP_PASS = "senha";
    process.env.SMTP_FROM = "MVP <no-reply@exemplo.com>";
  });

  it("envia email com destinatário, assunto e link corretos", async () => {
    const { sendPasswordResetEmail } = await loadMailer();

    await sendPasswordResetEmail({
      to: "maria@exemplo.com",
      name: "Maria",
      resetLink,
    });

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const message = sendMailMock.mock.calls[0][0];

    expect(message.to).toBe("maria@exemplo.com");
    expect(message.from).toBe("MVP <no-reply@exemplo.com>");
    expect(message.subject).toContain("Recuperação de Senha");
    expect(message.html).toContain(resetLink);
    expect(message.text).toContain(resetLink);
  });

  it("inclui versão texto plano além do HTML (acessibilidade/antispam)", async () => {
    const { sendPasswordResetEmail } = await loadMailer();
    await sendPasswordResetEmail({ to: "a@b.com", name: "Ana", resetLink });

    const message = sendMailMock.mock.calls[0][0];
    expect(typeof message.text).toBe("string");
    expect(message.text.length).toBeGreaterThan(0);
    expect(message.html).toContain("<!DOCTYPE html>");
  });

  it("escapa HTML no nome do usuário (previne injeção no template)", async () => {
    const { sendPasswordResetEmail } = await loadMailer();

    await sendPasswordResetEmail({
      to: "eve@exemplo.com",
      name: '<script>alert("xss")</script>',
      resetLink,
    });

    const message = sendMailMock.mock.calls[0][0];
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
  });

  it("usa a porta 465 como conexão segura", async () => {
    process.env.SMTP_PORT = "465";
    const { sendPasswordResetEmail } = await loadMailer();
    await sendPasswordResetEmail({ to: "a@b.com", name: "Ana", resetLink });

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true })
    );
  });

  it("usa conexão não-secure em portas diferentes de 465 (STARTTLS)", async () => {
    process.env.SMTP_PORT = "587";
    const { sendPasswordResetEmail } = await loadMailer();
    await sendPasswordResetEmail({ to: "a@b.com", name: "Ana", resetLink });

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false })
    );
  });
});
