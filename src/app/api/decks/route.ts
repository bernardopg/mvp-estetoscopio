import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Usuário padrão (ID 1)
const DEFAULT_USER_ID = 1;

export async function GET() {
  try {
    const decks = statements.getDecks.all(DEFAULT_USER_ID);
    return NextResponse.json(decks);
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
    const { title, cards } = await request.json();

    if (!title || !Array.isArray(cards)) {
      return NextResponse.json(
        { error: "Título e cartas são obrigatórios" },
        { status: 400 }
      );
    }

    const result = statements.createDeck.run(
      DEFAULT_USER_ID,
      title,
      JSON.stringify(cards)
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
