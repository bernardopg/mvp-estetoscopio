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
      .prepare("SELECT id, cards FROM decks WHERE user_id = ?")
      .all(userId) as { id: number; cards: string }[];

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

    // Get complete decks info for largest deck
    const allDecksInfo = db
      .prepare("SELECT id, title, cards FROM decks WHERE user_id = ?")
      .all(userId) as { id: number; title: string; cards: string }[];

    allDecksInfo.forEach((deck) => {
      try {
        const cards = JSON.parse(deck.cards);
        if (cards.length > maxCards) {
          maxCards = cards.length;
          largestDeck = {
            id: deck.id,
            title: deck.title,
            cardCount: cards.length,
          };
        }
      } catch {
        // Skip invalid JSON
      }
    });

    // Get study sessions data
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const studySessions = db
      .prepare(
        "SELECT * FROM study_sessions WHERE user_id = ? AND session_date >= ? ORDER BY session_date DESC"
      )
      .all(userId, weekAgo) as Array<{
      cards_studied: number;
      session_date: string;
      time_spent: number;
    }>;

    const cardsStudiedToday = studySessions
      .filter((s) => s.session_date === today)
      .reduce((sum, s) => sum + s.cards_studied, 0);

    const cardsStudiedWeek = studySessions.reduce(
      (sum, s) => sum + s.cards_studied,
      0
    );

    // Calculate study streak
    const sessionDates = db
      .prepare(
        "SELECT DISTINCT session_date FROM study_sessions WHERE user_id = ? ORDER BY session_date DESC"
      )
      .all(userId) as Array<{ session_date: string }>;

    const uniqueDates = [
      ...new Set(sessionDates.map((row) => row.session_date)),
    ];

    let streak = 0;
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

    // Get cards due for review today
    const cardsDueToday = db
      .prepare(
        `SELECT COUNT(DISTINCT card_id) as count
         FROM card_reviews
         WHERE user_id = ? AND next_review_date <= date('now')`
      )
      .get(userId) as { count: number } | undefined;

    // Get review stats
    const reviewStats = db
      .prepare(
        `SELECT
          COUNT(DISTINCT card_id) as total_reviewed,
          SUM(CASE WHEN repetitions >= 2 THEN 1 ELSE 0 END) as mature_cards,
          SUM(CASE WHEN repetitions = 1 THEN 1 ELSE 0 END) as young_cards
        FROM (
          SELECT card_id, repetitions
          FROM card_reviews
          WHERE user_id = ?
          AND id IN (
            SELECT MAX(id) FROM card_reviews
            WHERE user_id = ?
            GROUP BY card_id
          )
        )`
      )
      .get(userId, userId) as
      | { total_reviewed: number; mature_cards: number; young_cards: number }
      | undefined;

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
        cardsStudiedToday,
        cardsStudiedWeek,
        streak,
        cardsDueToday: cardsDueToday?.count || 0,
        totalReviewed: reviewStats?.total_reviewed || 0,
        matureCards: reviewStats?.mature_cards || 0,
        youngCards: reviewStats?.young_cards || 0,
        newCards: totalCards - (reviewStats?.total_reviewed || 0),
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
