"use client";

import { CheckCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token inválido ou ausente");
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      setSuccess(true);

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Erro:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao redefinir senha"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Token inválido
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              O link de recuperação é inválido ou está ausente.
            </p>
            <Link
              href="/esqueci-senha"
              className="inline-block py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Redefinir senha
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Digite sua nova senha abaixo
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Senha redefinida com sucesso!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Redirecionando para o login...
              </p>
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
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Digite a senha novamente"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Redefinir senha
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-6">
          Lembrou sua senha?{" "}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <RedefinirSenhaContent />
    </Suspense>
  );
}
