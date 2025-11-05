"use client";

import {
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FolderOpen,
  Library,
  Play,
  Plus,
  Trash2,
  TrendingUp,
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

interface Deck {
  id: number;
  title: string;
  cards: string; // JSON string
  category: string | null;
  created_at: string;
  updated_at: string;
  progress: DeckProgress | null;
}

export default function Baralhos() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    deckId: number | null;
    deckTitle: string;
  }>({
    isOpen: false,
    deckId: null,
    deckTitle: "",
  });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch("/api/decks");
      if (response.ok) {
        const data = await response.json();
        setDecks(data);
      } else {
        console.error("Erro ao buscar baralhos");
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

  // Obter categorias únicas
  const categories = Array.from(
    new Set(decks.map((d) => d.category).filter((c) => c !== null))
  ) as string[];

  // Filtrar decks por categoria
  const filteredDecks =
    selectedCategory === null
      ? decks
      : decks.filter((d) => d.category === selectedCategory);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-indigo-50/20 dark:from-black dark:via-blue-950/10 dark:to-indigo-950/10 py-16 px-6">
        <div className="mx-auto max-w-6xl">
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
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-indigo-50/20 dark:from-black dark:via-blue-950/10 dark:to-indigo-950/10 py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Library className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                Meus Baralhos
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 ml-14">
              Organize e gerencie seus decks de estudo
            </p>
          </div>
          <Link
            href="/baralhos/criar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Baralho
          </Link>
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
              Crie seu primeiro baralho para começar a organizar seus estudos e
              melhorar sua retenção de conhecimento.
            </p>
            <Link
              href="/baralhos/criar"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-medium text-lg"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Baralho
            </Link>
          </div>
        ) : (
          <>
            {/* Filtros de Categoria */}
            {categories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  Todos ({decks.length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {category} (
                    {decks.filter((d) => d.category === category).length})
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDecks.map((deck) => {
                const cards = JSON.parse(deck.cards);
                const progress = deck.progress;
                const difficulty = progress
                  ? getDifficultyLabel(progress.average_difficulty)
                  : getDifficultyLabel(0);
                const progressPercentage = progress
                  ? Math.round(
                      (progress.cards_completed / progress.total_cards) * 100
                    )
                  : 0;

                return (
                  <div
                    key={deck.id}
                    className="group flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 wrap-break-word line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {deck.title}
                          </h3>
                          {progress?.marked_for_review && (
                            <Bookmark
                              className="w-4 h-4 text-amber-500 fill-amber-500"
                              aria-label="Marcado para revisão"
                            />
                          )}
                          {progress?.completed && (
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-500"
                              aria-label="Completado"
                            />
                          )}
                        </div>

                        {deck.category && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs font-medium mb-2">
                            <FolderOpen className="w-3 h-3" />
                            {deck.category}
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
                          <span className="font-semibold">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                          {progress.cards_completed} de {progress.total_cards}{" "}
                          cards revisados
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
                          {new Date(deck.updated_at).toLocaleDateString(
                            "pt-BR"
                          )}
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
                      <div className="flex gap-2">
                        <Link
                          href={`/baralhos/${deck.id}/editar`}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium flex-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(deck.id, deck.title)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-sm font-medium flex-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Deletar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
  );
}
