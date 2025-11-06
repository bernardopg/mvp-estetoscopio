import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/folders - Listar todas as pastas do usuário
export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const folders = statements.getFolders.all(user.id) as Array<{
      id: number;
      user_id: number;
      name: string;
      parent_id: number | null;
      color: string | null;
      icon: string | null;
      created_at: string;
      updated_at: string;
    }>;

    // Calcular quantidade de decks por pasta
    const decks = statements.getDecks.all(user.id) as Array<{
      id: number;
      folder_id: number | null;
    }>;

    const foldersWithCount = folders.map((folder) => ({
      ...folder,
      deckCount: decks.filter((d) => d.folder_id === folder.id).length,
    }));

    return NextResponse.json(foldersWithCount);
  } catch (error) {
    console.error("Erro ao buscar pastas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pastas" },
      { status: 500 }
    );
  }
}

// POST /api/folders - Criar nova pasta
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, parent_id, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da pasta é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o parent_id existe e pertence ao usuário
    if (parent_id !== null && parent_id !== undefined) {
      const parentFolder = statements.getFolder.get(parent_id, user.id);
      if (!parentFolder) {
        return NextResponse.json(
          { error: "Pasta pai não encontrada" },
          { status: 404 }
        );
      }
    }

    const result = statements.createFolder.run(
      user.id,
      name.trim(),
      parent_id || null,
      color || null,
      icon || null
    );

    const newFolder = statements.getFolder.get(result.lastInsertRowid, user.id);

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pasta:", error);
    return NextResponse.json({ error: "Erro ao criar pasta" }, { status: 500 });
  }
}
