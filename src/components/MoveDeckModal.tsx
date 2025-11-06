"use client";

import FolderTree from "@/components/FolderTree";
import { FolderInput, X } from "lucide-react";
import { useState } from "react";

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

interface MoveDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: number | null) => Promise<void>;
  deckTitle: string;
  currentFolderId: number | null;
  folders: Folder[];
}

export default function MoveDeckModal({
  isOpen,
  onClose,
  onMove,
  deckTitle,
  currentFolderId,
  folders,
}: MoveDeckModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    currentFolderId
  );
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMove = async () => {
    setError(null);
    setMoving(true);

    try {
      await onMove(selectedFolderId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao mover baralho");
    } finally {
      setMoving(false);
    }
  };

  const handleClose = () => {
    if (!moving) {
      setSelectedFolderId(currentFolderId);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <FolderInput className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Mover Baralho
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {deckTitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={moving}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Localização Atual */}
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Localização Atual:
          </p>
          <p className="text-zinc-900 dark:text-zinc-50">
            {currentFolder ? currentFolder.name : "Raiz (sem pasta)"}
          </p>
        </div>

        {/* Seletor de Pasta */}
        <div className="flex-1 overflow-y-auto mb-6">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Selecione a pasta de destino:
          </p>

          {/* Opção Raiz */}
          <button
            onClick={() => setSelectedFolderId(null)}
            disabled={moving}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-left transition-all mb-2 ${
              selectedFolderId === null
                ? "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <FolderInput className="w-5 h-5" />
            <span className="font-medium">Raiz (sem pasta)</span>
          </button>

          {/* Árvore de Pastas */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={(id) => setSelectedFolderId(id)}
              onCreateFolder={() => {}} // Não permitir criar pasta aqui
              hideCreateButton
            />
          </div>
        </div>

        {/* Nova Localização */}
        {selectedFolderId !== currentFolderId && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
              Nova Localização:
            </p>
            <p className="text-emerald-900 dark:text-emerald-50 font-medium">
              {selectedFolder ? selectedFolder.name : "Raiz (sem pasta)"}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={moving}
            className="flex-1 px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={moving || selectedFolderId === currentFolderId}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {moving ? "Movendo..." : "Mover Baralho"}
          </button>
        </div>
      </div>
    </div>
  );
}
