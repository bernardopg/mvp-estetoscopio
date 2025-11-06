import { getAuthUser } from "@/lib/auth";
import db, { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/communities - Listar todas as comunidades ou as do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // 'all', 'my', 'public'

    let communities;

    if (filter === "my") {
      // Comunidades do usuário
      communities = statements.getUserCommunities.all(user.id);
    } else if (filter === "public") {
      // Apenas comunidades públicas
      communities = db
        .prepare(
          "SELECT * FROM communities WHERE is_private = 0 ORDER BY updated_at DESC"
        )
        .all();
    } else {
      // Todas as comunidades (padrão)
      communities = statements.getCommunities.all();
    }

    return NextResponse.json({ communities });
  } catch (error) {
    console.error("Erro ao listar comunidades:", error);
    return NextResponse.json(
      { error: "Erro ao listar comunidades" },
      { status: 500 }
    );
  }
}

// POST /api/communities - Criar nova comunidade
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, is_private, icon, color } = body;

    // Validações
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da comunidade é obrigatório" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Nome da comunidade muito longo (máximo 100 caracteres)" },
        { status: 400 }
      );
    }

    // Criar comunidade
    const result = statements.createCommunity.run(
      name.trim(),
      description?.trim() || null,
      user.id,
      is_private ? 1 : 0,
      icon || null,
      color || null
    );

    const communityId = result.lastInsertRowid;

    // Adicionar criador como admin da comunidade
    statements.addCommunityMember.run(communityId, user.id, "admin");

    // Buscar comunidade criada
    const community = statements.getCommunity.get(communityId);

    return NextResponse.json({ community }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comunidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar comunidade" },
      { status: 500 }
    );
  }
}
