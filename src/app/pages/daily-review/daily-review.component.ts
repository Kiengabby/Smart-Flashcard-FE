import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { DailyReviewService, ReviewCard, ReviewSessionResponse } from '../../services/daily-review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-daily-review',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzTooltipModule,
    NzEmptyModule,
    NzSpinModule
  ],
  providers: [NzMessageService],
  templateUrl: './daily-review.component.html',
  styleUrls: ['./daily-review.component.scss']
})
export class DailyReviewComponent implements OnInit, OnDestroy {
  // Expose Math for template
  Math = Math;
  
  // View states
  currentView: 'overview' | 'review' = 'overview';
  
  // Overview data
  overview: any = null;
  overviewLoading = true;
  
  // Session data
  sessionId: string | null = null;
  cards: ReviewCard[] = [];
  private _currentIndex = 0;
  isFlipped = false;
  private _isLoading = true;

  // Stats tracking
  completedCount = 0;
  totalReviewed = 0;
  qualitySum = 0;
  
  // Session performance tracking (REAL DATA)
  sessionStats = {
    cardsReviewed: 0,
    correctCards: 0,      // quality >= 3
    totalTime: 0,         // seconds
    perfectStreak: 0,     // current streak of quality >= 4
    maxPerfectStreak: 0,  // max streak in this session
    startTime: 0          // timestamp when started
  };
  
  // Track current card start time
  private cardStartTime = 0;

  // Getters for reactive UI
  get currentIndex(): number {
    return this._currentIndex;
  }

  set currentIndex(value: number) {
    this._currentIndex = value;
    this.cdr.detectChanges();
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
    this.cdr.detectChanges();
  }

  get currentCard(): ReviewCard | undefined {
    return this.cards[this._currentIndex];
  }

  get progress(): number {
    if (this.cards.length === 0) return 0;
    return Math.round(((this._currentIndex + 1) / this.cards.length) * 100);
  }

  get isFirstCard(): boolean {
    return this._currentIndex === 0;
  }

  get isLastCard(): boolean {
    return this._currentIndex === this.cards.length - 1;
  }

  get averageQuality(): number {
    if (this.totalReviewed === 0) return 0;
    return this.qualitySum / this.totalReviewed;
  }
  
  // Session Performance Getters (REAL DATA)
  get accuracyRate(): number {
    if (this.sessionStats.cardsReviewed === 0) return 0;
    return Math.round((this.sessionStats.correctCards / this.sessionStats.cardsReviewed) * 100);
  }
  
  get averageTimePerCard(): number {
    if (this.sessionStats.cardsReviewed === 0) return 0;
    return Math.round(this.sessionStats.totalTime / this.sessionStats.cardsReviewed);
  }
  
  get sessionProgressPercent(): number {
    if (this.cards.length === 0) return 0;
    return Math.round((this.sessionStats.cardsReviewed / this.cards.length) * 100);
  }

