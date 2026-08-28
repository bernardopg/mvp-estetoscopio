import JSZip from "jszip";

export interface FlashcardForExport {
  front: string;
  back: string;
  tags?: string[];
}

export interface AnkiExportData {
  deck_name: string;
  notes: Array<{
    guid: string;
    model: string;
    version: string;
    fields: {
      Front: string;
      Back: string;
    };
    tags: string[];
  }>;
  media_files?: Array<{
    filename: string;
    data: ArrayBuffer;
  }>;
}

export class AnkiExporter {
  static async createApkg(
    flashcards: FlashcardForExport[],
    deckName: string
  ): Promise<Blob> {
    const zip = new JSZip();

    // collection.anki2: metadados do deck + modelo de notas (formato interno
    // compatível com AnkiParser.parseApkg — veja src/lib/anki.ts)
    const collectionData = {
      creator: "MVP Estetoscópio",
      version: "2.1",
      deck_name: deckName,
      decks: [
        {
          id: 1,
          name: deckName,
          mid: "1",
        },
      ],
      models: {
        "1": {
          kind: "notetype",
          name: "Basic",
          flds: [
            { name: "Front", ord: 0 },
            { name: "Back", ord: 1 },
          ],
          css: `
.card {
  font-family: Arial;
  font-size: 20px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
  margin: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}`,
        },
      },
      config: {
        collapse_time: 0,
      },
    };

    zip.file("collection.anki2", JSON.stringify(collectionData, null, 2));

    // notes.json: todas as notas em um único arquivo (o parser ignora
    // arquivos *.anki2 ao buscar notas, então usamos extensão .json)
    const notes = flashcards.map((card) => ({
      guid: this.generateGuid(),
      model: "1",
      data: {
        version: "2.1",
        fields: {
          Front: card.front,
          Back: card.back,
        },
        tags: card.tags || [],
      },
    }));

    zip.file("notes.json", JSON.stringify(notes, null, 2));

    return zip.generateAsync({ type: "blob" });
  }

  static generateGuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxx".replace(/[xy]/g, (c: string) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
