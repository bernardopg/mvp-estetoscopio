"use client";

import type { Notification } from "@/types/globals";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        filter === "unread"
          ? "/api/notifications?is_read=0"
          : "/api/notifications";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: 1 }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, is_read: 1 } : notif
          )
        );
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const clearAllRead = async () => {
    if (
      !confirm("Tem certeza que deseja limpar todas as notificações lidas?")
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/notifications?read_only=true", {
        method: "DELETE",
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const unread = notifications.filter((n) => n.is_read === 0);

      await Promise.all(
        unread.map((notif) =>
          fetch(`/api/notifications/${notif.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_read: 1 }),
          })
        )
      );

      fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deck_shared":
        return "📚";
      case "comment":
        return "💬";
      case "comment_reply":
        return "💬";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Voltar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Notificações
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                {unreadCount > 0
                  ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
                  : "Nenhuma notificação não lida"}
              </p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                Não lidas
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={clearAllRead}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Limpar lidas
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-600 dark:text-zinc-400 mt-4">
              Carregando notificações...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Bell className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {filter === "unread"
                ? "Nenhuma notificação não lida"
                : "Nenhuma notificação"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isUnread = notification.is_read === 0;

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isUnread
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            isUnread
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {isUnread && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
                            Nova
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm mb-2 ${
                          isUnread
                            ? "text-blue-800 dark:text-blue-200"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          {new Date(notification.created_at).toLocaleString(
                            "pt-BR"
                          )}
                        </span>

                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Ver detalhes →
                          </Link>
                        )}

                        <div className="ml-auto flex gap-2">
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              disabled={actionLoading === notification.id}
                              className="p-1.5 rounded-md text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                              title="Marcar como lida"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            disabled={actionLoading === notification.id}
                            className="p-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
