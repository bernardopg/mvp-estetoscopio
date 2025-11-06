import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Usuário padrão (ID 1)
const DEFAULT_USER_ID = 1;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      console.error("ID inválido recebido:", idParam);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const deck = statements.getDeck.get(id, DEFAULT_USER_ID);
    if (!deck) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error("Erro ao buscar baralho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      console.error("ID inválido recebido no PUT:", idParam);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const {
      title,
      cards,
      category,
      folder_id,
      tags,
      is_bookmarked,
      color,
      icon,
    } = await request.json();
    if (!title || !Array.isArray(cards)) {
      console.error("Dados inválidos no PUT:", { title, cards });
      return NextResponse.json(
        { error: "Título e cartas são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar o deck com todos os campos
    const result = statements.updateDeck.run(
      title,
      JSON.stringify(cards),
      category || null,
      folder_id || null,
      color || null,
      icon || null,
      is_bookmarked ? 1 : 0,
      id,
      DEFAULT_USER_ID
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar tags: remover todas e adicionar as novas
    if (Array.isArray(tags)) {
      // Buscar tags atuais
      const currentTags = statements.getDeckTags.all(id) as Array<{
        id: number;
      }>;

      // Remover tags antigas
      for (const tag of currentTags) {
        statements.removeTagFromDeck.run(id, tag.id);
      }

      // Adicionar novas tags
      for (const tagId of tags) {
        try {
          statements.addTagToDeck.run(id, tagId);
        } catch (error) {
          console.error(`Erro ao adicionar tag ${tagId} ao deck:`, error);
        }
      }
    }

    const updatedDeck = statements.getDeck.get(id, DEFAULT_USER_ID);
    return NextResponse.json(updatedDeck);
  } catch (error) {
    console.error("Erro ao atualizar baralho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      console.error("ID inválido recebido no DELETE:", idParam);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const result = statements.deleteDeck.run(id, DEFAULT_USER_ID);
    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Baralho deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar baralho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
