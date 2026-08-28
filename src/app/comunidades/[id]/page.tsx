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
  // TODO: Adicionar aba de atividade/feed da comunidade
  // TODO: Adicionar aba de estatísticas da comunidade
  // TODO: Adicionar filtro de busca para baralhos e membros
  // TODO: Adicionar ordenação (mais recentes, mais populares, mais clonados)

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
        setSharedDecks(decksData.decks || []);
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
    (async () => {
      await loadCommunityData();
    })();
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

  // TODO: Implementar função handleShareDeck - modal para selecionar baralho e permissões
  // TODO: Implementar função handleManageCommunity - página/modal de gerenciamento
  // TODO: Implementar função handleInviteMembers - sistema de convites por email/link
  // TODO: Implementar função handleReportContent - sistema de denúncias
  // TODO: Implementar função handleToggleFavorite - marcar baralho como favorito

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
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Carregando comunidade...
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aguarde um momento
          </p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              {error || "Comunidade não encontrada"}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              A comunidade que você está procurando não existe ou foi removida.
            </p>
            <button
              onClick={() => router.push("/comunidades")}
              className="px-6 py-3 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 inline-flex items-center gap-2 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para comunidades
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-blue-50/20 to-purple-50/20 dark:from-black dark:via-blue-950/10 dark:to-purple-950/10 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/comunidades")}
            className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors inline-flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para comunidades
          </button>

          {/* Community Header Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Banner com gradiente */}
            <div
              className="h-32 relative"
              style={{
                background: `linear-gradient(135deg, ${community.color}dd, ${community.color})`
              }}
            >
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Content */}
            <div className="p-8 -mt-16 relative">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  {/* Community Icon */}
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-4 border-white dark:border-zinc-900"
                    style={{ backgroundColor: community.color }}
                  >
                    {community.icon}
                  </div>

                  {/* Info */}
                  <div className="pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        {community.name}
                      </h1>
                      {community.is_private && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium">
                          Privada
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-4 max-w-2xl">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold">{community.member_count}</span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">membros</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50">
                          <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-semibold">{community.deck_count}</span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">baralhos</span>
                      </div>
                      {/* TODO: Adicionar estatística de atividade (estudos realizados na comunidade) */}
                      {/* TODO: Adicionar data de criação da comunidade */}
                      {/* TODO: Adicionar tags/categorias da comunidade */}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-4">
                  {!community.isMember ? (
                    <button
                      onClick={handleJoinCommunity}
                      className="px-6 py-3 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 inline-flex items-center justify-center gap-2 font-semibold"
                    >
                      <UserPlus className="w-5 h-5" />
                      Entrar na Comunidade
                    </button>
                  ) : (
                    <>
                      {/* TODO: Implementar modal de compartilhar baralho */}
                      <button
                        className="px-6 py-3 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 inline-flex items-center justify-center gap-2 font-semibold"
                        title="Em breve: Compartilhar seus baralhos"
                      >
                        <Share2 className="w-5 h-5" />
                        Compartilhar Baralho
                      </button>
                      {(community.userRole === "creator" ||
                        community.userRole === "admin") && (
                        <button
                          className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors inline-flex items-center justify-center gap-2 font-semibold"
                          title="Em breve: Gerenciar comunidade"
                        >
                          <Settings className="w-5 h-5" />
                          Gerenciar
                        </button>
                      )}
                      {community.userRole !== "creator" && (
                        <button
                          onClick={handleLeaveCommunity}
                          className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("decks")}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "decks"
                  ? "bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Baralhos
              <span className={`px-2 py-0.5 rounded-md text-sm font-bold ${
                activeTab === "decks"
                  ? "bg-white/20"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}>
                {sharedDecks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                activeTab === "members"
                  ? "bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Users className="w-5 h-5" />
              Membros
              <span className={`px-2 py-0.5 rounded-md text-sm font-bold ${
                activeTab === "members"
                  ? "bg-white/20"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}>
                {members.length}
              </span>
            </button>
            {/* TODO: Adicionar aba "Atividade" com feed de ações recentes */}
            {/* TODO: Adicionar aba "Sobre" com descrição detalhada e regras */}
            {/* TODO: Adicionar aba "Estatísticas" (para criadores/admins) */}
          </div>
        </div>

        {/* Content */}
        {activeTab === "decks" && (
          <div className="space-y-4">
            {sharedDecks.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    Nenhum baralho compartilhado
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    Esta comunidade ainda não possui baralhos compartilhados. Seja o primeiro a compartilhar conhecimento!
                  </p>
                  {community.isMember && (
                    <button
                      className="px-6 py-3 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 inline-flex items-center gap-2 font-semibold"
                      title="Em breve: Compartilhar baralho"
                    >
                      <Share2 className="w-5 h-5" />
                      Compartilhar Meu Baralho
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sharedDecks.map((shared) => (
                  <div
                    key={shared.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          {/* Header do card */}
                          <div className="flex items-start gap-4 mb-4">
                            {shared.deck.icon && shared.deck.color && (
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
                                style={{ backgroundColor: shared.deck.color }}
                              >
                                {shared.deck.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                                  {shared.deck.title}
                                </h3>
                                {getPermissionBadge(shared.permission_level)}
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Por <span className="font-semibold">{shared.user.name}</span> •{" "}
                                {new Date(shared.created_at).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>

                          {/* Estatísticas */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-semibold">
                                {JSON.parse(shared.deck.cards).length}
                              </span>
                              <span className="text-zinc-500 dark:text-zinc-400">cards</span>
                            </div>
                            {shared.allow_comments && (
                              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-950/50">
                                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-zinc-500 dark:text-zinc-400">Comentários</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/50">
                                <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span className="font-semibold">{shared.download_count}</span>
                              <span className="text-zinc-500 dark:text-zinc-400">clones</span>
                            </div>
                            {/* TODO: Adicionar estrela de avaliação/rating */}
                            {/* TODO: Adicionar número de visualizações */}
                            {/* TODO: Adicionar data da última atualização */}
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() =>
                              router.push(`/baralhos/${shared.deck_id}/estudar`)
                            }
                            className="px-6 py-3 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 inline-flex items-center gap-2 font-semibold whitespace-nowrap"
                          >
                            <BookOpen className="w-5 h-5" />
                            Estudar
                          </button>
                          {shared.permission_level === "clone" && (
                            <button
                              onClick={() => handleCloneDeck(shared.id)}
                              className="px-6 py-3 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 inline-flex items-center gap-2 font-semibold whitespace-nowrap"
                            >
                              <Share2 className="w-5 h-5" />
                              Clonar
                            </button>
                          )}
                          {/* TODO: Adicionar botão de favoritar baralho */}
                          {/* TODO: Adicionar menu dropdown com mais opções (denunciar, compartilhar link, etc) */}
                          {/* TODO: Para admins/moderadores: adicionar opções de remover/editar */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Nome e role */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                        {member.user.name}
                      </h3>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {member.user.email}
                    </p>
                  </div>

                  {/* Badge de role */}
                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      member.role === "creator"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        : member.role === "admin"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : member.role === "moderator"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
                    }`}>
                      {getRoleName(member.role)}
                    </span>
                  </div>

                  {/* Data de entrada */}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Membro desde {new Date(member.joined_at).toLocaleDateString("pt-BR")}
                  </p>

                  {/* TODO: Adicionar botões de ação para admins/moderadores:
                      - Promover a moderador/admin
                      - Remover da comunidade
                      - Visualizar contribuições do membro
                      - Enviar mensagem privada
                  */}
                  {/* TODO: Adicionar badge de "Novo membro" se entrou recentemente */}
                  {/* TODO: Mostrar estatísticas do membro (baralhos compartilhados, contribuições) */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
