import { AnkiExporter } from "@/lib/anki-export";
import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { deckId, flashcardIds } = data;

    if (!deckId || !flashcardIds || flashcardIds.length === 0) {
      return NextResponse.json(
        { error: "Deck ID e flashcard IDs são obrigatórios" },
        { status: 400 }
      );
    }

    // TODO: Fetch flashcards from database based on IDs
    // For now, return mock data
    const mockFlashcards = flashcardIds.map((id: string) => ({
      id,
      front: `Frente do card ${id}`,
      back: `Verso do card ${id}`,
      tags: ["importado"],
    }));

    const apkgBlob = await AnkiExporter.createApkg(
      mockFlashcards,
      `Deck ${deckId}`
    );

    return new NextResponse(apkgBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="deck_${deckId}.apkg"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar deck:", error);
    return NextResponse.json(
      { error: "Erro ao exportar deck" },
      { status: 500 }
    );
  }
}
