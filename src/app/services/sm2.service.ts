import { Injectable } from '@angular/core';

/**
 * SM-2 Algorithm Result Interface
 */
export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * SM-2 Input Parameters Interface
 */
export interface SM2Input {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  quality: number; // 0-5 rating
}

/**
 * Review Quality Enum
 */
export enum ReviewQuality {
  BLACKOUT = 0,        // Quên hoàn toàn
  INCORRECT = 1,       // Sai hoàn toàn  
  INCORRECT_EASY = 2,  // Sai nhưng nhớ được một phần
  CORRECT_HARD = 3,    // Đúng nhưng khó khăn
  CORRECT = 4,         // Đúng
  PERFECT = 5          // Hoàn hảo, rất dễ
}

/**
 * SM-2 Spaced Repetition Service
 * 
 * Thuật toán SuperMemo-2 được phát triển bởi Piotr Wozniak
 * để tối ưu hóa việc ôn tập với khoảng cách thời gian thích hợp
 */
@Injectable({
  providedIn: 'root'
})
export class SM2Service {

  // Default values for new cards
  private readonly DEFAULT_EASINESS_FACTOR = 2.5;
  private readonly DEFAULT_INTERVAL = 1;
  private readonly DEFAULT_REPETITIONS = 0;

  constructor() { }

  /**
   * Tính toán lịch ôn tập tiếp theo dựa trên thuật toán SM-2
   * 
   * @param input - Thông tin thẻ hiện tại và đánh giá chất lượng
   * @returns SM2Result - Kết quả tính toán cho lần ôn tập tiếp theo
   */
  calculateNextReview(input: SM2Input): SM2Result {
    let { easinessFactor, interval, repetitions, quality } = input;

    // Validate quality rating
    if (quality < 0 || quality > 5) {
      throw new Error('Quality rating must be between 0 and 5');
    }

    // If quality < 3, reset the learning process
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      // Increment repetitions for successful reviews
      repetitions += 1;

      // Calculate new interval based on repetitions
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
    }

    // Update easiness factor
    easinessFactor = this.calculateNewEasinessFactor(easinessFactor, quality);

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      easinessFactor,
      interval,
      repetitions,
      nextReviewDate
    };
  }

  /**
   * Tính toán easiness factor mới
   * 
   * @param currentEF - Easiness factor hiện tại
   * @param quality - Đánh giá chất lượng (0-5)
   * @returns Easiness factor mới
   */
  private calculateNewEasinessFactor(currentEF: number, quality: number): number {
    const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure EF doesn't go below 1.3
    return Math.max(newEF, 1.3);
  }

  /**
   * Khởi tạo thông tin SM-2 cho thẻ mới
   * 
   * @returns SM-2 parameters mặc định cho thẻ mới
   */
  initializeCard(): Omit<SM2Result, 'nextReviewDate'> & { nextReviewDate: Date } {
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + this.DEFAULT_INTERVAL);

    return {
      easinessFactor: this.DEFAULT_EASINESS_FACTOR,
      interval: this.DEFAULT_INTERVAL,
      repetitions: this.DEFAULT_REPETITIONS,
      nextReviewDate
    };
  }

  /**
   * Kiểm tra xem thẻ có cần ôn tập hôm nay không
   * 
   * @param nextReviewDate - Ngày ôn tập tiếp theo
   * @returns true nếu thẻ cần ôn tập hôm nay
   */
  isDueForReview(nextReviewDate: Date | string): boolean {
    const reviewDate = new Date(nextReviewDate);
    const today = new Date();
    
    // Reset time to start of day for accurate comparison
    reviewDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return reviewDate <= today;
  }

  /**
   * Tính toán số ngày đến lần ôn tập tiếp theo
   * 
   * @param nextReviewDate - Ngày ôn tập tiếp theo
   * @returns Số ngày (âm nếu đã quá hạn)
   */
  getDaysUntilReview(nextReviewDate: Date | string): number {
    const reviewDate = new Date(nextReviewDate);
    const today = new Date();
    
    // Reset time to start of day
    reviewDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Lấy text mô tả cho đánh giá chất lượng
   * 
   * @param quality - Đánh giá chất lượng (0-5)
   * @returns Text mô tả
   */
  getQualityDescription(quality: ReviewQuality): string {
    const descriptions = {
      [ReviewQuality.BLACKOUT]: 'Quên hoàn toàn',
      [ReviewQuality.INCORRECT]: 'Sai hoàn toàn',
      [ReviewQuality.INCORRECT_EASY]: 'Sai nhưng nhớ được một phần',
      [ReviewQuality.CORRECT_HARD]: 'Đúng nhưng khó khăn',
      [ReviewQuality.CORRECT]: 'Đúng',
      [ReviewQuality.PERFECT]: 'Hoàn hảo, rất dễ'
    };

    return descriptions[quality] || 'Không xác định';
  }

  /**
   * Tính toán thống kê học tập
   * 
   * @param cards - Danh sách thẻ
   * @returns Thống kê học tập
   */
  calculateStudyStats(cards: any[]): {
    totalCards: number;
    newCards: number;
    learningCards: number;
    matureCards: number;
    dueToday: number;
  } {
    const stats = {
      totalCards: cards.length,
      newCards: 0,
      learningCards: 0,
      matureCards: 0,
      dueToday: 0
    };

    cards.forEach(card => {
      if (!card.repetitions || card.repetitions === 0) {
        stats.newCards++;
      } else if (card.repetitions < 3) {
        stats.learningCards++;
      } else {
        stats.matureCards++;
      }

      if (card.nextReviewDate && this.isDueForReview(card.nextReviewDate)) {
        stats.dueToday++;
      }
    });

    return stats;
  }
}