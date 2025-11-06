"use client";

import { Check, Plus, Tag, X } from "lucide-react";
import { useState } from "react";

export interface TagType {
  id: number;
  name: string;
  color: string | null;
}

interface TagSelectorProps {
  availableTags: TagType[];
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  onCreateTag?: (name: string, color: string) => Promise<TagType | null>;
}

const TAG_COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#f59e0b" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Cinza", value: "#6b7280" },
  { name: "Ciano", value: "#06b6d4" },
];

export default function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
}: TagSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  const toggleTag = (tag: TagType) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    const newTag = await onCreateTag(newTagName.trim(), newTagColor);
    if (newTag) {
      onTagsChange([...selectedTags, newTag]);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0].value);
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tags Selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: tag.color || "#6b7280" }}
            >
              <Tag className="w-3 h-3" />
              <span>{tag.name}</span>
              <button
                onClick={() => toggleTag(tag)}
                className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tags Disponíveis */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter((tag) => !selectedTags.some((t) => t.id === tag.id))
            .map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 transition-all hover:scale-105"
                style={{
                  borderColor: tag.color || "#6b7280",
                  color: tag.color || "#6b7280",
                }}
              >
                <Tag className="w-3 h-3" />
                <span>{tag.name}</span>
              </button>
            ))}
        </div>
      )}

      {/* Criar Nova Tag */}
      {onCreateTag && (
        <>
          {isCreating ? (
            <div className="p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg space-y-3">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da tag"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTag();
                  if (e.key === "Escape") setIsCreating(false);
                }}
              />

              <div className="flex gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newTagColor === color.value
                        ? "border-zinc-900 dark:border-zinc-50 scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Criar Tag
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName("");
                  }}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nova Tag
            </button>
          )}
        </>
      )}
    </div>
  );
}
