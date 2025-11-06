"use client";

import CommunityCard from "@/components/CommunityCard";
import type { Community } from "@/types/globals";
import { Globe, Plus, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "my" | "public">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities?filter=${filter}`);
      const data = await response.json();

      if (response.ok) {
        setCommunities(data.communities);
      } else {
        console.error("Erro ao carregar comunidades:", data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar comunidades:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Comunidades
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Descubra e compartilhe baralhos com outros usuários
              </p>
            </div>
            <button
              onClick={() => router.push("/comunidades/criar")}
              className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Criar Comunidade
            </button>
          </div>

          {/* Filtros e busca */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barra de busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar comunidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botões de filtro */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Todas
              </button>
              <button
                onClick={() => setFilter("my")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "my"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Minhas
              </button>
              <button
                onClick={() => setFilter("public")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "public"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                <Globe className="w-4 h-4" />
                Públicas
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Lista de comunidades */}
        {!loading && filteredCommunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredCommunities.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              {searchQuery
                ? "Nenhuma comunidade encontrada"
                : filter === "my"
                ? "Você ainda não faz parte de nenhuma comunidade"
                : "Nenhuma comunidade disponível"}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {searchQuery
                ? "Tente buscar com outros termos"
                : filter === "my"
                ? "Entre em uma comunidade existente ou crie a sua própria"
                : "Seja o primeiro a criar uma comunidade!"}
            </p>
            {filter === "my" && (
              <button
                onClick={() => router.push("/comunidades/criar")}
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Criar Comunidade
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
