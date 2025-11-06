"use client";

import { useToast } from "@/components/ToastContainer";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  LogOut,
  MessageSquare,
  Settings,
  Share2,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Community {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_private: boolean;
  member_count: number;
  deck_count: number;
  created_at: string;
  userRole?: "creator" | "admin" | "moderator" | "member";
  isMember?: boolean;
}

interface Member {
  id: number;
  user_id: number;
  role: "creator" | "admin" | "moderator" | "member";
  joined_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface SharedDeck {
  id: number;
  deck_id: number;
  community_id: number;
  shared_by: number;
  permission_level: "view" | "edit" | "clone";
  allow_comments: boolean;
  download_count: number;
  created_at: string;
  deck: {
    id: number;
    title: string;
    cards: string;
    color: string | null;
    icon: string | null;
  };
  user: {
    id: number;
    name: string;
  };
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;
  const { showToast } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [sharedDecks, setSharedDecks] = useState<SharedDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"decks" | "members">("decks");

  const loadCommunityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da comunidade
      const communityRes = await fetch(`/api/communities/${communityId}`);
      if (!communityRes.ok) {
        throw new Error("Comunidade não encontrada");
      }
      const communityData = await communityRes.json();
      setCommunity(communityData);

      // Buscar membros
      const membersRes = await fetch(`/api/communities/${communityId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      // Buscar decks compartilhados
      const decksRes = await fetch(`/api/communities/${communityId}/decks`);
      if (decksRes.ok) {
        const decksData = await decksRes.json();
        setSharedDecks(decksData);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
      showToast("error", "Erro ao carregar dados", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [communityId, showToast]);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  const handleJoinCommunity = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao entrar na comunidade");
      }

      // Recarregar dados
      await loadCommunityData();
      showToast(
        "success",
        "Sucesso!",
        "Você entrou na comunidade com sucesso!"
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao entrar na comunidade";
      showToast("error", "Erro ao entrar na comunidade", errorMessage);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!confirm("Tem certeza que deseja sair desta comunidade?")) return;

    try {
      const res = await fetch(`/api/communities/${communityId}/leave`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao sair da comunidade");
      }

      // Redirecionar para lista de comunidades
      router.push("/comunidades");
      showToast("success", "Sucesso!", "Você saiu da comunidade com sucesso!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao sair da comunidade";
      showToast("error", "Erro ao sair da comunidade", errorMessage);
    }
  };

  const handleCloneDeck = async (sharedDeckId: number) => {
    try {
      const res = await fetch(`/api/shared-decks/${sharedDeckId}/clone`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao clonar baralho");
      }

      showToast("success", "Sucesso!", "Baralho clonado com sucesso!");
      router.push("/baralhos");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao clonar baralho";
      showToast("error", "Erro ao clonar baralho", errorMessage);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "creator":
        return "Criador";
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderador";
      default:
        return "Membro";
    }
  };

  const getPermissionBadge = (permission: string) => {
    const badges = {
      view: { text: "Visualizar", color: "bg-zinc-500" },
      edit: { text: "Editar", color: "bg-blue-500" },
      clone: { text: "Clonar", color: "bg-green-500" },
    };
    const badge = badges[permission as keyof typeof badges];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium text-white rounded ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            Carregando comunidade...
          </p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {error || "Comunidade não encontrada"}
          </h2>
          <button
            onClick={() => router.push("/comunidades")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para comunidades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/comunidades")}
            className="mb-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para comunidades
          </button>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: community.color }}
                >
                  {community.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    {community.name}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {community.member_count} membros
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {community.deck_count} baralhos
                    </span>
                    {community.is_private && (
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded text-xs font-medium">
                        Privada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {!community.isMember ? (
                  <button
                    onClick={handleJoinCommunity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Entrar
                  </button>
                ) : (
                  <>
                    {community.userRole !== "creator" && (
                      <button
                        onClick={handleLeaveCommunity}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    )}
                    {(community.userRole === "creator" ||
                      community.userRole === "admin") && (
                      <button className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors inline-flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Gerenciar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("decks")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "decks"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Baralhos ({sharedDecks.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === "members"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Membros ({members.length})
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "decks" && (
          <div className="space-y-4">
            {sharedDecks.length === 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-12 text-center">
                <BookOpen className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Nenhum baralho compartilhado
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Esta comunidade ainda não possui baralhos compartilhados.
                </p>
              </div>
            ) : (
              sharedDecks.map((shared) => (
                <div
                  key={shared.id}
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {shared.deck.icon && (
                          <span className="text-2xl">{shared.deck.icon}</span>
                        )}
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                          {shared.deck.title}
                        </h3>
                        {getPermissionBadge(shared.permission_level)}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                        Compartilhado por <strong>{shared.user.name}</strong> •{" "}
                        {new Date(shared.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>
                          {JSON.parse(shared.deck.cards).length} cards
                        </span>
                        {shared.allow_comments && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Comentários ativos
                          </span>
                        )}
                        <span>{shared.download_count} clones</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {shared.permission_level === "clone" && (
                        <button
                          onClick={() => handleCloneDeck(shared.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Clonar
                        </button>
                      )}
                      <button
                        onClick={() =>
                          router.push(`/baralhos/${shared.deck_id}/estudar`)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Estudar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900 dark:text-zinc-50">
                            {member.user.name}
                          </p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {getRoleName(member.role)}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Desde{" "}
                        {new Date(member.joined_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
