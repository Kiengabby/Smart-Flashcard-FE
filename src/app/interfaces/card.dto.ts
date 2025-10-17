/**
 * Card DTO - Interface cho flashcard
 */
export interface CardDTO {
  id: number;
  frontText: string;
  backText: string;
  
  // Thông tin cho thuật toán SM-2 (Spaced Repetition)
  repetitions?: number;
  easinessFactor?: number;
  interval?: number;
  nextReviewDate?: string | Date;
}

/**
 * Create Card Request
 */
export interface CreateCardRequest {
  frontText: string;
  backText: string;
}

/**
 * Update Card Request
 */
export interface UpdateCardRequest {
  frontText: string;
  backText: string;
}


