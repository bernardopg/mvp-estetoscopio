"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setResetLink("");

    if (!email) {
      setError("Digite seu email");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um email válido");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar solicitação");
      }

      setSuccess(true);

      // Em desenvolvimento, mostrar o link
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (error) {
      console.error("Erro:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao processar solicitação"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Esqueceu a senha?
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Digite seu email e enviaremos um link para redefinir sua senha
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  ✓ Se o email existir em nossa base, você receberá um link de
                  recuperação em breve.
                </p>
              </div>

              {resetLink && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-semibold mb-2">
                    🔧 Modo Desenvolvimento:
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mb-2">
                    Link de recuperação:
                  </p>
                  <a
                    href={resetLink}
                    className="text-blue-600 dark:text-blue-400 text-xs break-all hover:underline"
                  >
                    {resetLink}
                  </a>
                </div>
              )}

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Enviar link de recuperação
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
