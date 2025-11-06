import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import type { SharedDeck } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

// GET /api/shared-decks/[id] - Obter detalhes de um baralho compartilhado
export async function GET(
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
      | SharedDeck
      | undefined;

    if (!sharedDeck) {
      return NextResponse.json(
        { error: "Baralho compartilhado não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem acesso
    const membership = statements.getCommunityMember.get(
      sharedDeck.community_id,
      user.id
    );

    const community = statements.getCommunity.get(sharedDeck.community_id) as
      | { is_private: number }
      | undefined;

    if (community && community.is_private === 1 && !membership) {
      return NextResponse.json(
        { error: "Acesso negado a este baralho" },
        { status: 403 }
      );
    }

    // Buscar detalhes completos do deck
    const deckDetails = statements.getDeck.get(
      sharedDeck.deck_id,
      sharedDeck.shared_by
    );

    return NextResponse.json({
      shared_deck: sharedDeck,
      deck: deckDetails,
    });
  } catch (error) {
    console.error("Erro ao buscar baralho compartilhado:", error);
    return NextResponse.json(
      { error: "Erro ao buscar baralho compartilhado" },
      { status: 500 }
    );
  }
}

// PATCH /api/shared-decks/[id] - Atualizar permissões de um baralho compartilhado
export async function PATCH(
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
      | SharedDeck
      | undefined;

    if (!sharedDeck) {
      return NextResponse.json(
        { error: "Baralho compartilhado não encontrado" },
        { status: 404 }
      );
    }

    // Apenas o dono do baralho pode alterar permissões
    if (sharedDeck.shared_by !== user.id) {
      return NextResponse.json(
        { error: "Apenas o dono do baralho pode alterar permissões" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { permission, allow_comments } = body;

    const validPermissions = ["view", "edit", "clone"];
    if (permission && !validPermissions.includes(permission)) {
      return NextResponse.json(
        { error: "Permissão inválida. Use: view, edit ou clone" },
        { status: 400 }
      );
    }

    // Atualizar permissões
    statements.updateSharedDeckPermission.run(
      permission || sharedDeck.permission,
      allow_comments !== undefined
        ? allow_comments
          ? 1
          : 0
        : sharedDeck.allow_comments,
      sharedDeckId
    );

    const updatedSharedDeck = statements.getSharedDeck.get(sharedDeckId);

    return NextResponse.json({ shared_deck: updatedSharedDeck });
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar permissões" },
      { status: 500 }
    );
  }
}

// DELETE /api/shared-decks/[id] - Remover compartilhamento de baralho
export async function DELETE(
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
      | SharedDeck
      | undefined;

    if (!sharedDeck) {
      return NextResponse.json(
        { error: "Baralho compartilhado não encontrado" },
        { status: 404 }
      );
    }

    // Apenas o dono do baralho ou admins da comunidade podem remover
    const membership = statements.getCommunityMember.get(
      sharedDeck.community_id,
      user.id
    ) as { role: string } | undefined;

    const isOwner = sharedDeck.shared_by === user.id;
    const isAdmin = membership && membership.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Apenas o dono do baralho ou administradores podem remover o compartilhamento",
        },
        { status: 403 }
      );
    }

    // Remover compartilhamento
    statements.unshareDeck.run(sharedDeckId);

    // Decrementar contador de baralhos da comunidade
    statements.decrementCommunityDecks.run(sharedDeck.community_id);

    return NextResponse.json({
      message: "Compartilhamento removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover compartilhamento:", error);
    return NextResponse.json(
      { error: "Erro ao remover compartilhamento" },
      { status: 500 }
    );
  }
}
