import { getAuthUser } from "@/lib/auth";
import { statements } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface NotificationSettings {
  id?: number;
  user_id: number;
  email_notifications: number;
  community_notifications: number;
  comment_notifications: number;
  deck_share_notifications: number;
  new_follower_notifications: number;
  study_reminders: number;
  created_at?: string;
  updated_at?: string;
}

// GET /api/user/notification-settings - Obter configurações de notificações do usuário
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const settings = statements.getNotificationSettings.get(user.id) as
      | NotificationSettings
      | undefined;

    // Se não existir configurações, criar com valores padrão
    if (!settings) {
      statements.createNotificationSettings.run(
        user.id,
        1, // email_notifications
        1, // community_notifications
        1, // comment_notifications
        1, // deck_share_notifications
        1, // new_follower_notifications
        1 // study_reminders
      );

      const newSettings = statements.getNotificationSettings.get(
        user.id
      ) as NotificationSettings;

      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao buscar configurações de notificações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações de notificações" },
      { status: 500 }
    );
  }
}

// PUT /api/user/notification-settings - Atualizar configurações de notificações do usuário
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailNotifications,
      communityNotifications,
      commentNotifications,
      deckShareNotifications,
      newFollowerNotifications,
      studyReminders,
    } = body;

    // Validar dados
    if (
      typeof emailNotifications !== "boolean" ||
      typeof communityNotifications !== "boolean" ||
      typeof commentNotifications !== "boolean" ||
      typeof deckShareNotifications !== "boolean" ||
      typeof newFollowerNotifications !== "boolean" ||
      typeof studyReminders !== "boolean"
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Converter booleanos para inteiros (0 ou 1)
    const emailInt = emailNotifications ? 1 : 0;
    const communityInt = communityNotifications ? 1 : 0;
    const commentInt = commentNotifications ? 1 : 0;
    const deckShareInt = deckShareNotifications ? 1 : 0;
    const newFollowerInt = newFollowerNotifications ? 1 : 0;
    const studyRemindersInt = studyReminders ? 1 : 0;

    // Verificar se já existe configurações
    const existingSettings = statements.getNotificationSettings.get(user.id) as
      | NotificationSettings
      | undefined;

    if (existingSettings) {
      // Atualizar configurações existentes
      statements.updateNotificationSettings.run(
        emailInt,
        communityInt,
        commentInt,
        deckShareInt,
        newFollowerInt,
        studyRemindersInt,
        user.id
      );
    } else {
      // Criar novas configurações
      statements.createNotificationSettings.run(
        user.id,
        emailInt,
        communityInt,
        commentInt,
        deckShareInt,
        newFollowerInt,
        studyRemindersInt
      );
    }

    // Buscar configurações atualizadas
    const updatedSettings = statements.getNotificationSettings.get(
      user.id
    ) as NotificationSettings;

    return NextResponse.json({
      message: "Configurações atualizadas com sucesso",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações de notificações:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações de notificações" },
      { status: 500 }
    );
  }
}
