import { getAuthUser } from "@/lib/auth";
import db, { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Interface para validação do JSON importado
interface ImportedDeck {
  version?: string;
  deck: {
    title: string;
    category?: string;
    color?: string;
    icon?: string;
    is_bookmarked?: boolean;
  };
  cards: Array<{
    id: string;
    front: {
      type: "text" | "image" | "audio";
      content: string;
      text?: string;
    };
    back: {
      type: "text" | "image" | "audio";
      content: string;
      text?: string;
    };
    progress?: unknown;
  }>;
  tags?: Array<{
    name: string;
    color?: string;
  }>;
}

/**
 * Valida o JSON importado
 */
function validateImportData(data: unknown): ImportedDeck {
  if (!data || typeof data !== "object") {
    throw new Error("Dados inválidos");
  }

  const importData = data as Partial<ImportedDeck>;

  // Validar deck
  if (!importData.deck || typeof importData.deck !== "object") {
    throw new Error("Dados do deck são obrigatórios");
  }

  if (!importData.deck.title || typeof importData.deck.title !== "string") {
    throw new Error("Título do deck é obrigatório");
  }

  // Validar cards
  if (!Array.isArray(importData.cards) || importData.cards.length === 0) {
    throw new Error("O deck deve conter pelo menos um card");
  }

  for (const card of importData.cards) {
    if (!card.id || !card.front || !card.back) {
      throw new Error("Card com estrutura inválida");
    }

    if (
      !["text", "image", "audio"].includes(card.front.type) ||
      !["text", "image", "audio"].includes(card.back.type)
    ) {
      throw new Error("Tipo de card inválido");
    }

    if (!card.front.content || !card.back.content) {
      throw new Error("Card sem conteúdo");
    }
  }

  return importData as ImportedDeck;
}

/**
 * POST /api/decks/import
 * Importa um deck de arquivo JSON
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar dados importados
    let importData: ImportedDeck;
    try {
      importData = validateImportData(body);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Dados inválidos",
        },
        { status: 400 }
      );
    }

    // Criar deck
    const deckResult = statements.createDeck.run(
      user.id,
      importData.deck.title,
      JSON.stringify(importData.cards)
    );

    const deckId = deckResult.lastInsertRowid as number;

    // Atualizar metadados do deck (cor, ícone, bookmark)
    if (
      importData.deck.color ||
      importData.deck.icon ||
      importData.deck.is_bookmarked
    ) {
      const updates: string[] = [];
      const params: (string | number)[] = [];

      if (importData.deck.color) {
        updates.push("color = ?");
        params.push(importData.deck.color);
      }

      if (importData.deck.icon) {
        updates.push("icon = ?");
        params.push(importData.deck.icon);
      }

      if (importData.deck.is_bookmarked) {
        updates.push("is_bookmarked = ?");
        params.push(importData.deck.is_bookmarked ? 1 : 0);
      }

      if (updates.length > 0) {
        params.push(deckId);
        db.prepare(`UPDATE decks SET ${updates.join(", ")} WHERE id = ?`).run(
          ...params
        );
      }
    }

    // Criar tags (se existirem)
    if (importData.tags && importData.tags.length > 0) {
      for (const tag of importData.tags) {
        // Verificar se tag já existe
        const existingTag = db
          .prepare(
            `
          SELECT id FROM tags WHERE user_id = ? AND name = ?
        `
          )
          .get(user.id, tag.name) as { id: number } | undefined;

        let tagId: number;

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Criar nova tag
          const tagResult = db
            .prepare(
              `
            INSERT INTO tags (user_id, name, color)
            VALUES (?, ?, ?)
          `
            )
            .run(user.id, tag.name, tag.color || null);
          tagId = tagResult.lastInsertRowid as number;
        }

        // Associar tag ao deck
        try {
          db.prepare(
            `
            INSERT INTO deck_tags (deck_id, tag_id)
            VALUES (?, ?)
          `
          ).run(deckId, tagId);
        } catch (error) {
          // Ignorar se já existe
          console.log("Tag já associada:", error);
        }
      }
    }

    // Buscar deck criado
    const createdDeck = statements.getDeck.get(deckId, user.id);

    return NextResponse.json(
      {
        message: "Deck importado com sucesso",
        deck: createdDeck,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao importar deck:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
