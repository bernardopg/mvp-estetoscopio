"use client";

import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Library,
  Plus,
  Settings,
  Sparkles,
  Target,
  User,
  Zap,
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
    cardsStudiedToday: number;
    cardsStudiedWeek: number;
    streak: number;
    cardsDueToday: number;
    totalReviewed: number;
    matureCards: number;
    youngCards: number;
    newCards: number;
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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[var(--color-accent)] shadow-xl shadow-blue-500/30 mb-4">
            <GraduationCap className="w-12 h-12 text-white animate-pulse" />
          </div>
          <p className="text-[var(--color-text-muted)]">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header com perfil */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">
                Dashboard
              </h1>
              <p className="text-[var(--color-text-muted)]">
                Bem-vindo de volta, {dashboardData?.user.name}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/baralhos/criar"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Novo Baralho
              </Link>
            </div>
          </div>

          {/* Perfil Card */}
          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-[var(--color-accent)] shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                  {dashboardData?.user.name}
                </h2>
                <p className="text-[var(--color-text-muted)]">
                  {dashboardData?.user.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Conta criada há {dashboardData?.user.accountAge || 0} dias
                    </span>
                  </div>
                </div>
                <Link
                  href="/perfil"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[var(--color-text)] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
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
          {/* Cards devidos hoje */}
          <div className="p-6 rounded-xl bg-[var(--color-accent)] text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-white/20">
                <Target className="w-6 h-6" />
              </div>
              {(dashboardData?.stats.cardsDueToday || 0) > 0 && (
                <span className="px-2 py-1 rounded-full bg-white/30 text-xs font-bold animate-pulse">
                  PENDENTE
                </span>
              )}
            </div>
            <p className="text-4xl font-bold mb-1">
              {dashboardData?.stats.cardsDueToday || 0}
            </p>
            <p className="text-sm text-white/90">Cards para Revisar Hoje</p>
          </div>

          {/* Streak */}
          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-[var(--color-accent)]">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text)] mb-1">
              {dashboardData?.stats.streak || 0} dias
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Sequência de Estudo
            </p>
          </div>

          {/* Cards estudados hoje */}
          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text)] mb-1">
              {dashboardData?.stats.cardsStudiedToday || 0}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Estudados Hoje
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {dashboardData?.stats.cardsStudiedWeek || 0} esta semana
            </p>
          </div>

          {/* Total de cards */}
          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                <Library className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text)] mb-1">
              {dashboardData?.stats.totalCards || 0}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Total de Cards
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {dashboardData?.stats.totalDecks || 0} baralhos
            </p>
          </div>
        </div>

        {/* Estatísticas de revisão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/50">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)]">
                Cards Maduros
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {dashboardData?.stats.matureCards || 0}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Revisados 2+ vezes
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/50">
                <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)]">
                Cards Jovens
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {dashboardData?.stats.youngCards || 0}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Revisado 1 vez
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-[var(--color-text)]">
                Cards Novos
              </h3>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {dashboardData?.stats.newCards || 0}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Nunca revisados
            </p>
          </div>
        </div>

        {/* Grid de conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Baralhos recentes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
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
                      href={`/baralhos/estudar?id=${deck.id}`}
                      className="block p-4 rounded-lg border border-[var(--color-border)] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                            <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--color-text)]">
                              {deck.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
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
                        <div className="text-sm text-[var(--color-text-muted)]">
                          <span>Estudar →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Library className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                  <p className="text-[var(--color-text-muted)] mb-4">
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
              <div className="p-6 rounded-xl bg-[var(--color-accent)] text-white shadow-lg">
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
                  href={`/baralhos/estudar?id=${dashboardData.stats.largestDeck.id}`}
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
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
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
                    <p className="font-medium text-[var(--color-text)]">
                      Criar Baralho
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
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
                    <p className="font-medium text-[var(--color-text)]">
                      Meus Baralhos
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
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
                    <p className="font-medium text-[var(--color-text)]">
                      Flashcards
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Ver exemplos
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Dica do dia */}
            <div className="p-6 rounded-xl bg-[var(--color-accent)] text-white shadow-lg">
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
            <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                Seu Progresso
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--color-text-muted)]">
                      Cards Criados
                    </span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {dashboardData?.stats.totalCards || 0}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-[var(--color-accent)] h-2 rounded-full"
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
                    <span className="text-[var(--color-text-muted)]">
                      Baralhos Criados
                    </span>
                    <span className="font-semibold text-[var(--color-text)]">
                      {dashboardData?.stats.totalDecks || 0}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-[var(--color-accent)] h-2 rounded-full"
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
