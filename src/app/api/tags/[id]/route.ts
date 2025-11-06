import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Usuário padrão (ID 1)
const DEFAULT_USER_ID = 1;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Nome e cor são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a tag existe e pertence ao usuário
    const existingTag = statements.getTag.get(id, DEFAULT_USER_ID);
    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar a tag
    statements.updateTag.run(name, color, id, DEFAULT_USER_ID);

    const updatedTag = statements.getTag.get(id, DEFAULT_USER_ID);
    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("Erro ao atualizar tag:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se a tag existe e pertence ao usuário
    const existingTag = statements.getTag.get(id, DEFAULT_USER_ID);
    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag não encontrada" },
        { status: 404 }
      );
    }

    // Deletar a tag (CASCADE vai remover automaticamente de deck_tags)
    const result = statements.deleteTag.run(id, DEFAULT_USER_ID);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Erro ao deletar tag" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Tag deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar tag:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
