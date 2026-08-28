import { AnkiExporter, type FlashcardForExport } from "@/lib/anki-export";
import { AnkiParser } from "@/lib/anki";

function makeApkgFile(blob: Blob, name = "deck.apkg"): File {
  return new File([blob], name, { type: "application/zip" });
}

const sampleCards: FlashcardForExport[] = [
  { front: "O que é o SM-2?", back: "Algoritmo de repetição espaçada", tags: ["sm2"] },
  { front: "Para que serve o E-Factor?", back: "Ajustar intervalos de revisão" },
  {
    front: "Card com <b>HTML</b> no conteúdo",
    back: "Conteúdo com acentuação: ação, coração, às",
  },
];

describe("AnkiExporter → AnkiParser (round-trip)", () => {
  it("exporta e reimporta as mesmas flashcards", async () => {
    const blob = await AnkiExporter.createApkg(sampleCards, "Baralho Teste");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);

    const file = makeApkgFile(blob);
    const parsed = await AnkiParser.parseApkg(file);

    expect(parsed.deck.name).toBe("Baralho Teste");
    expect(parsed.notes).toHaveLength(sampleCards.length);

    const flashcards = await AnkiParser.convertToFlashcards(parsed);
    expect(flashcards).toHaveLength(sampleCards.length);

    flashcards.forEach((card, index) => {
      expect(card.front).toBe(sampleCards[index].front);
      expect(card.back).toBe(sampleCards[index].back);
      expect(card.tags).toEqual(sampleCards[index].tags ?? []);
    });
  });

  it("preserve conteúdo com HTML e caracteres especiais", async () => {
    const blob = await AnkiExporter.createApkg(sampleCards, "Deck Especial");
    const parsed = await AnkiParser.parseApkg(makeApkgFile(blob));
    const flashcards = await AnkiParser.convertToFlashcards(parsed);

    expect(flashcards[2].front).toContain("<b>HTML</b>");
    expect(flashcards[2].back).toContain("ação, coração, às");
  });

  it("trata baralho com cards sem tags", async () => {
    const blob = await AnkiExporter.createApkg(
      [{ front: "Frente", back: "Verso" }],
      "Deck Sem Tags"
    );
    const parsed = await AnkiParser.parseApkg(makeApkgFile(blob));
    const flashcards = await AnkiParser.convertToFlashcards(parsed);

    expect(flashcards[0].tags).toEqual([]);
  });

  it("usa o nome do deck como fallback no import", async () => {
    const blob = await AnkiExporter.createApkg(sampleCards, "Nome Personalizado");
    const parsed = await AnkiParser.parseApkg(makeApkgFile(blob));
    expect(parsed.deck.name).toBe("Nome Personalizado");
  });
});

describe("AnkiParser (casos de erro)", () => {
  it("rejeita zip sem collection.anki2 com mensagem clara", async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    zip.file("outro.txt", "conteúdo");
    const blob = await zip.generateAsync({ type: "blob" });

    await expectAsyncError(
      () => AnkiParser.parseApkg(makeApkgFile(blob)),
      "collection.anki2"
    );
  });

  it("rejeita arquivo que não é um zip válido", async () => {
    const file = new File(["isso não é um zip"], "fake.apkg", {
      type: "application/zip",
    });

    await expect(AnkiParser.parseApkg(file)).rejects.toThrow();
  });
});

/** Helper: espera que a promise rejeite com a mensagem contendo o texto. */
async function expectAsyncError(
  fn: () => Promise<unknown>,
  messagePart: string
): Promise<void> {
  await expect(fn()).rejects.toThrow(new RegExp(messagePart));
}

describe("AnkiExporter (sanidade do pacote gerado)", () => {
  it("gera collection.anki2 com decks e models consistentes", async () => {
    const JSZip = (await import("jszip")).default;
    const blob = await AnkiExporter.createApkg(sampleCards, "Deck Estrutura");

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const collectionFile = zip.file("collection.anki2");
    expect(collectionFile).not.toBeNull();

    const collection = JSON.parse(
      (await collectionFile!.async("text")) as string
    );
    expect(collection.decks).toHaveLength(1);
    expect(collection.decks[0].name).toBe("Deck Estrutura");
    expect(Object.keys(collection.models)).toContain(
      collection.decks[0].mid
    );
    expect(collection.models[collection.decks[0].mid].flds.map(
      (f: { name: string }) => f.name
    )).toEqual(["Front", "Back"]);
  });

  it("gera notes.json com todas as notas", async () => {
    const JSZip = (await import("jszip")).default;
    const blob = await AnkiExporter.createApkg(sampleCards, "Deck Notas");

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const notesFile = zip.file("notes.json");
    expect(notesFile).not.toBeNull();

    const notes = JSON.parse((await notesFile!.async("text")) as string);
    expect(notes).toHaveLength(sampleCards.length);
    notes.forEach((note: { guid: string; data: { fields: unknown } }) => {
      expect(note.guid).toBeTruthy();
      expect(note.data.fields).toHaveProperty("Front");
      expect(note.data.fields).toHaveProperty("Back");
    });
  });
});
