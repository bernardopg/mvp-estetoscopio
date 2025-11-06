"use client";

import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface FolderNode {
  id: number;
  name: string;
  parent_id: number | null;
  color: string | null;
  icon: string | null;
  children?: FolderNode[];
  deckCount?: number;
}

interface FolderTreeProps {
  folders: FolderNode[];
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
  onCreateFolder?: (parentId: number | null) => void;
  hideCreateButton?: boolean;
}

export default function FolderTree({
  folders,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  hideCreateButton = false,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );

  const toggleExpand = (folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const buildTree = (
    nodes: FolderNode[],
    parentId: number | null = null
  ): FolderNode[] => {
    return nodes
      .filter((node) => node.parent_id === parentId)
      .map((node) => ({
        ...node,
        children: buildTree(nodes, node.id),
      }));
  };

  const renderFolder = (folder: FolderNode, depth: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} style={{ paddingLeft: `${depth * 12}px` }}>
        <div
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          }`}
          onClick={() => onFolderSelect(folder.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-5" />}

          {isExpanded ? (
            <FolderOpen
              className="w-4 h-4"
              style={{ color: folder.color || undefined }}
            />
          ) : (
            <Folder
              className="w-4 h-4"
              style={{ color: folder.color || undefined }}
            />
          )}

          <span className="flex-1 text-sm font-medium truncate">
            {folder.name}
          </span>

          {folder.deckCount !== undefined && folder.deckCount > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              {folder.deckCount}
            </span>
          )}

          {onCreateFolder && !hideCreateButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(folder.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all"
              title="Criar subpasta"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && folder.children && (
          <div className="mt-1">
            {folder.children.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(folders);

  return (
    <div className="space-y-1">
      {/* Raiz - Todos os baralhos */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
          selectedFolderId === null
            ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}
        onClick={() => onFolderSelect(null)}
      >
        <FolderOpen className="w-4 h-4" />
        <span className="flex-1 text-sm font-medium">Todos os Baralhos</span>
      </div>

      {/* Árvore de pastas */}
      {tree.map((folder) => renderFolder(folder))}

      {/* Botão criar nova pasta raiz */}
      {onCreateFolder && (
        <button
          onClick={() => onCreateFolder(null)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Pasta</span>
        </button>
      )}
    </div>
  );
}
