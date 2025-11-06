import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tags - Listar todas as tags do usuário
export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tags = statements.getTags.all(user.id);

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Erro ao buscar tags:", error);
    return NextResponse.json({ error: "Erro ao buscar tags" }, { status: 500 });
  }
}

// POST /api/tags - Criar nova tag
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da tag é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a tag já existe
    const existingTag = statements.getTagByName.get(user.id, name.trim());
    if (existingTag) {
      return NextResponse.json(
        { error: "Tag com este nome já existe" },
        { status: 409 }
      );
    }

    const result = statements.createTag.run(
      user.id,
      name.trim(),
      color || null
    );

    const newTag = statements.getTag.get(result.lastInsertRowid, user.id);

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tag:", error);
    return NextResponse.json({ error: "Erro ao criar tag" }, { status: 500 });
  }
}
