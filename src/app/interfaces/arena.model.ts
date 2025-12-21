/**
 * Arena Session Model
 * Represents an arena game session
 * 
 * @author Minh Kien
 * @version 1.0.0
 * @since 2025-12-17
 */

export interface ArenaSession {
  sessionId: number;
  deckId: number;
  deckName: string;
  totalQuestions: number;
  timeLimit: number; // seconds
  questions: ArenaQuestion[];
}

export interface ArenaQuestion {
  cardId: number;
  questionType: 'LISTENING' | 'DEFINITION';
  audioUrl?: string;
  questionText: string;
  options: string[]; // A, B, C, D
  correctAnswer: string; // Đáp án đúng để frontend check
}

export interface ArenaAnswer {
  cardId: number;
  selectedAnswer: string;
  timeSpent?: number;
}

export interface ArenaSubmitRequest {
  answers: ArenaAnswer[];
  totalTimeUsed: number; // seconds
}

export interface ArenaResult {
  sessionId: number;
  deckId: number; // ✅ Added for frontend routing
  
  // Score breakdown
  baseScore: number;
  timeBonus: number;
  accuracyBonus: number;
  streakBonus: number;
  finalScore: number;
  
  // Results
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  accuracyPercentage: number;
  
  timeUsed: number;
  timeLimit: number;
  
  // Ranking
  rank: number;
  previousRank: number;
  rankChange: number; // positive = improved
  
  // Achievements
  isPerfectScore: boolean;
  isNewPersonalBest: boolean;
  isTopThree: boolean;
}

export interface ArenaInfo {
  // Deck info
  deckId: number;
  deckName: string;
  deckDescription: string;
  deckCardCount: number;
  
  // Statistics
  totalPlayers: number;
  totalSessions: number;
  highestScore: number;
  averageScore: number;
  
  // Top players
  topPlayers: ArenaPlayer[];
  
  // Current user stats
  currentUserStats: ArenaUserStats;
}

export interface ArenaPlayer {
  userId: number;
  displayName: string;
  email: string;
  avatar: string;
  rank: number;
  bestScore: number;
  totalAttempts: number;
  averageScore: number;
  lastPlayedAt: Date;
}

export interface ArenaUserStats {
  rank: number;
  bestScore: number;
  totalAttempts: number;
  averageScore: number;
  hasPlayed: boolean;
}

export interface UserRankingAlert {
  deckId: number;
  deckName: string;
  currentRank: number;
  previousRank: number;
  totalPlayers: number;
  rankChange: number; // positive = improved, negative = dropped
  topPlayerName: string;
  topPlayerScore: number;
  userScore: number;
  pointsBehind: number; // points behind #1
  playersAhead: number; // number of players ahead
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
