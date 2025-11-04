import MarkdownRenderer from "@/components/MarkdownRenderer";
import { promises as fs } from "fs";
import { marked } from "marked";
import path from "path";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export default async function ReferenciaPage() {
  const filePath = path.join(process.cwd(), "REFERENCIA.md");
  const content = await fs.readFile(filePath, "utf8");
  const htmlContent = await marked.parse(content);

  return <MarkdownRenderer content={htmlContent} title="Referência Rápida" />;
}
