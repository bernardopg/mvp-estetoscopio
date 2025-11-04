import {
  BookOpen,
  FileText,
  HelpCircle,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const docs = [
  {
    title: "Guia de Uso",
    description: "Aprenda a usar o sistema do zero com nosso guia completo",
    icon: BookOpen,
    href: "/docs/guia",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "FAQ",
    description: "Respostas para as perguntas mais frequentes",
    icon: MessageCircleQuestion,
    href: "/docs/faq",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Exemplos",
    description: "Exemplos práticos de código para desenvolvedores",
    icon: Lightbulb,
    href: "/docs/exemplos",
    color: "from-amber-500 to-amber-600",
  },
  {
    title: "Documentação Técnica",
    description: "Arquitetura e detalhes técnicos do sistema",
    icon: FileText,
    href: "/docs/arquitetura",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "Novidades",
    description: "Veja o que há de novo em cada versão",
    icon: Sparkles,
    href: "/docs/changelog",
    color: "from-pink-500 to-pink-600",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Dúvidas e Dicas
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Encontre tudo que você precisa saber sobre o MVP Estetoscópio
          </p>
        </div>

        {/* Grid de documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-linear-to-br ${doc.color} shadow-lg mb-4`}
              >
                <doc.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {doc.title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {doc.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Info adicional */}
        <div className="mt-16 p-8 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ainda tem dúvidas?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nossa documentação está em constante atualização. Se você não
            encontrou o que procura, entre em contato conosco.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="https://github.com/seu-usuario/mvp-estetoscopio/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              Reportar Problema
            </Link>
            <Link
              href="https://github.com/seu-usuario/mvp-estetoscopio/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors border border-purple-400"
            >
              Discussões
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
