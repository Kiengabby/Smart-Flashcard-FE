/**
 * Challenge Model Interfaces
 */

export interface Challenge {
  id: number;
  status: ChallengeStatus;
  totalQuestions: number;
  timeLimit: number;
  
  // User information
  challenger: {
    id: number;
    displayName: string;
    email: string;
    avatar?: string;
  };
  opponent: {
    id: number;
    displayName: string;
    email: string;
    avatar?: string;
  };
  
  // Deck information
  deck: {
    id: number;
    name: string;
    description?: string;
    cardCount?: number;
  };
  
  // Scores and timing
  challengerScore?: number;
  challengerTime?: number;
  opponentScore?: number;
  opponentTime?: number;
  
  // Winner information
  winnerId?: number;
  winnerName?: string;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date | null;
  
  // Status flags
  isTie?: boolean;
  expired?: boolean;
  pending?: boolean;
  completed?: boolean;
  rejected?: boolean;
  accepted?: boolean;
  
  // Legacy fields for backward compatibility
  deckId?: number;
  deckName?: string;
  challengerUsername?: string;
  opponentUsername?: string;
}

export enum ChallengeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  timestamp?: string;
}

export interface CreateChallengeRequest {
  opponentId: number;
  deckId: number;
  totalQuestions?: number;
  timeLimit?: number;
}

export interface RespondToChallengeRequest {
  accept: boolean;
}
