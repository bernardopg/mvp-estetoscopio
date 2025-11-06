import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import type { Community, CommunityMember } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

// POST /api/communities/[id]/leave - Sair de uma comunidade
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

    const community = statements.getCommunity.get(communityId) as
      | Community
      | undefined;

    if (!community) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se é membro
    const membership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro desta comunidade" },
        { status: 400 }
      );
    }

    // O criador não pode sair da própria comunidade
    if (community.created_by === user.id) {
      return NextResponse.json(
        {
          error:
            "O criador não pode sair da comunidade. Delete-a se necessário.",
        },
        { status: 400 }
      );
    }

    // Remover usuário da comunidade
    statements.removeCommunityMember.run(communityId, user.id);

    // Decrementar contador de membros
    statements.decrementCommunityMembers.run(communityId);

    return NextResponse.json({
      message: "Você saiu da comunidade com sucesso",
    });
  } catch (error) {
    console.error("Erro ao sair da comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao sair da comunidade" },
      { status: 500 }
    );
  }
}
