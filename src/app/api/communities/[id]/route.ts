import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import type { Community, CommunityMember } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

// GET /api/communities/[id] - Obter detalhes de uma comunidade
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

    const community = statements.getCommunity.get(communityId) as
      | Community
      | undefined;

    if (!community) {
      return NextResponse.json(
        { error: "Comunidade não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é membro
    const membership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    // Se a comunidade é privada e o usuário não é membro
    if (community.is_private === 1 && !membership) {
      return NextResponse.json(
        { error: "Acesso negado a esta comunidade privada" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      community,
      is_member: !!membership,
      role: membership ? membership.role : null,
    });
  } catch (error) {
    console.error("Erro ao buscar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comunidade" },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id] - Atualizar comunidade
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
    const communityId = parseInt(id);

    if (isNaN(communityId)) {
      return NextResponse.json(
        { error: "ID de comunidade inválido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é admin da comunidade
    const membership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar a comunidade" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, is_private, icon, color } = body;

    // Validações
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return NextResponse.json(
          { error: "Nome da comunidade não pode estar vazio" },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: "Nome da comunidade muito longo (máximo 100 caracteres)" },
          { status: 400 }
        );
      }
    }

    // Buscar comunidade atual
    const currentCommunity = statements.getCommunity.get(
      communityId
    ) as Community;

    // Atualizar comunidade
    statements.updateCommunity.run(
      name?.trim() || currentCommunity.name,
      description?.trim() || null,
      is_private !== undefined
        ? is_private
          ? 1
          : 0
        : currentCommunity.is_private,
      icon !== undefined ? icon : currentCommunity.icon,
      color !== undefined ? color : currentCommunity.color,
      communityId
    );

    const updatedCommunity = statements.getCommunity.get(communityId);

    return NextResponse.json({ community: updatedCommunity });
  } catch (error) {
    console.error("Erro ao atualizar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar comunidade" },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id] - Deletar comunidade
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

    // Apenas o criador pode deletar a comunidade
    if (community.created_by !== user.id) {
      return NextResponse.json(
        { error: "Apenas o criador pode deletar a comunidade" },
        { status: 403 }
      );
    }

    statements.deleteCommunity.run(communityId);

    return NextResponse.json({ message: "Comunidade deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao deletar comunidade" },
      { status: 500 }
    );
  }
}
