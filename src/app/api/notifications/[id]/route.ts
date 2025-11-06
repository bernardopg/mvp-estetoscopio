import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
import type { Notification, NotificationUpdate } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/notifications/[id]
 * Atualiza uma notificação (marcar como lida/não lida)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se a notificação existe e pertence ao usuário
    const existingNotification = db
      .prepare("SELECT * FROM notifications WHERE id = ? AND user_id = ?")
      .get(notificationId, user.id) as Notification | undefined;

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as NotificationUpdate;

    // Validar campos
    if (
      body.is_read !== undefined &&
      body.is_read !== 0 &&
      body.is_read !== 1
    ) {
      return NextResponse.json(
        { error: "Valor de is_read inválido (deve ser 0 ou 1)" },
        { status: 400 }
      );
    }

    // Atualizar notificação
    if (body.is_read !== undefined) {
      db.prepare("UPDATE notifications SET is_read = ? WHERE id = ?").run(
        body.is_read,
        notificationId
      );
    }

    // Buscar notificação atualizada
    const updatedNotification = db
      .prepare("SELECT * FROM notifications WHERE id = ?")
      .get(notificationId) as Notification;

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Deleta uma notificação específica
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Deletar notificação (apenas se pertencer ao usuário)
    const result = db
      .prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?")
      .run(notificationId, user.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notificação deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
