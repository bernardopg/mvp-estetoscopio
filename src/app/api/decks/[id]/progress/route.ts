import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const deckId = parseInt(id);

    const progress = statements.getDeckProgress.get(deckId, user.id) as
      | {
          cards_completed: number;
          total_cards: number;
          average_difficulty: number;
          last_studied_at: string | null;
          marked_for_review: number;
          completed: number;
          study_sessions: number;
        }
      | undefined;

    if (!progress) {
      return NextResponse.json({
        cards_completed: 0,
        total_cards: 0,
        average_difficulty: 0,
        last_studied_at: null,
        marked_for_review: false,
        completed: false,
        study_sessions: 0,
      });
    }

    return NextResponse.json({
      cards_completed: progress.cards_completed,
      total_cards: progress.total_cards,
      average_difficulty: progress.average_difficulty,
      last_studied_at: progress.last_studied_at,
      marked_for_review: progress.marked_for_review === 1,
      completed: progress.completed === 1,
      study_sessions: progress.study_sessions,
    });
  } catch (error) {
    console.error("Erro ao buscar progresso:", error);
    return NextResponse.json(
      { error: "Erro ao buscar progresso" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const deckId = parseInt(id);
    const body = await request.json();

    const {
      cards_completed,
      total_cards,
      average_difficulty,
      marked_for_review,
      completed,
    } = body;

    // Verificar se o deck pertence ao usuário
    const deck = statements.getDeck.get(deckId, user.id);
    if (!deck) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    // Buscar progresso existente
    const existingProgress = statements.getDeckProgress.get(deckId, user.id) as
      | { study_sessions: number }
      | undefined;

    const studySessions = existingProgress
      ? existingProgress.study_sessions + 1
      : 1;

    // Salvar progresso
    statements.createDeckProgress.run(
      deckId,
      user.id,
      cards_completed,
      total_cards,
      average_difficulty,
      new Date().toISOString(),
      marked_for_review ? 1 : 0,
      completed ? 1 : 0,
      studySessions
    );

    return NextResponse.json({
      message: "Progresso salvo com sucesso",
      study_sessions: studySessions,
    });
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return NextResponse.json(
      { error: "Erro ao salvar progresso" },
      { status: 500 }
    );
  }
}
