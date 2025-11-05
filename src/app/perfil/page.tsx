"use client";

import StatsCard from "@/components/StatsCard";
import StatsCharts from "@/components/StatsCharts";
import {
  BarChart3,
  BookOpen,
  Camera,
  CreditCard,
  Flame,
  Loader2,
  Save,
  Settings,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type TabType = "profile" | "stats";

interface Stats {
  overview: {
    totalDecks: number;
    totalFlashcards: number;
    cardsStudiedToday: number;
    cardsStudiedWeek: number;
    cardsStudiedMonth: number;
    streak: number;
    retentionRate: number;
  };
  difficulty: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  performance: {
    averageStudyTime: number;
    totalStudySessions: number;
    totalTimeSpent: number;
  };
  weeklyData: Array<{
    date: string;
    day: string;
    cardsStudied: number;
    timeSpent: number;
  }>;
}

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profile_picture: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar perfil");
      }

      const data = await response.json();
      setFormData({
        name: data.name,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profile_picture: data.profile_picture || "",
      });
      setAvatarPreview(data.profile_picture || "");
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setError("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("/api/profile/stats");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar estatísticas");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === "stats" && !stats) {
      fetchStats();
    }
  }, [activeTab, stats, fetchStats]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
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

    setUploadingAvatar(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload da imagem");
      }

      // Atualizar preview e form data
      setAvatarPreview(data.url);
      setFormData((prev) => ({ ...prev, profile_picture: data.url }));
      setSuccess("Foto de perfil atualizada com sucesso!");

      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload da imagem"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    if (!formData.profile_picture) return;

    setUploadingAvatar(true);
    setError("");

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao remover foto");
      }

      setAvatarPreview("");
      setFormData((prev) => ({ ...prev, profile_picture: "" }));
      setSuccess("Foto de perfil removida com sucesso!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao remover foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validação de senha
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError("A nova senha deve ter no mínimo 6 caracteres");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("As senhas não coincidem");
        return;
      }

      if (!formData.currentPassword) {
        setError("Digite sua senha atual para alterar a senha");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          profile_picture: formData.profile_picture,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar perfil");
      }

      setSuccess("Perfil atualizado com sucesso!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Atualizar dados do perfil
      await fetchProfile();

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao atualizar perfil"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={formData.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Alterar foto"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={uploadingAvatar}
                    className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remover foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Meu Perfil</h1>
                <p className="text-blue-100">
                  Gerencie suas informações e acompanhe seu progresso
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-0">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === "profile"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Settings className="w-5 h-5" />
                Configurações
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === "stats"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Estatísticas
              </button>
            </div>
          </div>

          {/* Tab Content - Profile */}
          {activeTab === "profile" && (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Informações Básicas */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Informações Básicas
                </h2>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Alterar Senha */}
              <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Alterar Senha
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Deixe em branco se não quiser alterar a senha
                </p>

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    minLength={6}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Botão de Salvar */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab Content - Stats */}
          {activeTab === "stats" && (
            <div className="p-8 space-y-8">
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : stats ? (
                <>
                  {/* Estatísticas Overview */}
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                      Visão Geral
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatsCard
                        title="Total de Baralhos"
                        value={stats.overview.totalDecks}
                        icon={BookOpen}
                        color="blue"
                      />
                      <StatsCard
                        title="Total de Flashcards"
                        value={stats.overview.totalFlashcards}
                        icon={CreditCard}
                        color="purple"
                      />
                      <StatsCard
                        title="Estudados Hoje"
                        value={stats.overview.cardsStudiedToday}
                        icon={TrendingUp}
                        description={`${stats.overview.cardsStudiedWeek} esta semana`}
                        color="green"
                      />
                      <StatsCard
                        title="Sequência (Streak)"
                        value={`${stats.overview.streak} dias`}
                        icon={Flame}
                        description="Continue assim!"
                        color="orange"
                      />
                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                      Desempenho
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                          Tempo Médio de Estudo
                        </p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                          {stats.performance.averageStudyTime} min
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          Por sessão
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                          Total de Sessões
                        </p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                          {stats.performance.totalStudySessions}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          Sessões completadas
                        </p>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                          Taxa de Retenção
                        </p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                          {stats.overview.retentionRate}%
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          Cards com progresso
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gráficos */}
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                      Gráficos e Análises
                    </h2>
                    <StatsCharts
                      weeklyData={stats.weeklyData}
                      difficultyData={stats.difficulty}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Nenhuma estatística disponível ainda. Comece a estudar para
                    ver seus dados aqui!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
