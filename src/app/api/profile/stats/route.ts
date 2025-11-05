import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextResponse } from "next/server";

interface Deck {
  id: number;
  user_id: number;
  title: string;
  cards: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

interface StudySession {
  id: number;
  user_id: number;
  deck_id: number;
  cards_studied: number;
  cards_again: number;
  cards_hard: number;
  cards_good: number;
  cards_easy: number;
  time_spent: number;
  session_date: string;
  created_at: string;
}

interface Card {
  id: string;
  progress?: {
    reviews: number;
    lastReview: string;
    nextReview: string;
    difficulty: "again" | "hard" | "good" | "easy";
  };
}

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os baralhos do usuário
    const decks = statements.getDecks.all(user.id) as Deck[];

    // Calcular total de flashcards
    let totalFlashcards = 0;
    decks.forEach((deck) => {
      try {
        const cards = JSON.parse(deck.cards);
        totalFlashcards += Array.isArray(cards) ? cards.length : 0;
      } catch (error) {
        console.error(`Erro ao parsear cards do deck ${deck.id}:`, error);
      }
    });

    // Buscar sessões de estudo
    const allSessions = statements.getStudySessionsByUser.all(
      user.id
    ) as StudySession[];

    // Calcular estatísticas de tempo
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const sessionsToday = allSessions.filter((s) => s.session_date === today);
    const sessionsWeek = allSessions.filter((s) => s.session_date >= weekAgo);
    const sessionsMonth = allSessions.filter((s) => s.session_date >= monthAgo);

    const cardsStudiedToday = sessionsToday.reduce(
      (sum, s) => sum + s.cards_studied,
      0
    );
    const cardsStudiedWeek = sessionsWeek.reduce(
      (sum, s) => sum + s.cards_studied,
      0
    );
    const cardsStudiedMonth = sessionsMonth.reduce(
      (sum, s) => sum + s.cards_studied,
      0
    );

    // Calcular streak (sequência de dias estudando)
    let streak = 0;
    const uniqueDates = [
      ...new Set(allSessions.map((s) => s.session_date)),
    ].sort((a, b) => b.localeCompare(a));

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateStr of uniqueDates) {
      const sessionDate = new Date(dateStr);
      sessionDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - sessionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate = sessionDate;
      } else if (diffDays > streak) {
        break;
      }
    }

    // Calcular distribuição de dificuldade
    const totalDifficulty = {
      again: allSessions.reduce((sum, s) => sum + s.cards_again, 0),
      hard: allSessions.reduce((sum, s) => sum + s.cards_hard, 0),
      good: allSessions.reduce((sum, s) => sum + s.cards_good, 0),
      easy: allSessions.reduce((sum, s) => sum + s.cards_easy, 0),
    };

    // Calcular tempo médio de estudo (em minutos)
    const totalTimeSpent = allSessions.reduce(
      (sum, s) => sum + s.time_spent,
      0
    );
    const averageStudyTime =
      allSessions.length > 0 ? totalTimeSpent / allSessions.length / 60 : 0;

    // Preparar dados para gráfico semanal (últimos 7 dias)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const daySessions = allSessions.filter((s) => s.session_date === dateStr);

      weeklyData.push({
        date: dateStr,
        day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
        cardsStudied: daySessions.reduce((sum, s) => sum + s.cards_studied, 0),
        timeSpent: Math.round(
          daySessions.reduce((sum, s) => sum + s.time_spent, 0) / 60
        ), // em minutos
      });
    }

    // Calcular taxa de retenção (cards com progress)
    let cardsWithProgress = 0;
    decks.forEach((deck) => {
      try {
        const cards = JSON.parse(deck.cards) as Card[];
        cardsWithProgress += cards.filter((card) => card.progress).length;
      } catch (error) {
        console.error(`Erro ao parsear cards do deck ${deck.id}:`, error);
      }
    });

    const retentionRate =
      totalFlashcards > 0
        ? Math.round((cardsWithProgress / totalFlashcards) * 100)
        : 0;

    return NextResponse.json({
      overview: {
        totalDecks: decks.length,
        totalFlashcards,
        cardsStudiedToday,
        cardsStudiedWeek,
        cardsStudiedMonth,
        streak,
        retentionRate,
      },
      difficulty: {
        again: totalDifficulty.again,
        hard: totalDifficulty.hard,
        good: totalDifficulty.good,
        easy: totalDifficulty.easy,
      },
      performance: {
        averageStudyTime: Math.round(averageStudyTime),
        totalStudySessions: allSessions.length,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // em minutos
      },
      weeklyData,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
