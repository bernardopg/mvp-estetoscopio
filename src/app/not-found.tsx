import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-zinc-400" />
        </div>

        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          404
        </h1>

        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Página não encontrada
        </h2>

        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Voltar para o início
          </Link>

          <Link
            href="/baralhos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
          >
            <Search className="w-4 h-4" />
            Explorar baralhos
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Se você acredita que isso é um erro, por favor{" "}
            <a
              href="mailto:support@flashcards.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              entre em contato
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
