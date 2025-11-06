import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST /api/shared-decks/[id]/clone - Clonar um baralho compartilhado
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const sharedDeckId = parseInt(id);

    if (isNaN(sharedDeckId)) {
      return NextResponse.json(
        { error: "ID de baralho compartilhado inválido" },
        { status: 400 }
      );
    }

    const sharedDeck = statements.getSharedDeck.get(sharedDeckId) as
      | {
          deck_id: number;
          community_id: number;
          shared_by: number;
          permission: string;
        }
      | undefined;

    if (!sharedDeck) {
      return NextResponse.json(
        { error: "Baralho compartilhado não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissão de clone
    if (sharedDeck.permission !== "clone" && sharedDeck.permission !== "edit") {
      return NextResponse.json(
        { error: "Este baralho não permite clonagem" },
        { status: 403 }
      );
    }

    // Verificar se é membro da comunidade
    const membership = statements.getCommunityMember.get(
      sharedDeck.community_id,
      user.id
    );

    if (!membership) {
      return NextResponse.json(
        { error: "Você precisa ser membro da comunidade para clonar baralhos" },
        { status: 403 }
      );
    }

    // Buscar o baralho original
    const originalDeck = statements.getDeck.get(
      sharedDeck.deck_id,
      sharedDeck.shared_by
    ) as { title: string; cards: string; category?: string } | undefined;

    if (!originalDeck) {
      return NextResponse.json(
        { error: "Baralho original não encontrado" },
        { status: 404 }
      );
    }

    // Criar cópia do baralho para o usuário
    const result = statements.createDeck.run(
      user.id,
      `${originalDeck.title} (cópia)`,
      originalDeck.cards,
      originalDeck.category || null
    );

    // Incrementar contador de downloads
    statements.incrementSharedDeckDownloads.run(sharedDeckId);

    const newDeck = statements.getDeck.get(result.lastInsertRowid, user.id);

    return NextResponse.json(
      {
        message: "Baralho clonado com sucesso",
        deck: newDeck,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao clonar baralho:", error);
    return NextResponse.json(
      { error: "Erro ao clonar baralho" },
      { status: 500 }
    );
  }
}
