import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
import type { Notification, NotificationCreate } from "@/types/globals";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications
 * Lista notificações do usuário autenticado
 * Query params:
 * - is_read: "0" (não lidas), "1" (lidas), undefined (todas)
 * - limit: número máximo de resultados (padrão: 50)
 * - offset: offset para paginação (padrão: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("is_read");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = `
      SELECT *
      FROM notifications
      WHERE user_id = ?
    `;
    const params: (number | string)[] = [user.id];

    // Filtro por status de leitura
    if (isRead !== null) {
      query += ` AND is_read = ?`;
      params.push(parseInt(isRead, 10));
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const notifications = db.prepare(query).all(...params) as Notification[];

    // Contar total de não lidas
    const unreadCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0"
      )
      .get(user.id) as { count: number };

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Cria uma nova notificação
 * Body: NotificationCreate
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as NotificationCreate;

    // Validação básica
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: "Campos obrigatórios: type, title, message" },
        { status: 400 }
      );
    }

    // Validar tipo de notificação
    const validTypes = ["deck_shared", "comment", "comment_reply", "system"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Tipo de notificação inválido" },
        { status: 400 }
      );
    }

    // Inserir notificação
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.user_id,
      body.type,
      body.title,
      body.message,
      body.related_id || null,
      body.related_type || null,
      body.action_url || null
    );

    // Buscar notificação criada
    const notification = db
      .prepare("SELECT * FROM notifications WHERE id = ?")
      .get(result.lastInsertRowid) as Notification;

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Limpa todas as notificações lidas do usuário
 * Ou deleta múltiplas notificações por IDs
 * Query params:
 * - ids: "1,2,3" (IDs separados por vírgula)
 * - read_only: "true" (limpar apenas lidas)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const readOnly = searchParams.get("read_only") === "true";

    if (idsParam) {
      // Deletar notificações específicas
      const ids = idsParam.split(",").map((id) => parseInt(id.trim(), 10));

      if (ids.length === 0) {
        return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
      }

      const placeholders = ids.map(() => "?").join(",");
      const stmt = db.prepare(`
        DELETE FROM notifications
        WHERE id IN (${placeholders}) AND user_id = ?
      `);

      const result = stmt.run(...ids, user.id);

      return NextResponse.json({
        message: "Notificações deletadas com sucesso",
        deleted: result.changes,
      });
    } else {
      // Limpar todas as notificações (ou apenas lidas)
      let query = "DELETE FROM notifications WHERE user_id = ?";
      const params: number[] = [user.id];

      if (readOnly) {
        query += " AND is_read = 1";
      }

      const result = db.prepare(query).run(...params);

      return NextResponse.json({
        message: readOnly
          ? "Notificações lidas limpas com sucesso"
          : "Todas as notificações limpas com sucesso",
        deleted: result.changes,
      });
    }
  } catch (error) {
    console.error("Erro ao deletar notificações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
