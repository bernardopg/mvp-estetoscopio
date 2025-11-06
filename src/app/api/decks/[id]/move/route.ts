import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Usuário padrão (ID 1)
const DEFAULT_USER_ID = 1;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const deckId = parseInt(idParam);

    if (isNaN(deckId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { folder_id } = await request.json();

    // folder_id pode ser null (mover para raiz) ou um número
    if (folder_id !== null && typeof folder_id !== "number") {
      return NextResponse.json(
        { error: "folder_id deve ser um número ou null" },
        { status: 400 }
      );
    }

    // Verificar se o deck existe e pertence ao usuário
    const deck = statements.getDeck.get(deckId, DEFAULT_USER_ID);
    if (!deck) {
      return NextResponse.json(
        { error: "Baralho não encontrado" },
        { status: 404 }
      );
    }

    // Se folder_id não é null, verificar se a pasta existe
    if (folder_id !== null) {
      const folder = statements.getFolder.get(folder_id, DEFAULT_USER_ID);
      if (!folder) {
        return NextResponse.json(
          { error: "Pasta não encontrada" },
          { status: 404 }
        );
      }
    }

    // Atualizar apenas o folder_id do deck
    const result = statements.moveDeck.run(folder_id, deckId, DEFAULT_USER_ID);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Erro ao mover baralho" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Baralho movido com sucesso",
      deck_id: deckId,
      folder_id: folder_id,
    });
  } catch (error) {
    console.error("Erro ao mover baralho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
