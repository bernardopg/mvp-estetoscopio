"use client";

import type { Community } from "@/types/globals";
import { FolderOpen, Lock, Users } from "lucide-react";
import Link from "next/link";

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link href={`/comunidades/${community.id}`}>
      <div className="group bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer">
        {/* Header com ícone/cor */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
            style={{
              backgroundColor: community.color || "#3b82f6",
            }}
          >
            {community.icon || "🏛️"}
          </div>
          {community.is_private === 1 && (
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Privada
            </span>
          )}
        </div>

        {/* Nome e descrição */}
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {community.name}
        </h3>
        {community.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
            {community.description}
          </p>
        )}

        {/* Estatísticas */}
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.member_count}{" "}
            {community.member_count === 1 ? "membro" : "membros"}
          </span>
          <span className="flex items-center gap-1">
            <FolderOpen className="w-4 h-4" />
            {community.deck_count}{" "}
            {community.deck_count === 1 ? "baralho" : "baralhos"}
          </span>
        </div>

        {/* Badge de papel (se houver) */}
        {community.role && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <span
              className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                community.role === "admin"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : community.role === "moderator"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
              }`}
            >
              {community.role === "admin"
                ? "Administrador"
                : community.role === "moderator"
                ? "Moderador"
                : "Membro"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