  constructor(
    private router: Router,
    private dailyReviewService: DailyReviewService,
    private authService: AuthService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check authentication first
    if (!this.authService.isLoggedIn()) {
      console.warn('User not authenticated, redirecting to login');
      this.message.warning('Vui lòng đăng nhập để sử dụng chức năng này');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Load overview first
    this.loadOverview();
  }

  /**
   * Load daily review overview
   */
  loadOverview(): void {
    this.overviewLoading = true;
    this.dailyReviewService.getDailyOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.overviewLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading overview:', error);
        this.overviewLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Start review session
   */
  startReview(): void {
    this.currentView = 'review';
    // Initialize review session
    this.cards = [];
    this._currentIndex = 0;
    this.isFlipped = false;
    this.completedCount = 0;
    this.totalReviewed = 0;
    this.qualitySum = 0;
    
    // Reset session stats
    this.sessionStats = {
      cardsReviewed: 0,
      correctCards: 0,
      totalTime: 0,
      perfectStreak: 0,
      maxPerfectStreak: 0,
      startTime: Date.now()
    };

    // Load cards to review
    setTimeout(() => {
      this.loadReviewCards();
    }, 0);
  }

  ngOnDestroy(): void {
    // Complete session if user leaves before finishing
    if (this.sessionId && this.totalReviewed < this.cards.length) {
      this.dailyReviewService.completeSession(this.sessionId).subscribe({
        error: (error) => console.error('Error completing session on destroy:', error)
      });
    }
  }

  /**
   * Load cards that need to be reviewed today
   */
  loadReviewCards(): void {
    this._isLoading = true;
    this.cdr.detectChanges();

    console.log('Starting daily review session...');
    
    this.dailyReviewService.startReviewSession().subscribe({
      next: (response: ReviewSessionResponse) => {
        console.log('Review session started:', response);
        
        if (!response || !response.cards || response.cards.length === 0) {
          console.log('No cards to review today');
          this._isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.sessionId = response.sessionId;
        this.cards = response.cards;
        this._isLoading = false;
        
        // Start timer for first card
        this.cardStartTime = Date.now();
        
        this.cdr.detectChanges();
        
        this.message.success(`Có ${this.cards.length} thẻ cần ôn tập hôm nay!`);
      },
      error: (error) => {
        console.error('Error loading review cards:', error);
        this.message.error('Không thể tải thẻ ôn tập. Vui lòng thử lại sau.');
        this._isLoading = false;
        this.cdr.detectChanges();
        
        // Redirect to dashboard on error
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 2000);
      }
    });
  }

  /**
   * Flip the current card
   */
  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  /**
   * Move to next card
   */
  nextCard(): void {
    if (!this.isLastCard) {
      this._currentIndex++;
      this.isFlipped = false;
      
      // Reset timer for new card
      this.cardStartTime = Date.now();
      
      this.cdr.detectChanges();
    }
  }

  /**
   * Move to previous card
   */
  previousCard(): void {
    if (!this.isFirstCard) {
      this._currentIndex--;
      this.isFlipped = false;
      
      // Reset timer when going back
      this.cardStartTime = Date.now();
      
      this.cdr.detectChanges();
    }
  }

  /**
   * Rate the current card using SM-2 quality scale (0-5)
   * 0: Quên hoàn toàn
   * 1: Sai hoàn toàn
   * 2: Sai nhưng nhớ được khi xem đáp án
   * 3: Đúng nhưng khó
   * 4: Đúng
   * 5: Hoàn hảo
   */
  rateCard(quality: number): void {
    if (!this.currentCard || !this.sessionId) return;

    const cardId = this.currentCard.cardId || this.currentCard.id;
    
    // ✅ Calculate REAL time spent on THIS card (in seconds)
    const timeSpent = Math.round((Date.now() - this.cardStartTime) / 1000);
    
    // Submit review to backend
    this.dailyReviewService.reviewCard(this.sessionId, cardId, {
      quality: quality,
      responseTime: timeSpent
    }).subscribe({
      next: () => {
        // Update legacy stats
        this.totalReviewed++;
        this.qualitySum += quality;
        
        if (quality >= 3) {
          this.completedCount++;
        }
        
        // ✅ Update SESSION STATS (REAL DATA)
        this.sessionStats.cardsReviewed++;
        this.sessionStats.totalTime += timeSpent;
        
        // Track correct/incorrect
        if (quality >= 3) {
          this.sessionStats.correctCards++;
        }
        
        // Track perfect streak (quality >= 4)
        if (quality >= 4) {
          this.sessionStats.perfectStreak++;
          if (this.sessionStats.perfectStreak > this.sessionStats.maxPerfectStreak) {
            this.sessionStats.maxPerfectStreak = this.sessionStats.perfectStreak;
          }
        } else {
          this.sessionStats.perfectStreak = 0; // Reset streak
        }

        // Show feedback
        this.showRatingFeedback(quality);

        // Move to next card or complete
        setTimeout(() => {
          if (!this.isLastCard) {
            this.nextCard(); // Timer reset happens in nextCard()
          } else {
            this.completeReview();
          }
        }, 300);
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.message.error('Không thể lưu kết quả ôn tập');
      }
    });
  }

  /**
   * Show feedback message based on quality rating
   */
  private showRatingFeedback(quality: number): void {
    const messages: { [key: number]: string } = {
      0: '💪 Không sao, hãy cố gắng thêm!',
      1: '📚 Cần ôn tập thêm!',
      2: '👍 Đang tiến bộ!',
      3: '⭐ Tốt lắm!',
      4: '🔥 Rất tốt!',
      5: '🏆 Hoàn hảo!'
    };

    this.message.success(messages[quality] || 'Đã ghi nhận!');
  }

  /**
   * Complete the review session
   */
  private completeReview(): void {
    if (!this.sessionId) return;

    this.dailyReviewService.completeSession(this.sessionId).subscribe({
      next: () => {
        const accuracy = Math.round((this.averageQuality / 5) * 100);
        this.message.success(`🎉 Hoàn thành! Độ chính xác: ${accuracy}%`, {
          nzDuration: 3000
        });
        
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error completing session:', error);
        // Still navigate back even if completion fails
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 2000);
      }
    });
  }

  /**
   * Restart the review session
   */
  restart(): void {
    this._currentIndex = 0;
    this.isFlipped = false;
    
    // Reset timer for first card
    this.cardStartTime = Date.now();
    
    this.cdr.detectChanges();
  }

  /**
   * Go back to dashboard
   */
  goBack(): void {
    // Ask for confirmation if there are unreviewed cards
    if (this.totalReviewed < this.cards.length && this.cards.length > 0) {
      const confirmLeave = confirm('Bạn có chắc muốn thoát? Tiến độ sẽ được lưu lại.');
      if (!confirmLeave) return;
    }
    
    this.router.navigate(['/app/dashboard']);
  }

  /**
   * Get text size class based on text length
   */
  getTextSizeClass(text: string): string {
    if (!text) return '';
    
    const length = text.length;
    if (length <= 10) return 'text-xl';
    if (length <= 30) return 'text-lg';
    if (length <= 50) return 'text-md';
    return 'text-sm';
  }

  /**
   * Get difficulty badge color
   */
  getDifficultyColor(): string {
    if (!this.currentCard) return 'default';
    
    const ef = this.currentCard.easinessFactor || 2.5;
    if (ef < 2.0) return 'error';
    if (ef > 2.8) return 'success';
    return 'warning';
  }

  /**
   * Get difficulty text
   */
  getDifficultyText(): string {
    if (!this.currentCard) return 'Trung bình';
    
    const ef = this.currentCard.easinessFactor || 2.5;
    if (ef < 2.0) return 'Khó';
    if (ef > 2.8) return 'Dễ';
    return 'Trung bình';
  }
}
