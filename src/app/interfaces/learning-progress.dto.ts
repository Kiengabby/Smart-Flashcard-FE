// Learning Progress DTO - Progressive Learning System
// Tracks user progress through 4 mandatory learning modes

export interface LearningProgressDTO {
  id: number;
  deckId: number;
  userId: string;
  
  // Learning Mode Status
  flashcardCompleted: boolean;
  flashcardCompletedAt?: string;
  flashcardScore?: number; // 0-100
  
  quizCompleted: boolean;
  quizCompletedAt?: string;
  quizScore?: number; // 0-100
  
  listeningCompleted: boolean;
  listeningCompletedAt?: string;
  listeningScore?: number; // 0-100
  
  writingCompleted: boolean;
  writingCompletedAt?: string;
  writingScore?: number; // 0-100
  
  // Overall Progress
  overallProgress: number; // 0-100 (25% per mode)
  isFullyCompleted: boolean; // All 4 modes completed
  completedAt?: string; // When all modes are done
  
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLearningProgressRequest {
  mode: 'flashcard' | 'quiz' | 'listening' | 'writing';
  completed: boolean;
  score?: number;
}

export interface LearningModeStatus {
  mode: 'flashcard' | 'quiz' | 'listening' | 'writing';
  name: string;
  nameVi: string;
  icon: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  score?: number;
  completedAt?: string;
  order: number;
  color: string;
  gradient: string;
}
