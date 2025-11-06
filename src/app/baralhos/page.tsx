"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import DraggableDeckCard from "@/components/DraggableDeckCard";
import DroppableFolder from "@/components/DroppableFolder";
import FolderModal from "@/components/FolderModal";
import FolderTree from "@/components/FolderTree";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FolderOpen,
  GitBranch,
  LayoutGrid,
  Library,
  List,
  Play,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DeckProgress {
  cards_completed: number;
  total_cards: number;
  average_difficulty: number;
  last_studied_at: string | null;
  marked_for_review: boolean;
  completed: boolean;
  study_sessions: number;
}

interface Folder {
  id: number;
  user_id: number;
  name: string;
  parent_id: number | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  deckCount?: number;
}

interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string | null;
  created_at: string;
}

interface Deck {
  id: number;
  title: string;
  cards: string; // JSON string
  category: string | null;
  folder_id: number | null;
  color: string | null;
  icon: string | null;
  is_bookmarked: number;
  created_at: string;
  updated_at: string;
  progress: DeckProgress | null;
  folder?: Folder | null;
  tags?: Tag[];
}

type ViewMode = "cards" | "list" | "tree";

export default function Baralhos() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    deckId: number | null;
    deckTitle: string;
  }>({
    isOpen: false,
    deckId: null,
    deckTitle: "",
  });
  const [folderModal, setFolderModal] = useState<{
    isOpen: boolean;
    parentId: number | null;
  }>({
    isOpen: false,
    parentId: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Configurar sensores de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer 8px de movimento antes de iniciar drag
      },
    })
  );

  // Handler para início do drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(Number(event.active.id));
  };

  // Handler para fim do drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const deckId = Number(active.id);
    const targetFolderId = over.id === "root" ? null : Number(over.id);

    // Se soltar no mesmo lugar, não faz nada
    const deck = decks.find((d) => d.id === deckId);
    if (deck && deck.folder_id === targetFolderId) return;

    try {
      // Atualização otimista
      setDecks((prevDecks) =>
        prevDecks.map((d) =>
          d.id === deckId ? { ...d, folder_id: targetFolderId } : d
        )
      );

      // Chamar API
      const res = await fetch(`/api/decks/${deckId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: targetFolderId }),
      });

      if (!res.ok) {
        throw new Error("Erro ao mover baralho");
      }

      // Recarregar dados para garantir sincronização
      await fetchData();
    } catch (error) {
      console.error("Erro ao mover deck:", error);
      alert("Erro ao mover baralho. Tente novamente.");
      // Reverter mudança otimista
      await fetchData();
    }
  };

  const fetchData = async () => {
    try {
      const [decksRes, foldersRes] = await Promise.all([
        fetch("/api/decks"),
        fetch("/api/folders"),
      ]);

      if (decksRes.ok) {
        const decksData = await decksRes.json();
        setDecks(decksData);
      }

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number, title: string) => {
    setDeleteModal({ isOpen: true, deckId: id, deckTitle: title });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, deckId: null, deckTitle: "" });
  };

  const confirmDelete = async () => {
    if (!deleteModal.deckId) return;

    try {
      const response = await fetch(`/api/decks/${deleteModal.deckId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDecks(decks.filter((deck) => deck.id !== deleteModal.deckId));
        closeDeleteModal();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao deletar baralho.");
    }
  };

  const handleCreateFolder = async (folderData: {
    name: string;
    parent_id: number | null;
    color: string | null;
    icon: string | null;
  }) => {
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(folderData),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar pasta");
      }

      // Recarregar dados
      await fetchData();
      setFolderModal({ isOpen: false, parentId: null });
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      alert("Erro ao criar pasta. Tente novamente.");
    }
  };

  const handleExportDeck = async (deckId: number) => {
    try {
      const res = await fetch(`/api/decks/${deckId}/export`);

      if (!res.ok) {
        throw new Error("Erro ao exportar baralho");
      }

      // Criar blob e fazer download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = res.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `deck_${deckId}_${Date.now()}.json`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar baralho. Tente novamente.");
    }
  };

  // Função auxiliar para formatar dificuldade média
  const getDifficultyLabel = (avg: number) => {
    if (avg === 0) return { label: "Novo", color: "text-zinc-500" };
    if (avg < 2) return { label: "Difícil", color: "text-red-600" };
    if (avg < 3) return { label: "Médio", color: "text-amber-600" };
    if (avg < 3.5) return { label: "Bom", color: "text-emerald-600" };
    return { label: "Fácil", color: "text-sky-600" };
  };

  // Função para formatar data relativa
  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "Nunca estudado";

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "semana" : "semanas"} atrás`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "mês" : "meses"} atrás`;
  };

  // Aplicar filtros
  const filteredDecks = decks
    .filter((d) => !selectedFolder || d.folder_id === selectedFolder)
    .filter((d) => !showBookmarked || d.is_bookmarked === 1)
    .filter(
      (d) =>
        !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Breadcrumbs
  const getBreadcrumbs = () => {
    const items = [];
    if (selectedFolder) {
      const folder = folders.find((f) => f.id === selectedFolder);
      if (folder) {
        items.push({
          label: folder.name,
          href: `/baralhos?folder=${folder.id}`,
          icon: FolderOpen,
        });
      }
    }
    return items;
  };

  // Renderizar visualização em cards
  const renderCardsView = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredDecks.map((deck) => {
        const cards = JSON.parse(deck.cards);
        const progress = deck.progress;
        const difficulty = progress
          ? getDifficultyLabel(progress.average_difficulty)
          : getDifficultyLabel(0);
        const progressPercentage = progress
          ? Math.round((progress.cards_completed / progress.total_cards) * 100)
          : 0;

        return (
          <DraggableDeckCard key={deck.id} id={deck.id}>
            <div className="group flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 wrap-break-word line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {deck.title}
                    </h3>
                    {deck.is_bookmarked === 1 && (
                      <Bookmark
                        className="w-4 h-4 text-amber-500 fill-amber-500"
                        aria-label="Favoritado"
                      />
                    )}
                    {progress?.completed && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-500"
                        aria-label="Completado"
                      />
                    )}
                  </div>

                  {deck.folder && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs font-medium mb-2">
                      <FolderOpen className="w-3 h-3" />
                      {deck.folder.name}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium text-sm">
                      <Library className="w-3 h-3" />
                      {cards.length} card{cards.length !== 1 ? "s" : ""}
                    </span>
                    {progress && progress.average_difficulty > 0 && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${difficulty.color} bg-zinc-100 dark:bg-zinc-800`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {difficulty.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra de Progresso */}
              {progress && progress.total_cards > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Progresso</span>
                    <span className="font-semibold">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {progress.cards_completed} de {progress.total_cards} cards
                    revisados
                  </div>
                </div>
              )}

              {/* Informações de Estudo */}
              <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500 mb-4">
                {progress?.last_studied_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Estudado {getRelativeTime(progress.last_studied_at)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Atualizado em{" "}
                    {new Date(deck.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Link
                  href={`/baralhos/${deck.id}/estudar`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 text-sm font-medium"
                >
                  <Play className="w-4 h-4" />
                  <span>Estudar</span>
                </Link>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/baralhos/${deck.id}/editar`}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </Link>
                  <button
                    onClick={() => handleExportDeck(deck.id)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-xs font-medium"
                    title="Exportar baralho"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(deck.id, deck.title)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-xs font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Deletar</span>
                  </button>
                </div>
              </div>
            </div>
          </DraggableDeckCard>
        );
      })}
    </div>
  );

  // Renderizar visualização em lista
  const renderListView = () => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Pasta
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Cards
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Última Revisão
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredDecks.map((deck) => {
              const cards = JSON.parse(deck.cards);
              const progress = deck.progress;
              const progressPercentage = progress
                ? Math.round(
                    (progress.cards_completed / progress.total_cards) * 100
                  )
                : 0;

              return (
                <tr
                  key={deck.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {deck.title}
                      </span>
                      {deck.is_bookmarked === 1 && (
                        <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {deck.folder ? (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {deck.folder.name}
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {cards.length}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-indigo-600"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {progressPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {progress?.last_studied_at
                        ? getRelativeTime(progress.last_studied_at)
                        : "Nunca"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/baralhos/${deck.id}/estudar`}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                        title="Estudar"
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/baralhos/${deck.id}/editar`}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(deck.id, deck.title)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Renderizar visualização em árvore
  const renderTreeView = () => {
    // Agrupar decks por pasta
    const decksByFolder: Record<string, Deck[]> = {};

    filteredDecks.forEach((deck) => {
      const folderId = deck.folder_id?.toString() || "root";
      if (!decksByFolder[folderId]) {
        decksByFolder[folderId] = [];
      }
      decksByFolder[folderId].push(deck);
    });

    const renderFolderWithDecks = (folderId: number | null, depth = 0) => {
      const folderKey = folderId?.toString() || "root";
      const folderDecks = decksByFolder[folderKey] || [];
      const childFolders = folders.filter((f) => f.parent_id === folderId);

      return (
        <div key={folderKey} style={{ marginLeft: `${depth * 24}px` }}>
          {childFolders.map((folder) => (
            <div key={`folder-${folder.id}`} className="mb-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <FolderOpen className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {folder.name}
                </span>
                <span className="text-xs text-zinc-500">
                  ({decksByFolder[folder.id.toString()]?.length || 0})
                </span>
              </div>
              {renderFolderWithDecks(folder.id, depth + 1)}
            </div>
          ))}

          {folderDecks.map((deck) => {
            const cards = JSON.parse(deck.cards);
            return (
              <div
                key={`deck-${deck.id}`}
                className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg mb-2 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Library className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {deck.title}
                      </span>
                      {deck.is_bookmarked === 1 && (
                        <Bookmark className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {cards.length} cards
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/baralhos/${deck.id}/estudar`}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/baralhos/${deck.id}/editar`}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(deck.id, deck.title)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return <div className="space-y-2">{renderFolderWithDecks(null)}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-indigo-50/20 dark:from-black dark:via-blue-950/10 dark:to-indigo-950/10 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Library className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Meus Baralhos
            </h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-indigo-50/20 dark:from-black dark:via-blue-950/10 dark:to-indigo-950/10 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-6">
            {/* Sidebar com FolderTree */}
            <aside className="w-72 shrink-0 sticky top-16 self-start">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                  Organização
                </h3>

                {/* Zona droppable para pasta raiz */}
                <DroppableFolder id="root">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all mb-2 ${
                      selectedFolder === null
                        ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                    onClick={() => setSelectedFolder(null)}
                  >
                    <Library className="w-4 h-4" />
                    <span className="flex-1 text-sm font-medium">
                      Todos os Baralhos
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {decks.filter((d) => !d.folder_id).length}
                    </span>
                  </div>
                </DroppableFolder>

                <FolderTree
                  folders={folders}
                  selectedFolderId={selectedFolder}
                  onFolderSelect={(id) =>
                    setSelectedFolder(id === selectedFolder ? null : id)
                  }
                  onCreateFolder={(parentId) => {
                    setFolderModal({ isOpen: true, parentId });
                  }}
                />

                {/* Filtros */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setShowBookmarked(!showBookmarked)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      showBookmarked
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Bookmark
                      className="w-4 h-4"
                      fill={showBookmarked ? "currentColor" : "none"}
                    />
                    Favoritos
                    {showBookmarked && (
                      <span className="ml-auto text-xs">
                        {decks.filter((d) => d.is_bookmarked === 1).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <Library className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                      Meus Baralhos
                    </h1>
                  </div>

                  {/* Breadcrumbs */}
                  {selectedFolder && (
                    <div className="ml-14">
                      <Breadcrumbs items={getBreadcrumbs()} />
                    </div>
                  )}
                </div>

                <Link
                  href="/baralhos/criar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Criar Novo
                </Link>

                <Link
                  href="/baralhos/importar"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Importar
                </Link>
              </div>

              {/* Barra de Ferramentas */}
              <div className="flex items-center justify-between gap-4 mb-6">
                {/* Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar baralhos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Toggle de Visualização */}
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "cards"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                    }`}
                    title="Visualização em Cards"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                    }`}
                    title="Visualização em Lista"
                  >
                    <List className="w-4 h-4" />
                    Lista
                  </button>
                  <button
                    onClick={() => setViewMode("tree")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "tree"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                    }`}
                    title="Visualização em Árvore"
                  >
                    <GitBranch className="w-4 h-4" />
                    Árvore
                  </button>
                </div>
              </div>

              {decks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    <Library className="w-16 h-16 text-zinc-400 dark:text-zinc-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                    Nenhum baralho ainda
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                    Crie seu primeiro baralho para começar a organizar seus
                    estudos.
                  </p>
                  <Link
                    href="/baralhos/criar"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium text-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Primeiro Baralho
                  </Link>
                </div>
              ) : filteredDecks.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Nenhum baralho encontrado com os filtros aplicados.
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === "cards" && renderCardsView()}
                  {viewMode === "list" && renderListView()}
                  {viewMode === "tree" && renderTreeView()}
                </>
              )}
            </main>
          </div>
        </div>

        {/* Modal de confirmação de delete */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Confirmar exclusão
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Tem certeza que deseja deletar o baralho{" "}
                  <strong className="text-zinc-900 dark:text-zinc-50">
                    {deleteModal.deckTitle}
                  </strong>
                  ? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Criação de Pasta */}
      <FolderModal
        isOpen={folderModal.isOpen}
        onClose={() => setFolderModal({ isOpen: false, parentId: null })}
        onSave={handleCreateFolder}
        folders={folders}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragId ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border-2 border-blue-500 p-6 opacity-90 cursor-grabbing">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {decks.find((d) => d.id === activeDragId)?.title}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
