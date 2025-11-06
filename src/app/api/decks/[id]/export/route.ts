import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/decks/[id]/export
 * Exporta um deck completo em formato JSON
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const deckId = parseInt(id, 10);

    if (isNaN(deckId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Buscar deck
    const deck = statements.getDeck.get(deckId, user.id) as
      | {
          id: number;
          user_id: number;
          title: string;
          cards: string;
          category?: string;
          folder_id?: number;
          color?: string;
          icon?: string;
          is_bookmarked: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;

    if (!deck) {
      return NextResponse.json(
        { error: "Deck não encontrado" },
        { status: 404 }
      );
    }

    // Buscar tags
    const tags = statements.getDeckTags.all(deckId) as Array<{
      tag_id: number;
      tag_name: string;
      tag_color?: string;
    }>;

    // Buscar progresso
    const progress = statements.getDeckProgress.get(deckId, user.id) as
      | {
          cards_completed: number;
          total_cards: number;
          average_difficulty: number;
          last_studied_at?: string;
          marked_for_review: number;
          completed: number;
          study_sessions: number;
        }
      | undefined;

    // Parsear cards
    const cards = JSON.parse(deck.cards);

    // Montar objeto de exportação
    const exportData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      deck: {
        title: deck.title,
        category: deck.category,
        color: deck.color,
        icon: deck.icon,
        is_bookmarked: deck.is_bookmarked === 1,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
      },
      cards,
      tags: tags.map((t) => ({
        name: t.tag_name,
        color: t.tag_color,
      })),
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

    // Retornar JSON com header para download
    const filename = `${deck.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar deck:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
