import Flashcard from "@/components/Flashcard";
import { ArrowRight, BookOpen, Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

export default function FlashcardsPage() {
  const examples = [
    {
      front: <>Qual é a capital da França?</>,
      back: <>Paris</>,
    },
    {
      front: <>2 + 2 = ?</>,
      back: <>4</>,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-emerald-50/20 to-teal-50/20 dark:from-black dark:via-emerald-950/10 dark:to-teal-950/10">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Flashcards
            </h1>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Sistema de estudo estilo Anki com repetição espaçada
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-10 p-6 rounded-xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/50 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 shrink-0">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Como usar
              </h3>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>
                  • Clique no botão ou pressione{" "}
                  <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-xs">
                    Espaço
                  </kbd>{" "}
                  para virar o card
                </li>
                <li>• Avalie sua resposta usando os botões de dificuldade</li>
                <li>
                  • O sistema ajusta automaticamente o intervalo de revisão
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Flashcards Examples */}
        <div className="space-y-6">
          {examples.map((c, i) => (
            <div key={i}>
              <Flashcard front={c.front} back={c.back} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 shadow-xl shadow-purple-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Pronto para começar?
          </h3>
          <p className="text-purple-100 mb-6">
            Crie seus próprios baralhos e comece a estudar de forma mais
            eficiente
          </p>
          <Link
            href="/baralhos/criar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
          >
            Criar Primeiro Baralho
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
