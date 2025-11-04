"use client";

import { BookOpen, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
  title?: string;
}

export default function MarkdownRenderer({
  content,
  title,
}: MarkdownRendererProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950">
      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
            <Link
              href="/docs"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Documentação
            </Link>
            {title && (
              <>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-900 dark:text-zinc-50 font-medium">
                  {title}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-8">
        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0">
          {title && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  {title}
                </h1>
              </div>
            </div>
          )}

          {/* Conteúdo do Markdown com Tailwind Typography */}
          <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </article>

          {/* Navegação de rodapé */}
          <div className="mt-8 flex justify-between items-center">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              ← Voltar para Docs
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
