import {
  ArrowLeft,
  Book,
  FileText,
  HelpCircle,
  Home,
  Lightbulb,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/docs", icon: Home, label: "Início" },
  { href: "/docs/guia", icon: Book, label: "Guia de Uso" },
  { href: "/docs/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/docs/exemplos", icon: Lightbulb, label: "Exemplos" },
  { href: "/docs/arquitetura", icon: FileText, label: "Arquitetura" },
  { href: "/docs/api", icon: Settings, label: "API" },
  { href: "/docs/changelog", icon: Sparkles, label: "Changelog" },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao App
                </Link>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Documentação
                </h2>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                  💡 Dica
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Use Ctrl+F (ou Cmd+F) para buscar conteúdo específico na
                  página.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 lg:p-12 prose prose-gray dark:prose-invert max-w-none">
              {children}
            </article>
          </main>

          {/* Mobile Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1 min-w-[60px] text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
