"use client";

import { ArrowLeft, Globe, Lock, Palette } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import { useState } from "react";

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

const ICONS = [
  "🏛️",
  "📚",
  "🎓",
  "💡",
  "🚀",
  "🌟",
  "🎯",
  "🔬",
  "🎨",
  "🎵",
  "⚡",
  "🌈",
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
    color: COLORS[0],
    icon: ICONS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("warning", "O nome da comunidade é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/comunidades/detalhe?id=${data.community.id}`);
      } else {
        showToast("error", "Erro ao criar comunidade", data.error);
      }
    } catch (error) {
      console.error("Erro ao criar comunidade:", error);
      showToast("error", "Erro ao criar comunidade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/comunidades"
            className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-zinc-900 dark:hover:text-zinc-50 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Comunidades
          </Link>
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">
            Criar Nova Comunidade
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Crie uma comunidade para compartilhar baralhos com outros usuários
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card principal */}
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            {/* Nome */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Nome da Comunidade *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Estudantes de Medicina"
                maxLength={100}
                className="w-full px-4 py-2 bg-[var(--color-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--color-text)] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {formData.name.length}/100 caracteres
              </p>
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o propósito da comunidade..."
                rows={4}
                className="w-full px-4 py-2 bg-[var(--color-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--color-text)] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Privacidade */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Privacidade
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!formData.is_private}
                    onChange={() =>
                      setFormData({ ...formData, is_private: false })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-[var(--color-text)]">
                        Pública
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Qualquer pessoa pode ver e entrar na comunidade
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <input
                    type="radio"
                    name="privacy"
                    checked={formData.is_private}
                    onChange={() =>
                      setFormData({ ...formData, is_private: true })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-zinc-500" />
                      <span className="font-medium text-[var(--color-text)]">
                        Privada
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Apenas membros convidados podem acessar
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Ícone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Ícone
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-full aspect-square flex items-center justify-center text-2xl rounded-lg border-2 transition-all ${
                      formData.icon === icon
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                <Palette className="w-4 h-4 inline-block mr-2" />
                Cor
              </label>
              <div className="grid grid-cols-7 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? "border-zinc-900 dark:border-zinc-50 scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Selecionar cor ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
              Pré-visualização
            </h3>
            <div className="border border-[var(--color-border)] rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl text-white shrink-0"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[var(--color-text)] mb-1">
                    {formData.name || "Nome da Comunidade"}
                  </h4>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {formData.description || "Descrição da comunidade..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-[var(--color-surface)] text-[var(--color-text)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando..." : "Criar Comunidade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
