"use client";

import StatsCard from "@/components/StatsCard";
import StatsCharts from "@/components/StatsCharts";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  ExternalLink,
  Flame,
  Loader2,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HubUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  tier: string;
}

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

const HUB_PROFILE_URL = "https://scalpel.com.br/profile.php";

export default function PerfilPage() {
  const [user, setUser] = useState<HubUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me.php");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } finally {
        setLoadingUser(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch("/api/profile/stats.php");
        if (res.ok) {
          setStats(await res.json());
        }
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Resumo da conta — identidade é gerenciada no hub */}
        <section className="card flex items-center gap-5 p-6">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center overflow-hidden shrink-0">
            {loadingUser ? (
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
            ) : user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-[var(--color-accent)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-[var(--color-text)] truncate">
              {user?.name ?? "Carregando..."}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] truncate">
              {user?.email}
            </p>
          </div>
          <a
            href={HUB_PROFILE_URL}
            className="btn btn-ghost shrink-0"
          >
            Editar no Scalpel
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>
        <p className="text-sm text-[var(--color-text-muted)] -mt-2">
          Nome, email, senha e avatar são únicos para toda a sua conta Scalpel
          — edite em <a className="link" href={HUB_PROFILE_URL}>scalpel.com.br/profile.php</a>.
        </p>

        {/* Estatísticas de estudo — isso é específico deste app */}
        <section className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)] mb-6">
            <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
            Estatísticas
          </h2>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
            </div>
          ) : stats ? (
            <div className="space-y-8">
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
                  color="blue"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5">
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
                    Tempo Médio de Estudo
                  </p>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">
                    {stats.performance.averageStudyTime} min
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Por sessão</p>
                </div>
                <div className="card p-5">
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
                    Total de Sessões
                  </p>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">
                    {stats.performance.totalStudySessions}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Sessões completadas</p>
                </div>
                <div className="card p-5">
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
                    Taxa de Retenção
                  </p>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">
                    {stats.overview.retentionRate}%
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Cards com progresso</p>
                </div>
              </div>

              <StatsCharts
                weeklyData={stats.weeklyData}
                difficultyData={stats.difficulty}
              />
            </div>
          ) : (
            <p className="text-center py-12 text-[var(--color-text-muted)]">
              Nenhuma estatística disponível ainda. Comece a estudar para ver
              seus dados aqui!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
