
export interface CommunityTipDTO {
  id: number;
  cardId: number;
  userId: number;
  userDisplayName: string;
  userAvatar?: string;
  content: string;
  likesCount: number;
  dislikesCount: number;
  isLikedByCurrentUser: boolean;
  isDislikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTipRequest {
  cardId: number;
  content: string;
}

export interface TipReactionRequest {
  tipId: number;
  reactionType: 'LIKE' | 'DISLIKE' | 'REMOVE';
}

export interface TipReactionResponse {
  success: boolean;
  likesCount: number;
  dislikesCount: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}
