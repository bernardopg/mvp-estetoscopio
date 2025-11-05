import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Usuário padrão (ID 1)
const DEFAULT_USER_ID = 1;

export async function GET() {
  try {
    const decks = statements.getDecks.all(DEFAULT_USER_ID) as {
      id: number;
      title: string;
      cards: string;
      category: string | null;
      created_at: string;
      updated_at: string;
    }[];

    // Buscar progresso de cada deck
    const decksWithProgress = decks.map((deck) => {
      const progress = statements.getDeckProgress.get(
        deck.id,
        DEFAULT_USER_ID
      ) as
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

      return {
        ...deck,
        progress: progress
          ? {
              cards_completed: progress.cards_completed,
              total_cards: progress.total_cards,
              average_difficulty: progress.average_difficulty,
              last_studied_at: progress.last_studied_at,
              marked_for_review: progress.marked_for_review === 1,
              completed: progress.completed === 1,
              study_sessions: progress.study_sessions,
            }
          : null,
      };
    });

    return NextResponse.json(decksWithProgress);
  } catch (error) {
    console.error("Erro ao buscar baralhos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, cards, category } = await request.json();

    if (!title || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: "Título e cartas são obrigatórios" },
        { status: 400 }
      );
    }

    const result = statements.createDeck.run(
      DEFAULT_USER_ID,
      title,
      JSON.stringify(cards),
      category || null
    );
    const deck = statements.getDeck.get(
      result.lastInsertRowid,
      DEFAULT_USER_ID
    );

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar baralho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
