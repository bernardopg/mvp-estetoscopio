"use client";

import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Folder,
  GraduationCap,
  Home,
  Library,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Plus,
  Settings,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

interface NavSection {
  section: string;
  icon?: React.ComponentType<{ className?: string }>;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  items: NavItem[];
}

const navItems: NavSection[] = [
  {
    section: "Menu Principal",
    icon: Home,
    items: [
      { href: "/", label: "Dashboard", icon: Home, description: "Visão geral" },
      {
        href: "/baralhos",
        label: "Baralhos",
        icon: Library,
        description: "Gerencie seus decks",
      },
      {
        href: "/comunidades",
        label: "Comunidades",
        icon: Users,
        description: "Compartilhe e descubra",
      },
    ],
  },
  {
    section: "Criação",
    icon: Plus,
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        href: "/baralhos/criar",
        label: "Novo Baralho",
        icon: Plus,
        description: "Criar deck",
      },
      {
        href: "/flashcards",
        label: "Demo Flashcards",
        icon: Sparkles,
        description: "Ver exemplos",
      },
    ],
  },
  {
    section: "Conta",
    icon: User,
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        href: "/perfil",
        label: "Perfil",
        icon: User,
        description: "Seus dados",
      },
      {
        href: "/perfil/notificacoes",
        label: "Notificações",
        icon: Bell,
        description: "Avisos",
      },
      {
        href: "/perfil/configuracoes",
        label: "Configurações",
        icon: Settings,
        description: "Preferências",
      },
    ],
  },
  {
    section: "Documentação",
    icon: BookOpen,
    collapsible: true,
    defaultCollapsed: true,
    items: [
      {
        href: "/docs",
        label: "Visão Geral",
        icon: BookOpen,
      },
      {
        href: "/docs/guia",
        label: "Guia de Uso",
        icon: Lightbulb,
      },
      {
        href: "/docs/exemplos",
        label: "Exemplos",
        icon: Code2,
      },
      {
        href: "/docs/faq",
        label: "FAQ",
        icon: MessageCircleQuestion,
      },
      {
        href: "/docs/api",
        label: "API",
        icon: Code2,
      },
      {
        href: "/docs/referencia",
        label: "Referência",
        icon: FileText,
      },
      {
        href: "/docs/arquitetura",
        label: "Arquitetura",
        icon: Folder,
      },
      {
        href: "/docs/changelog",
        label: "Changelog",
        icon: Sparkles,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >(() => {
    // Inicializar seções com defaultCollapsed
    const initial: Record<string, boolean> = {};
    navItems.forEach((section) => {
      if (section.collapsible && section.defaultCollapsed) {
        initial[section.section] = true;
      }
    });
    return initial;
  });

  // Buscar contagem de notificações não lidas
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications?is_read=0&limit=1");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchUnreadCount();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Salvar estado de colapso no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Atualizar variável CSS do body quando o estado mudar
  useEffect(() => {
    const sidebarWidthValue = isCollapsed ? "80px" : "288px";
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarWidthValue
    );
  }, [isCollapsed]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSection = (sectionName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

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

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-shadow"
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
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-linear-to-b from-white via-zinc-50/50 to-white dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-40 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col shadow-xl`}
      >
        {/* Header */}
        <div className="relative pt-4 pb-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 via-purple-600 to-pink-600 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  Estetoscópio
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  v1.1.0
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-lg transition-all hover:scale-110"
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((section, idx) => {
            const isSectionCollapsed =
              section.collapsible && collapsedSections[section.section];
            const hasActiveItem = section.items.some((item) =>
              isActive(item.href)
            );

            return (
              <div key={idx} className="mb-4">
                {/* Section Header - Apenas quando expandido */}
                {!isCollapsed && (
                  <>
                    {section.collapsible ? (
                      <button
                        onClick={() => toggleSection(section.section)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 mb-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        <div className="flex items-center gap-2">
                          {section.icon && (
                            <section.icon className="w-4 h-4 shrink-0" />
                          )}
                          <span>{section.section}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasActiveItem && !isSectionCollapsed && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          )}
                          {isSectionCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </div>
                      </button>
                    ) : (
                      <h3 className="px-3 py-2 mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        {section.icon && (
                          <section.icon className="w-4 h-4 shrink-0" />
                        )}
                        <span>{section.section}</span>
                      </h3>
                    )}
                  </>
                )}

                {/* Separador visual quando colapsado */}
                {isCollapsed && idx > 0 && (
                  <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-2" />
                )}

                {/* Section Items */}
                {!isSectionCollapsed && (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      const isNotifications =
                        item.href === "/perfil/notificacoes";
                      const showBadge = isNotifications && unreadCount > 0;

                      // Tooltip mais descritivo quando colapsado
                      const tooltipText = isCollapsed
                        ? `${item.label}${
                            item.description ? ` - ${item.description}` : ""
                          }`
                        : item.label;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isCollapsed ? "justify-center" : ""
                            } ${
                              active
                                ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-50"
                            }`}
                            title={tooltipText}
                          >
                            <div className="relative shrink-0">
                              <item.icon
                                className={`w-5 h-5 transition-transform duration-200 ${
                                  active ? "scale-110" : "group-hover:scale-110"
                                }`}
                              />
                              {showBadge && (
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse">
                                  {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                              )}
                            </div>
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{item.label}</div>
                                {!active && item.description && (
                                  <div className="text-xs opacity-0 group-hover:opacity-60 transition-opacity truncate">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            )}
                            {!isCollapsed && active && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className={`flex gap-2 ${isCollapsed ? "flex-col" : ""}`}>
            <Link
              href="/perfil"
              onClick={() => setIsOpen(false)}
              className={`group flex items-center ${
                isCollapsed ? "justify-center" : "justify-center flex-1"
              } px-3 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 hover:shadow-md`}
              title="Perfil"
            >
              <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`group flex items-center ${
                isCollapsed ? "justify-center" : "justify-center flex-1"
              } px-3 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-zinc-200 dark:border-zinc-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md`}
              title="Sair"
            >
              {loggingOut ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
