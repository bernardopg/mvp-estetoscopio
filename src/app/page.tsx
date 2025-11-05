"use client";

import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Layers,
  Library,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  user: {
    name: string;
    email: string;
    accountAge: number;
  };
  stats: {
    totalDecks: number;
    totalCards: number;
    averageCardsPerDeck: number;
    largestDeck: {
      id: number;
      title: string;
      cardCount: number;
    } | null;
  };
  recentDecks: {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
  }[];
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar dashboard:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30 mb-4">
            <GraduationCap className="w-12 h-12 text-white animate-pulse" />
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header com perfil */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Dashboard
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Bem-vindo de volta, {dashboardData?.user.name}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/baralhos/criar"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Novo Baralho
              </Link>
            </div>
          </div>

          {/* Perfil Card */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-linear-to-br from-blue-500 to-purple-600 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {dashboardData?.user.name}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {dashboardData?.user.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Conta criada há {dashboardData?.user.accountAge || 0} dias
                    </span>
                  </div>
                </div>
                <Link
                  href="/perfil"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  title="Editar Perfil"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar Perfil</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                <Library className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {dashboardData?.stats.totalDecks || 0}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Baralhos Criados
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950/50">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {dashboardData?.stats.totalCards || 0}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Total de Cards
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {dashboardData?.stats.averageCardsPerDeck || 0}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Média de Cards/Baralho
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/50">
                <Layers className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {dashboardData?.stats.largestDeck?.cardCount || 0}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Maior Baralho
            </p>
          </div>
        </div>

        {/* Grid de conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Baralhos recentes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Baralhos Recentes
                </h2>
                <Link
                  href="/baralhos"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todos
                </Link>
              </div>

              {dashboardData?.recentDecks &&
              dashboardData.recentDecks.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentDecks.map((deck) => (
                    <Link
                      key={deck.id}
                      href={`/baralhos/${deck.id}/estudar`}
                      className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                            <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {deck.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                Atualizado{" "}
                                {new Date(deck.updated_at).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          <span>Estudar →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Library className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    Você ainda não tem baralhos
                  </p>
                  <Link
                    href="/baralhos/criar"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Criar seu primeiro baralho
                  </Link>
                </div>
              )}
            </div>

            {/* Maior baralho */}
            {dashboardData?.stats.largestDeck && (
              <div className="p-6 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Destaque do Mês</h2>
                </div>
                <p className="text-amber-100 mb-4">
                  Seu maior baralho tem{" "}
                  <span className="font-bold text-white">
                    {dashboardData.stats.largestDeck.cardCount} cards
                  </span>
                </p>
                <Link
                  href={`/baralhos/${dashboardData.stats.largestDeck.id}/estudar`}
                  className="inline-flex items-center gap-2 text-white font-medium hover:underline"
                >
                  {dashboardData.stats.largestDeck.title} →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar com ações rápidas */}
          <div className="space-y-6">
            {/* Ações rápidas */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Ações Rápidas
              </h2>
              <div className="space-y-3">
                <Link
                  href="/baralhos/criar"
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-blue-500">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Criar Baralho
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Adicione novos cards
                    </p>
                  </div>
                </Link>

                <Link
                  href="/baralhos"
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple-500">
                    <Library className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Meus Baralhos
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Gerencie seus cards
                    </p>
                  </div>
                </Link>

                <Link
                  href="/flashcards"
                  className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-emerald-500">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      Flashcards
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Ver exemplos
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Dica do dia */}
            <div className="p-6 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold">Dica de Estudo</h2>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                A repetição espaçada é a chave para a memorização de longo
                prazo. Revise seus cards regularmente!
              </p>
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <span>💡</span>
                <span>Estude um pouco todos os dias</span>
              </div>
            </div>

            {/* Progresso */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Seu Progresso
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Cards Criados
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {dashboardData?.stats.totalCards || 0}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((dashboardData?.stats.totalCards || 0) / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Baralhos Criados
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {dashboardData?.stats.totalDecks || 0}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((dashboardData?.stats.totalDecks || 0) / 20) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
