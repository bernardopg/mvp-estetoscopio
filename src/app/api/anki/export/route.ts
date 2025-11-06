import { AnkiExporter } from "@/lib/anki-export";
import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface CardContent {
  type: "text" | "image" | "audio";
  content: string;
  text?: string;
}

interface Card {
  id?: string;
  frente: CardContent;
  verso: CardContent;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { deckId, flashcardIds } = data;

    if (!deckId || !flashcardIds || flashcardIds.length === 0) {
      return NextResponse.json(
        { error: "Deck ID e flashcard IDs são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar deck do banco de dados
    const deck = statements.getDeck.get(deckId, user.id) as
      | { id: number; title: string; cards: string }
      | undefined;

    if (!deck) {
      return NextResponse.json(
        { error: "Deck não encontrado" },
        { status: 404 }
      );
    }

    // Parsear cards do deck
    const allCards: Card[] = JSON.parse(deck.cards);

    // Filtrar apenas os cards solicitados
    const selectedCards = allCards.filter((card, index) => {
      const cardId = card.id || index.toString();
      return flashcardIds.includes(cardId);
    });

    if (selectedCards.length === 0) {
      return NextResponse.json(
        { error: "Nenhum flashcard encontrado com os IDs fornecidos" },
        { status: 404 }
      );
    }

    // Converter para o formato esperado pelo AnkiExporter
    const flashcardsForExport = selectedCards.map((card, index) => {
      const cardId = card.id || index.toString();

      // Extrair conteúdo baseado no tipo
      const getFrontContent = (): string => {
        if (card.frente.type === "text") {
          return card.frente.content;
        } else if (card.frente.type === "image") {
          return `<img src="${card.frente.content}" />${
            card.frente.text ? `<br><br>${card.frente.text}` : ""
          }`;
        } else if (card.frente.type === "audio") {
          return `[sound:${card.frente.content}]${
            card.frente.text ? `<br><br>${card.frente.text}` : ""
          }`;
        }
        return card.frente.content;
      };

      const getBackContent = (): string => {
        if (card.verso.type === "text") {
          return card.verso.content;
        } else if (card.verso.type === "image") {
          return `<img src="${card.verso.content}" />${
            card.verso.text ? `<br><br>${card.verso.text}` : ""
          }`;
        } else if (card.verso.type === "audio") {
          return `[sound:${card.verso.content}]${
            card.verso.text ? `<br><br>${card.verso.text}` : ""
          }`;
        }
        return card.verso.content;
      };

      return {
        id: cardId,
        front: getFrontContent(),
        back: getBackContent(),
        tags: ["exportado"],
      };
    });

    const apkgBlob = await AnkiExporter.createApkg(
      flashcardsForExport,
      deck.title
    );

    // Criar nome de arquivo seguro (remover caracteres especiais)
    const safeFileName = deck.title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    return new NextResponse(apkgBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${
          safeFileName || `deck_${deckId}`
        }.apkg"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar deck:", error);
    return NextResponse.json(
      { error: "Erro ao exportar deck" },
      { status: 500 }
    );
  }
}
