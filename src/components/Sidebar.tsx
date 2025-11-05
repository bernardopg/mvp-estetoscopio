"use client";

import {
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  Library,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Plus,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    section: "Principal",
    items: [
      { href: "/", label: "Início", icon: Home, description: "Página inicial" },
      {
        href: "/baralhos",
        label: "Meus Baralhos",
        icon: Library,
        description: "Gerencie seus decks",
      },
      {
        href: "/baralhos/criar",
        label: "Novo Baralho",
        icon: Plus,
        description: "Adicionar deck",
      },
    ],
  },
  {
    section: "Dúvidas e Dicas",
    items: [
      {
        href: "/flashcards",
        label: "Demo",
        icon: Sparkles,
        description: "Veja exemplos",
      },
      {
        href: "/docs/guia",
        label: "Guia de Uso",
        icon: BookOpen,
        description: "Como usar o sistema",
      },
      {
        href: "/docs/faq",
        label: "FAQ",
        icon: MessageCircleQuestion,
        description: "Perguntas frequentes",
      },
      {
        href: "/docs/exemplos",
        label: "Exemplos",
        icon: Lightbulb,
        description: "Exemplos de código",
      },
      {
        href: "/docs/arquitetura",
        label: "Documentação",
        icon: FileText,
        description: "Documentação técnica",
      },
      {
        href: "/docs/changelog",
        label: "Novidades",
        icon: Sparkles,
        description: "Changelog",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
        ) : (
          <Menu className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
        )}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-linear-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black border-r border-zinc-200 dark:border-zinc-800 z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        <Link
          href="/"
          className="pt-4 pb-3 pl-5 border-b border-zinc-200 dark:border-zinc-800"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Estetoscópio
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Aprendizado Médico
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {navItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 transition-transform duration-200 ${
                            active
                              ? "scale-110"
                              : "group-hover:scale-110 group-hover:rotate-3"
                          }`}
                        />
                        <div className="flex-1">
                          <div>{item.label}</div>
                          {!active && (
                            <div className="text-xs opacity-0 group-hover:opacity-10 transition-opacity">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {active && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-2">
            <Link
              href="/perfil"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-center flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
            >
              <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="group flex items-center justify-center flex-1 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Sair"
            >
              <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
