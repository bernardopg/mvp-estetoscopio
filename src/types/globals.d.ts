declare module "*.css";

// Community types
export interface Community {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  is_private: number; // 0 = pública, 1 = privada
  member_count: number;
  deck_count: number;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  role?: string; // Papel do usuário na comunidade (quando vem de uma query com JOIN)
}

export interface CommunityMember {
  id: number;
  community_id: number;
  user_id: number;
  role: "member" | "moderator" | "admin";
  joined_at: string;
  name?: string; // Nome do usuário (quando vem de uma query com JOIN)
  email?: string;
  profile_picture?: string;
}

export interface SharedDeck {
  id: number;
  deck_id: number;
  community_id: number;
  shared_by: number;
  permission: "view" | "edit" | "clone";
  allow_comments: number; // 0 = não, 1 = sim
  downloads: number;
  created_at: string;
  updated_at: string;
  title?: string; // Título do deck (quando vem de uma query com JOIN)
  cards?: string; // Cards do deck (JSON)
  shared_by_name?: string; // Nome do usuário que compartilhou
}

export interface DeckComment {
  id: number;
  shared_deck_id: number;
  user_id: number;
  comment: string;
  parent_comment_id?: number;
  created_at: string;
  updated_at: string;
  name?: string; // Nome do usuário (quando vem de uma query com JOIN)
  profile_picture?: string;
  replies?: DeckComment[]; // Respostas aninhadas
}

// Notification types
export type NotificationType =
  | "deck_shared"
  | "comment"
  | "comment_reply"
  | "system";

export type NotificationRelatedType = "deck" | "comment" | "community" | "user";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: number;
  related_type?: NotificationRelatedType;
  is_read: number; // 0 = não lida, 1 = lida
  action_url?: string;
  created_at: string;
}

export interface NotificationCreate {
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  related_id?: number;
  related_type?: NotificationRelatedType;
  action_url?: string;
}

export interface NotificationUpdate {
  is_read?: number;
}

export interface NotificationSettings {
  user_id: number;
  deck_shared_enabled: boolean;
  comment_enabled: boolean;
  comment_reply_enabled: boolean;
  system_enabled: boolean;
}
