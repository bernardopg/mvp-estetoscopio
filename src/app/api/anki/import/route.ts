import { AnkiParser } from "@/lib/anki";
import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith(".apkg")) {
      return NextResponse.json(
        { error: "Apenas arquivos .apkg são suportados" },
        { status: 400 }
      );
    }

    // Parse the .apkg file
    const ankiData = await AnkiParser.parseApkg(file);
    const flashcards = await AnkiParser.convertToFlashcards(ankiData);

    return NextResponse.json({
      success: true,
      data: {
        deck: ankiData.deck?.name || "Deck Importado",
        flashcards,
        total: flashcards.length,
      },
    });
  } catch (error) {
    console.error("Erro ao importar arquivo Anki:", error);
    return NextResponse.json(
      { error: "Erro ao processar arquivo .apkg" },
      { status: 500 }
    );
  }
}
