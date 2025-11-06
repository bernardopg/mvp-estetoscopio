import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/folders/[id] - Obter pasta específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const folderId = parseInt(id);

    const folder = statements.getFolder.get(folderId, user.id);

    if (!folder) {
      return NextResponse.json(
        { error: "Pasta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Erro ao buscar pasta:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pasta" },
      { status: 500 }
    );
  }
}

// PUT /api/folders/[id] - Atualizar pasta
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const folderId = parseInt(id);

    const body = await request.json();
    const { name, parent_id, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da pasta é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a pasta existe
    const folder = statements.getFolder.get(folderId, user.id);
    if (!folder) {
      return NextResponse.json(
        { error: "Pasta não encontrada" },
        { status: 404 }
      );
    }

    // Evitar pasta ser filha de si mesma
    if (parent_id === folderId) {
      return NextResponse.json(
        { error: "Uma pasta não pode ser filha de si mesma" },
        { status: 400 }
      );
    }

    statements.updateFolder.run(
      name.trim(),
      parent_id || null,
      color || null,
      icon || null,
      folderId,
      user.id
    );

    const updatedFolder = statements.getFolder.get(folderId, user.id);

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Erro ao atualizar pasta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pasta" },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id] - Deletar pasta
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const folderId = parseInt(id);

    // Verificar se a pasta existe
    const folder = statements.getFolder.get(folderId, user.id);
    if (!folder) {
      return NextResponse.json(
        { error: "Pasta não encontrada" },
        { status: 404 }
      );
    }

    // Mover baralhos para raiz antes de deletar
    const decks = statements.getDecks.all(user.id) as Array<{
      id: number;
      folder_id: number | null;
    }>;
    const decksInFolder = decks.filter((d) => d.folder_id === folderId);

    for (const deck of decksInFolder) {
      statements.moveDeckToFolder.run(null, deck.id, user.id);
    }

    // Deletar pasta (CASCADE vai deletar subpastas)
    statements.deleteFolder.run(folderId, user.id);

    return NextResponse.json({ message: "Pasta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar pasta:", error);
    return NextResponse.json(
      { error: "Erro ao deletar pasta" },
      { status: 500 }
    );
  }
}
