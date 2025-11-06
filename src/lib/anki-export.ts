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

    // Create media folder
    zip.folder("media");

    // Create collection.anki2 file
    const collectionData = {
      creator: "MVP Estetoscópio",
      deck_name: deckName,
      decks: [
        {
          deck_id: 1,
          name: deckName,
          notes: [],
        },
      ],
      config: {
        collapse_time: 0,
        version: "2.1",
      },
    };

    zip.file("collection.anki2", JSON.stringify(collectionData, null, 2));

    // Create notes
    flashcards.forEach((card, index) => {
      const noteData = {
        guid: this.generateGuid(),
        model: "Basic",
        version: "2.1",
        fields: {
          Front: card.front,
          Back: card.back,
        },
        tags: card.tags || [],
        data: {
          Front: card.front,
          Back: card.back,
        },
      };

      zip.file(`${index + 1}.anki2`, JSON.stringify(noteData, null, 2));
    });

    // Create model template
    const modelData = {
      kind: "notetype",
      name: "Basic",
      flds: [
        {
          name: "Front",
          ord: 0,
          sticky: false,
          rtl: false,
          font: "Arial",
        },
        {
          name: "Back",
          ord: 1,
          sticky: false,
          rtl: false,
          font: "Arial",
        },
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
}

.card-front {
  display: none;
}

.card-back {
  display: none;
}
      `,
    };

    zip.file("collection.anki2", JSON.stringify(modelData, null, 2));

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
