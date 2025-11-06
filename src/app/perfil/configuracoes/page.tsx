"use client";

import { Bell, Mail, MessageSquare, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NotificationSettings {
  emailNotifications: boolean;
  communityNotifications: boolean;
  commentNotifications: boolean;
  deckShareNotifications: boolean;
  newFollowerNotifications: boolean;
  studyReminders: boolean;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    communityNotifications: true,
    commentNotifications: true,
    deckShareNotifications: true,
    newFollowerNotifications: true,
    studyReminders: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/user/notification-settings");
        if (res.ok) {
          const data = await res.json();
          // Converter valores inteiros para booleanos
          setSettings({
            emailNotifications: data.email_notifications === 1,
            communityNotifications: data.community_notifications === 1,
            commentNotifications: data.comment_notifications === 1,
            deckShareNotifications: data.deck_share_notifications === 1,
            newFollowerNotifications: data.new_follower_notifications === 1,
            studyReminders: data.study_reminders === 1,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        // Manter valores padrão se houver erro
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("notificationSettings", JSON.stringify(settings));

      // Save to API
      const response = await fetch("/api/user/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_notifications: settings.emailNotifications,
          community_notifications: settings.communityNotifications,
          comment_notifications: settings.commentNotifications,
          deck_share_notifications: settings.deckShareNotifications,
          new_follower_notifications: settings.newFollowerNotifications,
          study_reminders: settings.studyReminders,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      // Mesmo com erro na API, as configurações estão salvas no localStorage
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    {
      key: "emailNotifications" as keyof NotificationSettings,
      title: "Notificações por Email",
      description: "Receber notificações importantes no seu email",
      icon: <Mail className="w-5 h-5" />,
    },
    {
      key: "communityNotifications" as keyof NotificationSettings,
      title: "Notificações de Comunidades",
      description:
        "Quando alguém compartilha um deck ou comenta em suas comunidades",
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: "commentNotifications" as keyof NotificationSettings,
      title: "Notificações de Comentários",
      description: "Quando alguém comenta nos seus decks compartilhados",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      key: "deckShareNotifications" as keyof NotificationSettings,
      title: "Compartilhamento de Decks",
      description: "Quando seus decks são compartilhados em comunidades",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      key: "newFollowerNotifications" as keyof NotificationSettings,
      title: "Novos Seguidores",
      description: "Quando alguém começa a seguir você",
      icon: <Users className="w-5 h-5" />,
    },
    {
      key: "studyReminders" as keyof NotificationSettings,
      title: "Lembretes de Estudo",
      description: "Lembretes para revisar seus flashcards",
      icon: <Bell className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/perfil")}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors inline-flex items-center gap-2"
          >
            ← Voltar para o perfil
          </button>

          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-4">
            Configurações de Notificações
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Escolha quais notificações você deseja receber
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                Configurações salvas com sucesso!
              </p>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm divide-y divide-zinc-200 dark:divide-zinc-700">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {type.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(type.key)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${
                      settings[type.key]
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    }
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 rounded-full transition-transform
                      ${
                        settings[type.key]
                          ? "translate-x-6 bg-white"
                          : "translate-x-1 bg-zinc-400 dark:bg-zinc-500"
                      }
                    `}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
