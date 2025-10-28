/**
 * Card DTO - Interface cho flashcard với đầy đủ thông tin SM-2
 */
export interface CardDTO {
  id: number;
  frontText: string;
  backText: string;
  
  // Alias properties for backward compatibility
  front: string;                    // Alias for frontText
  back: string;                     // Alias for backText
  
  // Thông tin cho thuật toán SM-2 (Spaced Repetition)
  repetitions: number;              // Số lần ôn tập thành công liên tiếp
  easinessFactor: number;           // Hệ số độ khó (1.3+)
  interval: number;                 // Khoảng thời gian đến lần ôn tập tiếp theo (ngày)
  nextReviewDate: string | Date;    // Ngày ôn tập tiếp theo
  
  // Thông tin bổ sung
  createdAt?: string | Date;        // Ngày tạo thẻ
  lastReviewedAt?: string | Date;   // Lần ôn tập gần nhất
  totalReviews?: number;            // Tổng số lần đã ôn tập
  averageQuality?: number;          // Điểm chất lượng trung bình
  
  // Deck relationship
  deckId?: string | number;         // ID của deck chứa thẻ này
  deckName?: string;                // Tên deck chứa thẻ này
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

/**
 * Review Card Request - Dữ liệu gửi khi ôn tập thẻ
 */
export interface ReviewCardRequest {
  cardId: number;                   // ID của thẻ được ôn tập
  quality: number;                  // Đánh giá chất lượng 0-5
  reviewedAt?: string | Date;       // Thời gian ôn tập
}

/**
 * Review Card Response - Dữ liệu trả về sau khi ôn tập
 */
export interface ReviewCardResponse {
  cardId: number;
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string | Date;
  message?: string;                 // Thông báo kết quả
}


