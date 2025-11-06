import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import {
  processCardReview,
  type CardReview,
  type DifficultyLevel,
} from "@/lib/spaced-repetition";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface ReviewRequest {
  cardId: string;
  difficulty: DifficultyLevel;
}

/**
 * POST /api/decks/[id]/review
 *
 * Registra uma revisão de card usando o algoritmo SM-2
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const deckId = parseInt(params.id);
    if (isNaN(deckId)) {
      return NextResponse.json(
        { error: "ID de baralho inválido" },
        { status: 400 }
      );
    }

    // Verificar se o deck existe e pertence ao usuário
    const deck = statements.getDeck.get(deckId, user.id) as
      | { id: number; user_id: number }
      | undefined;

    if (!deck) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    const body: ReviewRequest = await request.json();
    const { cardId, difficulty } = body;

    if (!cardId || !difficulty) {
      return NextResponse.json(
        { error: "cardId e difficulty são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["again", "hard", "good", "easy"].includes(difficulty)) {
      return NextResponse.json(
        { error: "difficulty deve ser: again, hard, good ou easy" },
        { status: 400 }
      );
    }

    // Buscar a última revisão deste card
    const lastReview = statements.getLatestCardReview.get(
      user.id,
      deckId,
      cardId
    ) as
      | {
          quality: number;
          ease_factor: number;
          interval: number;
          repetitions: number;
          next_review_date: string;
          difficulty: DifficultyLevel;
        }
      | undefined;

    // Processar revisão usando SM-2
    const currentReview: CardReview | undefined = lastReview
      ? {
          cardId,
          quality: lastReview.quality,
          easeFactor: lastReview.ease_factor,
          interval: lastReview.interval,
          repetitions: lastReview.repetitions,
          nextReviewDate: lastReview.next_review_date,
          lastReviewed: new Date().toISOString(),
          difficulty: lastReview.difficulty,
        }
      : undefined;

    const newReview = processCardReview(cardId, difficulty, currentReview);

    // Salvar no banco de dados
    statements.createCardReview.run(
      user.id,
      deckId,
      newReview.cardId,
      newReview.quality,
      newReview.easeFactor,
      newReview.interval,
      newReview.repetitions,
      newReview.nextReviewDate.split("T")[0], // Apenas a data
      newReview.difficulty
    );

    return NextResponse.json({
      success: true,
      review: newReview,
      message: `Card revisado! Próxima revisão em ${newReview.interval} ${
        newReview.interval === 1 ? "dia" : "dias"
      }`,
    });
  } catch (error) {
    console.error("Erro ao processar revisão:", error);
    return NextResponse.json(
      { error: "Erro ao processar revisão" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/decks/[id]/review
 *
 * Busca estatísticas de revisão e cards devidos
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const deckId = parseInt(params.id);
    if (isNaN(deckId)) {
      return NextResponse.json(
        { error: "ID de baralho inválido" },
        { status: 400 }
      );
    }

    // Verificar se o deck existe e pertence ao usuário
    const deck = statements.getDeck.get(deckId, user.id) as
      | { id: number; user_id: number; cards: string }
      | undefined;

    if (!deck) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    // Parsear cards
    const cards = JSON.parse(deck.cards) as Array<{ id: string }>;
    const totalCards = cards.length;

    // Buscar cards devidos
    const dueCards = statements.getDueCards.all(user.id, deckId) as Array<{
      card_id: string;
      next_review_date: string;
    }>;

    // Buscar estatísticas
    const stats = statements.getCardReviewStats.get(
      user.id,
      deckId,
      user.id,
      deckId
    ) as
      | {
          total_cards: number;
          avg_ease_factor: number;
          avg_interval: number;
          mature_cards: number;
          young_cards: number;
          new_cards: number;
        }
      | undefined;

    const reviewedCardsCount = stats?.total_cards || 0;
    const newCardsCount = totalCards - reviewedCardsCount;

    return NextResponse.json({
      deckId,
      totalCards,
      dueCards: {
        count: dueCards.length,
        cards: dueCards.map((c) => c.card_id),
      },
      stats: {
        reviewed: reviewedCardsCount,
        new: newCardsCount,
        mature: stats?.mature_cards || 0,
        young: stats?.young_cards || 0,
        avgEaseFactor: stats?.avg_ease_factor
          ? Math.round(stats.avg_ease_factor * 100) / 100
          : 2.5,
        avgInterval: Math.round(stats?.avg_interval || 0),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar informações de revisão:", error);
    return NextResponse.json(
      { error: "Erro ao buscar informações de revisão" },
      { status: 500 }
    );
  }
}
