"use client";

import { Eye, EyeOff, GraduationCap, Upload, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_picture: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de arquivo não permitido. Use JPEG, PNG ou WebP");
        return;
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("Arquivo muito grande. Máximo 5MB");
        return;
      }

      setAvatarFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Fazer upload do avatar primeiro, se existir
      let avatarUrl = "";
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: avatarFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Erro ao fazer upload da imagem");
        }

        const uploadData = await uploadResponse.json();
        avatarUrl = uploadData.url;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profile_picture: avatarUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      // Redirecionar para dashboard
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30 mb-6">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Criar Conta
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Comece sua jornada de aprendizado
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Senha */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Digite a senha novamente"
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

            {/* Foto de Perfil (opcional) */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Foto de Perfil (opcional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden relative border-2 border-zinc-300 dark:border-zinc-600">
                  {avatarPreview ? (
                    <>
                      <Image
                        src={avatarPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-0 right-0 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        aria-label="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <User className="w-8 h-8 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-zinc-50 dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    <Upload className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {avatarFile ? avatarFile.name : "Escolher arquivo"}
                    </span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    JPEG, PNG ou WebP. Máximo 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>

          {/* Link para Login */}
          <div className="text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Fazer Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
