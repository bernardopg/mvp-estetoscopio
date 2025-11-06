import JSZip from "jszip";

export interface AnkiNote {
  guid: string;
  model: string;
  version: string;
  fields: Record<string, string>;
  tags: string[];
  deckName: string;
  css?: string;
  id?: number;
}

export interface AnkiDeck {
  deck_id: number;
  name: string;
  notes: AnkiNote[];
  fields: string[];
  templates: {
    [key: string]: {
      name: string;
      qfmt: string;
      afmt: string;
      bafmt: string;
    };
  };
  css?: string;
}

export interface ParsedAnkiData {
  deck: AnkiDeck;
  version: string;
  notes: AnkiNote[];
  mediaFiles: Array<{
    filename: string;
    data: ArrayBuffer;
  }>;
}

export class AnkiParser {
  static async parseApkg(file: File): Promise<ParsedAnkiData> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let deck: AnkiDeck | null = null;
    const notes: AnkiNote[] = [];
    const mediaFiles: ParsedAnkiData["mediaFiles"] = [];

    // Find database file
    const dbFile = Object.values(zip.files).find(
      (file) => file.name === "collection.anki2"
    );
    if (!dbFile) {
      throw new Error("Arquivo collection.anki2 não encontrado");
    }

    const dbContent = await dbFile.async("text");
    const dbData = JSON.parse(dbContent);

    // Extract deck info
    if (dbData.decks && dbData.decks.length > 0) {
      const deckInfo = dbData.decks[0];
      interface FieldDef {
        name: string;
      }
      deck = {
        deck_id: deckInfo.id,
        name: deckInfo.name,
        notes: [],
        fields:
          dbData.models[deckInfo.mid]?.flds?.map((fld: FieldDef) => fld.name) ||
          [],
        templates: {},
        css: dbData.models[deckInfo.mid]?.css,
      };
    }

    // Process notes
    for (const [filename, fileData] of Object.entries(zip.files)) {
      if (filename.endsWith(".anki2")) continue;
      if (filename === "collection.anki2") continue;

      try {
        const noteContent = await fileData.async("text");
        const noteData = JSON.parse(noteContent);

        if (Array.isArray(noteData)) {
          for (const note of noteData) {
            if (note.data) {
              notes.push({
                guid: note.guid || this.generateGuid(),
                model: note.model || deck?.deck_id.toString() || "1",
                version: note.data.version || dbData.version,
                fields: note.data.fields || {},
                tags: note.data.tags || [],
                deckName: deck?.name || "Default Deck",
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ao processar nota ${filename}:`, error);
      }
    }

    // Process media files
    for (const [filename, fileData] of Object.entries(zip.files)) {
      if (filename.startsWith("media-") && !filename.endsWith("/")) {
        try {
          const mediaData = await fileData.async("arraybuffer");
          mediaFiles.push({
            filename: filename.replace("media-", ""),
            data: mediaData,
          });
        } catch (error) {
          console.warn(`Erro ao processar mídia ${filename}:`, error);
        }
      }
    }

    if (!deck) {
      throw new Error("Nenhum deck encontrado no arquivo .apkg");
    }

    return {
      deck,
      version: dbData.version || "2.1",
      notes,
      mediaFiles,
    };
  }

  static async convertToFlashcards(ankiData: ParsedAnkiData): Promise<
    {
      front: string;
      back: string;
      tags?: string[];
    }[]
  > {
    const flashcards = [];

    for (const note of ankiData.notes) {
      if (!note.fields) continue;

      // Find front and back fields
      const frontField = Object.keys(note.fields).find(
        (key) =>
          key.toLowerCase().includes("front") ||
          key.toLowerCase().includes("frente")
      );
      const backField = Object.keys(note.fields).find(
        (key) =>
          key.toLowerCase().includes("back") ||
          key.toLowerCase().includes("verso")
      );

      if (!frontField || !backField) {
        // Try common field names
        const frontField = Object.keys(note.fields).find(
          (key) =>
            key.toLowerCase().includes("pergunta") ||
            key.toLowerCase().includes("question")
        );
        const backField = Object.keys(note.fields).find(
          (key) =>
            key.toLowerCase().includes("resposta") ||
            key.toLowerCase().includes("answer")
        );

        if (frontField && backField) {
          flashcards.push({
            front: note.fields[frontField],
            back: note.fields[backField],
            tags: note.tags,
          });
        }
      } else {
        flashcards.push({
          front: note.fields[frontField],
          back: note.fields[backField],
          tags: note.tags,
        });
      }
    }

    return flashcards;
  }

  static generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxx".replace(/[xy]/g, (c: string) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
