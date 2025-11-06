import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { notifyDeckShared } from "@/lib/notifications";
import type { CommunityMember, SharedDeck } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

// GET /api/communities/[id]/decks - Listar baralhos compartilhados na comunidade
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
    const communityId = parseInt(id);

    if (isNaN(communityId)) {
      return NextResponse.json(
        { error: "ID de comunidade inválido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é membro ou se a comunidade é pública
    const membership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    const community = statements.getCommunity.get(communityId) as
      | { is_private: number }
      | undefined;

    if (!community) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    if (community.is_private === 1 && !membership) {
      return NextResponse.json(
        { error: "Acesso negado a esta comunidade privada" },
        { status: 403 }
      );
    }

    const sharedDecks = statements.getSharedDecks.all(communityId);

    return NextResponse.json({ decks: sharedDecks });
  } catch (error) {
    console.error("Erro ao listar baralhos compartilhados:", error);
    return NextResponse.json(
      { error: "Erro ao listar baralhos compartilhados" },
      { status: 500 }
    );
  }
}

// POST /api/communities/[id]/decks - Compartilhar um baralho na comunidade
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
    const communityId = parseInt(id);

    if (isNaN(communityId)) {
      return NextResponse.json(
        { error: "ID de comunidade inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { deck_id, permission, allow_comments } = body;

    if (!deck_id) {
      return NextResponse.json(
        { error: "deck_id é obrigatório" },
        { status: 400 }
      );
    }

    const validPermissions = ["view", "edit", "clone"];
    if (permission && !validPermissions.includes(permission)) {
      return NextResponse.json(
        { error: "Permissão inválida. Use: view, edit ou clone" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é membro da comunidade
    const membership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "Você precisa ser membro da comunidade para compartilhar baralhos",
        },
        { status: 403 }
      );
    }

    // Verificar se o baralho pertence ao usuário
    const deck = statements.getDeck.get(deck_id, user.id) as
      | { id: number }
      | undefined;

    if (!deck) {
      return NextResponse.json(
        { error: "Baralho não encontrado ou você não tem permissão" },
        { status: 404 }
      );
    }

    // Verificar se o baralho já está compartilhado nesta comunidade
    const existingShare = statements.getSharedDeckByDeckAndCommunity.get(
      deck_id,
      communityId
    ) as SharedDeck | undefined;

    if (existingShare) {
      return NextResponse.json(
        { error: "Este baralho já está compartilhado nesta comunidade" },
        { status: 400 }
      );
    }

    // Compartilhar o baralho
    const result = statements.shareDeck.run(
      deck_id,
      communityId,
      user.id,
      permission || "view",
      allow_comments !== undefined ? (allow_comments ? 1 : 0) : 1
    );

    // Incrementar contador de baralhos da comunidade
    statements.incrementCommunityDecks.run(communityId);

    const sharedDeck = statements.getSharedDeck.get(result.lastInsertRowid);

    // Notificar membros da comunidade
    const community = statements.getCommunity.get(communityId) as {
      name: string;
    };
    const deckData = statements.getDeck.get(deck_id, user.id) as {
      title: string;
    };

    if (community && deckData) {
      notifyDeckShared({
        sharedBy: user.id,
        communityId,
        deckId: deck_id,
        deckTitle: deckData.title,
        communityName: community.name,
      });
    }

    return NextResponse.json({ shared_deck: sharedDeck }, { status: 201 });
  } catch (error) {
    console.error("Erro ao compartilhar baralho:", error);
    return NextResponse.json(
      { error: "Erro ao compartilhar baralho" },
      { status: 500 }
    );
  }
}
