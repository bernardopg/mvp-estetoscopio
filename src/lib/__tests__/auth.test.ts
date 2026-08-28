/**
 * Testes unitários de autenticação (JWT + senhas).
 *
 * O módulo auth.ts importa next/headers (cookies) — mockado abaixo pois
 * os testes cobrem apenas as funções puras de token e hash.
 */
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

import {
  comparePassword,
  generateToken,
  hashPassword,
  verifyToken,
  type UserPayload,
} from "@/lib/auth";

const sampleUser: UserPayload = {
  id: 1,
  name: "Maria da Silva",
  email: "maria@exemplo.com",
};

// verifyToken loga o erro por design; silenciamos para manter a saída limpa.
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("generateToken / verifyToken", () => {
  it("gera um JWT que verifica de volta com o mesmo payload", () => {
    const token = generateToken(sampleUser);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // header.payload.signature

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.id).toBe(sampleUser.id);
    expect(payload!.name).toBe(sampleUser.name);
    expect(payload!.email).toBe(sampleUser.email);
  });

  it("rejeita token com assinatura inválida", () => {
    const [header, payload] = generateToken(sampleUser).split(".");
    expect(verifyToken(`${header}.${payload}.assinatura-invalida`)).toBeNull();
  });

  it("rejeita token com payload adulterado (escalação de privilégio)", () => {
    const [header, , signature] = generateToken(sampleUser).split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({
        id: 999,
        name: "Invasor",
        email: "invasor@exemplo.com",
      })
    ).toString("base64url");

    expect(verifyToken(`${header}.${forgedPayload}.${signature}`)).toBeNull();
  });

  it("rejeita token arbitrário", () => {
    expect(verifyToken("token-invalido")).toBeNull();
    expect(verifyToken("")).toBeNull();
  });
});

describe("hashPassword / comparePassword", () => {
  it("gera hash bcrypt verificável", async () => {
    const password = "Senh@Forte123!";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/); // formato bcrypt
    expect(await comparePassword(password, hash)).toBe(true);
  });

  it("rejeita senha incorreta", async () => {
    const hash = await hashPassword("Senh@Forte123!");
    expect(await comparePassword("senha-errada", hash)).toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt único)", async () => {
    const h1 = await hashPassword("mesma-senha");
    const h2 = await hashPassword("mesma-senha");
    expect(h1).not.toBe(h2);
    expect(await comparePassword("mesma-senha", h2)).toBe(true);
  });
});
