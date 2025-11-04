import MarkdownRenderer from "@/components/MarkdownRenderer";
import { promises as fs } from "fs";
import { marked } from "marked";
import path from "path";

// Configurar marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default async function GuiaPage() {
  const filePath = path.join(process.cwd(), "GUIA_DE_USO.md");
  const content = await fs.readFile(filePath, "utf8");

  // Converter markdown para HTML usando marked
  const htmlContent = await marked.parse(content);

  return <MarkdownRenderer content={htmlContent} title="Guia de Uso" />;
}
