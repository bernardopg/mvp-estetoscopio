"use client";

import {
  Activity,
  BookOpen,
  Brain,
  Folder,
  FolderOpen,
  GraduationCap,
  Heart,
  Stethoscope,
  X,
} from "lucide-react";
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
  { name: "Folder", component: Folder },
  { name: "FolderOpen", component: FolderOpen },
  { name: "BookOpen", component: BookOpen },
  { name: "GraduationCap", component: GraduationCap },
  { name: "Stethoscope", component: Stethoscope },
  { name: "Heart", component: Heart },
  { name: "Brain", component: Brain },
  { name: "Activity", component: Activity },
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
              <Folder className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                {folder ? "Editar Pasta" : "Nova Pasta"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                {folder ? "Atualize as informações" : "Organize seus baralhos"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 group shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-4 sm:space-y-5"
        >
          {/* Nome */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Nome da Pasta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Medicina, Cardiologia..."
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg sm:rounded-xl text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={saving}
              autoFocus
            />
          </div>

          {/* Pasta Pai */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Pasta Pai (Opcional)
            </label>
            <select
              value={parentId || ""}
              onChange={(e) =>
                setParentId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg sm:rounded-xl text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right pr-8 sm:pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.25em 1.25em",
              }}
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
            <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Cor
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  disabled={saving}
                  className={`h-9 sm:h-10 rounded-lg sm:rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                    color === c.value
                      ? "border-zinc-900 dark:border-zinc-50 scale-105 shadow-md"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {FOLDER_ICONS.map((i) => {
                const IconComponent = i.component;
                return (
                  <button
                    key={i.name}
                    type="button"
                    onClick={() => setIcon(i.name)}
                    disabled={saving}
                    className={`h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                      icon === i.name
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                    title={i.name}
                    aria-label={i.name}
                  >
                    <IconComponent
                      className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${
                        icon === i.name
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 sm:p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold">
                !
              </div>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg sm:rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden xs:inline">Salvando...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>{folder ? "Atualizar" : "Criar"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
