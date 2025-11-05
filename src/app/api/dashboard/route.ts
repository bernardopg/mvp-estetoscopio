import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get authenticated user
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = authUser.id;

    // Get user info
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
      | { id: number; name: string; email: string; created_at: string }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Get total decks
    const deckCount = db
      .prepare("SELECT COUNT(*) as count FROM decks WHERE user_id = ?")
      .get(userId) as { count: number };

    // Get all decks to count total cards
    const decks = db
      .prepare("SELECT cards FROM decks WHERE user_id = ?")
      .all(userId) as { cards: string }[];

    let totalCards = 0;
    decks.forEach((deck) => {
      try {
        const cards = JSON.parse(deck.cards);
        totalCards += cards.length;
      } catch {
        // Skip invalid JSON
      }
    });

    // Get recent decks (last 5)
    const recentDecks = db
      .prepare(
        "SELECT id, title, created_at, updated_at FROM decks WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5"
      )
      .all(userId) as {
      id: number;
      title: string;
      created_at: string;
      updated_at: string;
    }[];

    // Calculate days since account creation
    let accountAge = 0;
    try {
      // O SQLite retorna datas no formato 'YYYY-MM-DD HH:MM:SS'
      // Adicionar 'Z' para forçar UTC ou tratar como horário local
      const createdDateStr = user.created_at.replace(" ", "T");
      const createdDate = new Date(createdDateStr);

      if (!isNaN(createdDate.getTime())) {
        const diffInMs = Date.now() - createdDate.getTime();
        accountAge = Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
      }
    } catch (e) {
      console.error("Erro ao calcular idade da conta:", e);
      accountAge = 0;
    }

    // Get deck with most cards
    let largestDeck = null;
    let maxCards = 0;
    decks.forEach((deck: { cards: string }) => {
      try {
        const cards = JSON.parse(deck.cards);
        if (cards.length > maxCards) {
          maxCards = cards.length;
        }
      } catch {
        // Skip invalid JSON
      }
    });

    // Get complete decks info for largest deck
    const allDecksInfo = db
      .prepare("SELECT id, title, cards FROM decks WHERE user_id = ?")
      .all(userId) as { id: number; title: string; cards: string }[];

    allDecksInfo.forEach((deck) => {
      try {
        const cards = JSON.parse(deck.cards);
        if (cards.length === maxCards && maxCards > 0) {
          largestDeck = {
            id: deck.id,
            title: deck.title,
            cardCount: maxCards,
          };
        }
      } catch {
        // Skip invalid JSON
      }
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        accountAge,
      },
      stats: {
        totalDecks: deckCount.count,
        totalCards,
        averageCardsPerDeck:
          deckCount.count > 0 ? Math.round(totalCards / deckCount.count) : 0,
        largestDeck,
      },
      recentDecks,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas do dashboard" },
      { status: 500 }
    );
  }
}
