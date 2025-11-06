"use client";

import { Folder, X } from "lucide-react";
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
}

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderData: {
    name: string;
    parent_id: number | null;
    color: string | null;
    icon: string | null;
  }) => Promise<void>;
  folder?: Folder | null;
  folders: Folder[];
}

const FOLDER_COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cinza", value: "#6b7280" },
  { name: "Ciano", value: "#06b6d4" },
];

const FOLDER_ICONS = [
  "Folder",
  "FolderOpen",
  "BookOpen",
  "GraduationCap",
  "Stethoscope",
  "Heart",
  "Brain",
  "Activity",
];

export default function FolderModal({
  isOpen,
  onClose,
  onSave,
  folder,
  folders,
}: FolderModalProps) {
  const [name, setName] = useState(folder?.name || "");
  const [parentId, setParentId] = useState<number | null>(
    folder?.parent_id || null
  );
  const [color, setColor] = useState<string | null>(
    folder?.color || FOLDER_COLORS[0].value
  );
  const [icon, setIcon] = useState<string | null>(folder?.icon || "Folder");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nome da pasta é obrigatório");
      return;
    }

    // Validar se não está tentando ser pai de si mesmo
    if (folder && parentId === folder.id) {
      setError("Uma pasta não pode ser filha de si mesma");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        name: name.trim(),
        parent_id: parentId,
        color,
        icon,
      });

      // Reset form
      setName("");
      setParentId(null);
      setColor(FOLDER_COLORS[0].value);
      setIcon("Folder");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar pasta");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName("");
      setParentId(null);
      setColor(FOLDER_COLORS[0].value);
      setIcon("Folder");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Filtrar pastas disponíveis (não pode selecionar a própria pasta ou suas filhas)
  const availableFolders = folder
    ? folders.filter((f) => f.id !== folder.id)
    : folders;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
              <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {folder ? "Editar Pasta" : "Nova Pasta"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nome da Pasta *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Medicina, Cardiologia..."
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
              autoFocus
            />
          </div>

          {/* Pasta Pai */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Pasta Pai (Opcional)
            </label>
            <select
              value={parentId || ""}
              onChange={(e) =>
                setParentId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">Raiz (sem pasta pai)</option>
              {availableFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Cor
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  disabled={saving}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    color === c.value
                      ? "border-zinc-900 dark:border-zinc-50 scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  disabled={saving}
                  className={`h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                    icon === i
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                  title={i}
                >
                  <span className="text-xl">{i}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : folder ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
