import MarkdownRenderer from "@/components/MarkdownRenderer";
import { promises as fs } from "fs";
import { marked } from "marked";
import path from "path";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export default async function FaqPage() {
  const filePath = path.join(process.cwd(), "FAQ.md");
  const content = await fs.readFile(filePath, "utf8");
  const htmlContent = await marked.parse(content);

  return (
    <MarkdownRenderer
      content={htmlContent}
      title="FAQ - Perguntas Frequentes"
    />
  );
}
