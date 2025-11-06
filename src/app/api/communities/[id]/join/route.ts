import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import type { Community, CommunityMember } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

// POST /api/communities/[id]/join - Entrar em uma comunidade
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

    // Verificar se já é membro
    const existingMembership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    if (existingMembership) {
      return NextResponse.json(
        { error: "Você já é membro desta comunidade" },
        { status: 400 }
      );
    }

    // Se for comunidade privada, não pode entrar diretamente
    if (community.is_private === 1) {
      return NextResponse.json(
        { error: "Esta comunidade é privada. Você precisa de um convite." },
        { status: 403 }
      );
    }

    // Adicionar usuário como membro
    statements.addCommunityMember.run(communityId, user.id, "member");

    // Incrementar contador de membros
    statements.incrementCommunityMembers.run(communityId);

    return NextResponse.json({
      message: "Você entrou na comunidade com sucesso",
    });
  } catch (error) {
    console.error("Erro ao entrar na comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao entrar na comunidade" },
      { status: 500 }
    );
  }
}
