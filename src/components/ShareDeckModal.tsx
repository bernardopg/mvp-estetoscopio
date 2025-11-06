"use client";

import { Copy, Edit, Eye, Lock, Share2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ShareDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number;
  deckTitle: string;
}

interface Community {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_private: boolean;
  member_count: number;
}

export default function ShareDeckModal({
  isOpen,
  onClose,
  deckId,
  deckTitle,
}: ShareDeckModalProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(
    null
  );
  const [permissionLevel, setPermissionLevel] = useState<
    "view" | "edit" | "clone"
  >("view");
  const [allowComments, setAllowComments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCommunities();
    }
  }, [isOpen]);

  const loadCommunities = async () => {
    try {
      const res = await fetch("/api/communities?filter=my");
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);
      }
    } catch (err) {
      console.error("Erro ao carregar comunidades:", err);
    }
  };

  const handleShare = async () => {
    if (!selectedCommunity) {
      setError("Selecione uma comunidade");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/communities/${selectedCommunity}/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deck_id: deckId,
          permission_level: permissionLevel,
          allow_comments: allowComments,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao compartilhar baralho");
      }

      // Sucesso
      alert("Baralho compartilhado com sucesso!");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao compartilhar");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-blue-600" />
              Compartilhar Baralho
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {deckTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Select Community */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
              Escolha a comunidade
            </label>
            {communities.length === 0 ? (
              <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                  Você ainda não é membro de nenhuma comunidade.
                </p>
                <Link
                  href="/comunidades"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Explorar comunidades
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {communities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => setSelectedCommunity(community.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                      selectedCommunity === community.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: community.color }}
                    >
                      {community.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                        {community.name}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {community.member_count} membros
                      </p>
                    </div>
                    {community.is_private && (
                      <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Permission Level */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
              Nível de permissão
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setPermissionLevel("view")}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  permissionLevel === "view"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="w-10 h-10 bg-zinc-500 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                    Visualizar
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Membros podem apenas visualizar e estudar o baralho
                  </p>
                </div>
              </button>

              <button
                onClick={() => setPermissionLevel("edit")}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  permissionLevel === "edit"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                    Editar
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Membros podem visualizar, estudar e editar o baralho
                  </p>
                </div>
              </button>

              <button
                onClick={() => setPermissionLevel("clone")}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  permissionLevel === "clone"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                    Clonar
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Membros podem visualizar, estudar e criar uma cópia para sua
                    biblioteca
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Allow Comments */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                Permitir comentários
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Membros poderão comentar sobre o baralho
              </p>
            </div>
            <button
              onClick={() => setAllowComments(!allowComments)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                allowComments ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  allowComments ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleShare}
            disabled={loading || communities.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Compartilhando...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Compartilhar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
