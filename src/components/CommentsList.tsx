"use client";

import {
  Edit,
  MessageSquare,
  MoreVertical,
  Reply,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import CommentForm from "./CommentForm";

interface Comment {
  id: number;
  shared_deck_id: number;
  user_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  replies?: Comment[];
}

interface CommentsListProps {
  sharedDeckId: number;
  currentUserId?: number;
}

export default function CommentsList({
  sharedDeckId,
  currentUserId = 1,
}: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedDeckId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shared-decks/${sharedDeckId}/comments`);
      if (res.ok) {
        const data = await res.json();
        // Organizar comentários em hierarquia
        const organized = organizeComments(data);
        setComments(organized);
      }
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // Primeiro, criar mapa de todos os comentários
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Depois, organizar hierarquia
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Tem certeza que deseja deletar este comentário?")) return;

    try {
      const res = await fetch(`/api/shared-decks/${sharedDeckId}/comments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment_id: commentId }),
      });

      if (!res.ok) {
        throw new Error("Erro ao deletar comentário");
      }

      // Recarregar comentários
      await loadComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar comentário");
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/shared-decks/${sharedDeckId}/comments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: commentId,
          content: editContent.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao editar comentário");
      }

      // Recarregar e limpar estado de edição
      await loadComments();
      setEditingComment(null);
      setEditContent("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao editar comentário");
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isOwner = comment.user_id === currentUserId;
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div
        key={comment.id}
        className={`${depth > 0 ? "ml-8 mt-4" : "mt-6 first:mt-0"}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
            {comment.user.name.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {comment.user.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    (editado)
                  </span>
                )}
              </div>

              {/* Actions menu */}
              {isOwner && (
                <div className="relative group">
                  <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Deletar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Comment content or edit form */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-50 text-sm resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent("");
                    }}
                    className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-4 mt-3">
                  <button className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    Curtir
                  </button>
                  {depth < 3 && (
                    <button
                      onClick={() =>
                        setReplyingTo(isReplying ? null : comment.id)
                      }
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" />
                      Responder
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-3">
                <CommentForm
                  sharedDeckId={sharedDeckId}
                  parentCommentId={comment.id}
                  onCommentAdded={() => {
                    loadComments();
                    setReplyingTo(null);
                  }}
                  onCancel={() => setReplyingTo(null)}
                  placeholder={`Responder para ${comment.user.name}...`}
                  autoFocus
                />
              </div>
            )}

            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) =>
                  renderComment(reply, depth + 1)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New comment form */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comentários ({comments.length})
        </h3>
        <CommentForm
          sharedDeckId={sharedDeckId}
          onCommentAdded={loadComments}
        />
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
          <MessageSquare className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-600 dark:text-zinc-400">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
