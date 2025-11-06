import { statements } from "@/lib/db";
import { notifyCommentReply, notifyNewComment } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

// Usuário padrão (ID 1)
const DEFAULT_USER_ID = 1;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const sharedDeckId = parseInt(idParam);

    if (isNaN(sharedDeckId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Buscar comentários do deck compartilhado
    const comments = statements.getDeckComments.all(sharedDeckId) as Array<{
      id: number;
      shared_deck_id: number;
      user_id: number;
      comment: string;
      parent_comment_id: number | null;
      created_at: string;
      updated_at: string;
      user_name: string;
      user_email: string;
    }>;

    // Mapear para incluir informações do usuário
    const commentsWithUser = comments.map((c) => ({
      id: c.id,
      shared_deck_id: c.shared_deck_id,
      user_id: c.user_id,
      content: c.comment,
      parent_comment_id: c.parent_comment_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      user: {
        id: c.user_id,
        name: c.user_name,
        email: c.user_email,
      },
    }));

    return NextResponse.json(commentsWithUser);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const sharedDeckId = parseInt(idParam);

    if (isNaN(sharedDeckId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { content, parent_comment_id } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o deck compartilhado existe e permite comentários
    const sharedDeck = statements.getSharedDeck.get(sharedDeckId);
    if (!sharedDeck) {
      return NextResponse.json(
        { error: "Deck compartilhado não encontrado" },
        { status: 404 }
      );
    }

    // Criar comentário
    const result = statements.createDeckComment.run(
      sharedDeckId,
      DEFAULT_USER_ID,
      content.trim(),
      parent_comment_id || null
    );

    const newComment = statements.getDeckComment.get(result.lastInsertRowid);

    // Buscar informações para notificação
    const sharedDeckData = statements.getSharedDeck.get(sharedDeckId) as {
      deck_id: number;
      community_id: number;
    };

    if (sharedDeckData) {
      const deckData = statements.getDeck.get(
        sharedDeckData.deck_id,
        DEFAULT_USER_ID
      ) as { title: string } | undefined;

      if (deckData) {
        if (parent_comment_id) {
          // Notificar autor do comentário pai (resposta)
          notifyCommentReply({
            repliedBy: DEFAULT_USER_ID,
            parentCommentId: parent_comment_id,
            deckTitle: deckData.title,
            reply: content.trim(),
            communityId: sharedDeckData.community_id,
          });
        } else {
          // Notificar dono do deck (novo comentário)
          notifyNewComment({
            commentedBy: DEFAULT_USER_ID,
            sharedDeckId,
            deckTitle: deckData.title,
            comment: content.trim(),
            communityId: sharedDeckData.community_id,
          });
        }
      }
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const sharedDeckId = parseInt(idParam);

    if (isNaN(sharedDeckId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { comment_id, content } = await request.json();

    if (!comment_id || !content || !content.trim()) {
      return NextResponse.json(
        { error: "ID do comentário e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o comentário existe e pertence ao usuário
    const commentData = statements.getDeckComment.get(comment_id) as
      | {
          id: number;
          user_id: number;
          comment: string;
        }
      | undefined;

    if (!commentData) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      );
    }

    if (commentData.user_id !== DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar este comentário" },
        { status: 403 }
      );
    }

    // Atualizar comentário
    statements.updateDeckComment.run(content.trim(), comment_id);

    const updatedComment = statements.getDeckComment.get(comment_id) as {
      id: number;
      comment: string;
      updated_at: string;
    };

    return NextResponse.json({
      id: updatedComment.id,
      content: updatedComment.comment,
      updated_at: updatedComment.updated_at,
    });
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const sharedDeckId = parseInt(idParam);

    if (isNaN(sharedDeckId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { comment_id } = await request.json();

    if (!comment_id) {
      return NextResponse.json(
        { error: "ID do comentário é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o comentário existe e pertence ao usuário
    const commentData = statements.getDeckComment.get(comment_id) as
      | {
          id: number;
          user_id: number;
          comment: string;
        }
      | undefined;

    if (!commentData) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      );
    }

    if (commentData.user_id !== DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: "Você não tem permissão para deletar este comentário" },
        { status: 403 }
      );
    }

    // Deletar comentário (CASCADE vai remover respostas)
    statements.deleteDeckComment.run(comment_id);

    return NextResponse.json({ message: "Comentário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
