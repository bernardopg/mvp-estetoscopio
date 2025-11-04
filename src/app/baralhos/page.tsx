"use client";

import { Calendar, Edit, Library, Play, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Deck {
  id: number;
  title: string;
  cards: string; // JSON string
  created_at: string;
  updated_at: string;
}

export default function Baralhos() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => {
              const cards = JSON.parse(deck.cards);
              return (
                <div
                  key={deck.id}
                  className="group flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 wrap-break-word line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {deck.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium">
                          <Library className="w-3 h-3" />
                          {cards.length} card{cards.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Atualizado em{" "}
                      {new Date(deck.updated_at).toLocaleDateString("pt-BR")}
                    </span>
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
