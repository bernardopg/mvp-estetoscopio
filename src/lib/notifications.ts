import db from "@/lib/db";
import type { NotificationCreate } from "@/types/globals";

/**
 * Cria uma nova notificação no banco de dados
 */
export function createNotification(data: NotificationCreate): number {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.user_id,
      data.type,
      data.title,
      data.message,
      data.related_id || null,
      data.related_type || null,
      data.action_url || null
    );

    return result.lastInsertRowid as number;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    throw error;
  }
}

/**
 * Cria notificação quando um deck é compartilhado em uma comunidade
 */
export function notifyDeckShared(params: {
  sharedBy: number;
  communityId: number;
  deckId: number;
  deckTitle: string;
  communityName: string;
}) {
  try {
    // Buscar todos os membros da comunidade (exceto quem compartilhou)
    const members = db
      .prepare(
        `
      SELECT user_id FROM community_members
      WHERE community_id = ? AND user_id != ?
    `
      )
      .all(params.communityId, params.sharedBy) as Array<{ user_id: number }>;

    // Criar notificação para cada membro
    members.forEach((member) => {
      createNotification({
        user_id: member.user_id,
        type: "deck_shared",
        title: "Novo baralho compartilhado",
        message: `O baralho "${params.deckTitle}" foi compartilhado na comunidade "${params.communityName}".`,
        related_id: params.deckId,
        related_type: "deck",
        action_url: `/comunidades/${params.communityId}`,
      });
    });

    return members.length;
  } catch (error) {
    console.error("Erro ao notificar compartilhamento:", error);
    return 0;
  }
}

/**
 * Cria notificação quando alguém comenta em um deck compartilhado
 */
export function notifyNewComment(params: {
  commentedBy: number;
  sharedDeckId: number;
  deckTitle: string;
  comment: string;
  communityId: number;
}) {
  try {
    // Buscar o dono do deck
    const deckOwner = db
      .prepare(
        `
      SELECT d.user_id
      FROM shared_decks sd
      JOIN decks d ON sd.deck_id = d.id
      WHERE sd.id = ?
    `
      )
      .get(params.sharedDeckId) as { user_id: number } | undefined;

    // Notificar o dono do deck (se não for quem comentou)
    if (deckOwner && deckOwner.user_id !== params.commentedBy) {
      createNotification({
        user_id: deckOwner.user_id,
        type: "comment",
        title: "Novo comentário no seu baralho",
        message: `Alguém comentou no baralho "${
          params.deckTitle
        }": "${params.comment.substring(0, 100)}${
          params.comment.length > 100 ? "..." : ""
        }"`,
        related_id: params.sharedDeckId,
        related_type: "deck",
        action_url: `/comunidades/${params.communityId}`,
      });
    }

    return deckOwner ? 1 : 0;
  } catch (error) {
    console.error("Erro ao notificar comentário:", error);
    return 0;
  }
}

/**
 * Cria notificação quando alguém responde a um comentário
 */
export function notifyCommentReply(params: {
  repliedBy: number;
  parentCommentId: number;
  deckTitle: string;
  reply: string;
  communityId: number;
}) {
  try {
    // Buscar o autor do comentário pai
    const parentComment = db
      .prepare(
        `
      SELECT user_id FROM deck_comments
      WHERE id = ?
    `
      )
      .get(params.parentCommentId) as { user_id: number } | undefined;

    // Notificar o autor do comentário pai (se não for quem respondeu)
    if (parentComment && parentComment.user_id !== params.repliedBy) {
      createNotification({
        user_id: parentComment.user_id,
        type: "comment_reply",
        title: "Nova resposta ao seu comentário",
        message: `Alguém respondeu ao seu comentário no baralho "${
          params.deckTitle
        }": "${params.reply.substring(0, 100)}${
          params.reply.length > 100 ? "..." : ""
        }"`,
        related_id: params.parentCommentId,
        related_type: "comment",
        action_url: `/comunidades/${params.communityId}`,
      });
    }

    return parentComment ? 1 : 0;
  } catch (error) {
    console.error("Erro ao notificar resposta:", error);
    return 0;
  }
}
