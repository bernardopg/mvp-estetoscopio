import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import type { CommunityMember } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

// GET /api/communities/[id]/members - Listar membros de uma comunidade
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

    const members = statements.getCommunityMembers.all(communityId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Erro ao listar membros:", error);
    return NextResponse.json(
      { error: "Erro ao listar membros" },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id]/members - Atualizar papel de um membro
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

    const body = await request.json();
    const { user_id, role } = body;

    if (!user_id || !role) {
      return NextResponse.json(
        { error: "user_id e role são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["member", "moderator", "admin"].includes(role)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 });
    }

    // Verificar se o usuário atual é admin
    const currentUserMembership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    if (!currentUserMembership || currentUserMembership.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem alterar papéis" },
        { status: 403 }
      );
    }

    // Verificar se o membro alvo existe
    const targetMembership = statements.getCommunityMember.get(
      communityId,
      user_id
    ) as CommunityMember | undefined;

    if (!targetMembership) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar papel
    statements.updateCommunityMemberRole.run(role, communityId, user_id);

    return NextResponse.json({
      message: "Papel do membro atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar papel do membro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar papel do membro" },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id]/members - Remover um membro
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

    const { searchParams } = new URL(request.url);
    const userIdToRemove = parseInt(searchParams.get("user_id") || "");

    if (isNaN(userIdToRemove)) {
      return NextResponse.json({ error: "user_id inválido" }, { status: 400 });
    }

    // Verificar se o usuário atual é admin ou moderator
    const currentUserMembership = statements.getCommunityMember.get(
      communityId,
      user.id
    ) as CommunityMember | undefined;

    if (
      !currentUserMembership ||
      !["admin", "moderator"].includes(currentUserMembership.role)
    ) {
      return NextResponse.json(
        { error: "Apenas administradores e moderadores podem remover membros" },
        { status: 403 }
      );
    }

    // Verificar se o membro alvo existe
    const targetMembership = statements.getCommunityMember.get(
      communityId,
      userIdToRemove
    ) as CommunityMember | undefined;

    if (!targetMembership) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Não pode remover o criador
    const community = statements.getCommunity.get(communityId) as
      | { created_by: number }
      | undefined;
    if (community && community.created_by === userIdToRemove) {
      return NextResponse.json(
        { error: "Não é possível remover o criador da comunidade" },
        { status: 400 }
      );
    }

    // Remover membro
    statements.removeCommunityMember.run(communityId, userIdToRemove);

    // Decrementar contador de membros
    statements.decrementCommunityMembers.run(communityId);

    return NextResponse.json({
      message: "Membro removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json(
      { error: "Erro ao remover membro" },
      { status: 500 }
    );
  }
}
