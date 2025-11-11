import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';

import { CardService } from '../../services/card.service';
import { SM2Service } from '../../services/sm2.service';
import { CardDTO, ReviewCardRequest, ReviewCardResponse } from '../../interfaces/card.dto';
import { QualityRatingComponent } from '../../components/quality-rating/quality-rating.component';

interface DailyReviewStats {
  totalDue: number;
  completed: number;
  remaining: number;
  streak: number;
  accuracy: number;
}

interface ReviewSession {
  id: string;
  deckId: string;
  deckName: string;
  cards: CardDTO[];
  currentIndex: number;
  showAnswer: boolean;
  stats: DailyReviewStats;
  startTime: Date;
}

@Component({
  selector: 'app-daily-review',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    QualityRatingComponent
  ],
  template: `
    <div class="daily-review-container">
      <!-- Header Section -->
      <div class="review-header">
        <div class="header-content">
          <div class="header-left">
            <button nz-button nzType="text" (click)="goBack()" class="back-button">
              <span nz-icon nzType="arrow-left"></span>
            </button>
            <div class="header-info">
              <h1 class="review-title">Ôn tập hàng ngày</h1>
              @if (reviewSession) {
                <p class="review-subtitle">{{ reviewSession.deckName }}</p>
              }
            </div>
          </div>
          
          @if (reviewSession) {
            <div class="progress-info">
              <div class="progress-stats">
                <span class="progress-text">
                  {{ reviewSession.currentIndex + 1 }}/{{ reviewSession.cards.length }}
                </span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="getProgressPercentage()">
                  </div>
                </div>
              </div>
              <div class="streak-info">
                <span nz-icon nzType="fire" nzTheme="fill"></span>
                {{ reviewSession.stats.streak }} ngày
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="loading-container">
          <nz-spin nzSize="large">
            <div class="loading-text">Đang tải thẻ ôn tập...</div>
          </nz-spin>
        </div>
      }

      <!-- Empty State -->
      @if (!loading && !reviewSession) {
        <div class="empty-container">
          <nz-empty 
            nzNotFoundImage="simple" 
            nzNotFoundContent="Không có thẻ nào cần ôn tập hôm nay">
            <div class="empty-actions">
              <button nz-button nzType="primary" (click)="goBack()">
                <span nz-icon nzType="home"></span>
                Về trang chủ
              </button>
            </div>
          </nz-empty>
        </div>
      }

      <!-- Review Session -->
      @if (!loading && reviewSession && getCurrentCard()) {
        <div class="review-content">
          <!-- Card Display -->
          <div class="card-container">
            <nz-card class="flashcard" [class.flipped]="reviewSession.showAnswer">
              <div class="card-side card-front">
                <div class="card-header">
                  <span class="card-type">Câu hỏi</span>
                  <div class="card-difficulty" [class]="getDifficultyClass()">
                    {{ getDifficultyText() }}
                  </div>
                </div>
                <div class="card-content">
                  <div class="card-text">{{ getCurrentCard()?.front }}</div>
                </div>
                <div class="card-actions">
                  <button 
                    nz-button 
                    nzType="primary" 
                    nzSize="large"
                    (click)="showAnswer()"
                    [disabled]="reviewSession.showAnswer">
                    <span nz-icon nzType="eye"></span>
                    Hiện đáp án
                  </button>
                </div>
              </div>

              @if (reviewSession.showAnswer) {
                <div class="card-side card-back">
                  <div class="card-header">
                    <span class="card-type">Đáp án</span>
                  </div>
                  <div class="card-content">
                    <div class="card-text">{{ getCurrentCard()?.back }}</div>
                  </div>
                </div>
              }
            </nz-card>
          </div>

          <!-- Quality Rating -->
          @if (reviewSession.showAnswer) {
            <div class="rating-container">
              <app-quality-rating
                [disabled]="false"
                [showDescription]="true"
                (qualitySelected)="onQualityRated($event)">
              </app-quality-rating>
            </div>
          }
        </div>
      }

      <!-- Review Complete -->
      @if (showCompleteScreen) {
        <div class="complete-container">
          <div class="complete-content">
            <div class="complete-icon">
              <span nz-icon nzType="trophy" nzTheme="fill"></span>
            </div>
            <h2 class="complete-title">Xuất sắc!</h2>
            <p class="complete-subtitle">Bạn đã hoàn thành phiên ôn tập hôm nay</p>
            
            <div class="complete-stats">
              <div class="stat-item">
                <div class="stat-value">{{ completedReviews }}</div>
                <div class="stat-label">Thẻ đã ôn</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ Math.round(averageQuality * 100) }}%</div>
                <div class="stat-label">Độ chính xác</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getTimeSpent() }}</div>
                <div class="stat-label">Thời gian</div>
              </div>
            </div>

            <div class="complete-actions">
              <button nz-button nzType="default" nzSize="large" (click)="goBack()">
                <span nz-icon nzType="home"></span>
                Về trang chủ
              </button>
              <button nz-button nzType="primary" nzSize="large" (click)="startNewReview()">
                <span nz-icon nzType="reload"></span>
                Ôn tập thêm
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './daily-review.component.scss'
})
export class DailyReviewComponent {
  private cardService = inject(CardService);
  private sm2Service = inject(SM2Service);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private router = inject(Router);

  loading = false;
  reviewSession: ReviewSession | null = null;
  showCompleteScreen = false;
  completedReviews = 0;
  averageQuality = 0;
  private qualitySum = 0;

  protected Math = Math;

  ngOnInit(): void {
    this.initializeDailyReview();
  }

  async initializeDailyReview(): Promise<void> {
    try {
      this.loading = true;
      
      // Get cards due for review
      const dueCards = await this.cardService.getCardsDueForReview().toPromise();
      
      if (!dueCards || dueCards.length === 0) {
        this.loading = false;
        return;
      }

      // Group cards by deck and create review session
      const deckGroups = this.groupCardsByDeck(dueCards);
      const firstDeck = Object.keys(deckGroups)[0];
      const deckCards = deckGroups[firstDeck];

      this.reviewSession = {
        id: this.generateSessionId(),
        deckId: (deckCards[0].deckId || '').toString(),
        deckName: deckCards[0].deckName || 'Bộ thẻ',
        cards: this.shuffleCards(deckCards),
        currentIndex: 0,
        showAnswer: false,
        stats: {
          totalDue: dueCards.length,
          completed: 0,
          remaining: dueCards.length,
          streak: await this.getStudyStreak(),
          accuracy: 0
        },
        startTime: new Date()
      };

    } catch (error) {
      console.error('Error initializing daily review:', error);
      this.message.error('Không thể tải dữ liệu ôn tập');
    } finally {
      this.loading = false;
    }
  }

  private groupCardsByDeck(cards: CardDTO[]): Record<string, CardDTO[]> {
    return cards.reduce((groups, card) => {
      const deckId = card.deckId || 'unknown';
      if (!groups[deckId]) {
        groups[deckId] = [];
      }
      groups[deckId].push(card);
      return groups;
    }, {} as Record<string, CardDTO[]>);
  }

  private shuffleCards(cards: CardDTO[]): CardDTO[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateSessionId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getStudyStreak(): Promise<number> {
    try {
      const stats = await this.cardService.getStudyStats().toPromise();
      return stats?.currentStreak || 0;
    } catch {
      return 0;
    }
  }

  getCurrentCard(): CardDTO | null {
    if (!this.reviewSession) return null;
    return this.reviewSession.cards[this.reviewSession.currentIndex] || null;
  }

  getProgressPercentage(): number {
    if (!this.reviewSession) return 0;
    return ((this.reviewSession.currentIndex + 1) / this.reviewSession.cards.length) * 100;
  }

  getDifficultyClass(): string {
    const card = this.getCurrentCard();
    if (!card) return 'easy';
    
    if (card.easinessFactor && card.easinessFactor < 2.0) return 'hard';
    if (card.easinessFactor && card.easinessFactor > 2.8) return 'easy';
    return 'medium';
  }

  getDifficultyText(): string {
    const difficultyClass = this.getDifficultyClass();
    switch (difficultyClass) {
      case 'hard': return 'Khó';
      case 'easy': return 'Dễ';
      default: return 'Trung bình';
    }
  }

  showAnswer(): void {
    if (this.reviewSession) {
      this.reviewSession.showAnswer = true;
    }
  }

  async onQualityRated(quality: number): Promise<void> {
    if (!this.reviewSession || !this.getCurrentCard()) return;

    try {
      const card = this.getCurrentCard()!;
      const reviewRequest: ReviewCardRequest = {
        cardId: card.id!,
        quality: quality,
        reviewedAt: new Date()
      };

      // Submit review to backend
      const response = await this.cardService.reviewCard(Number(card.deckId!), card.id!, reviewRequest).toPromise();
      
      if (response) {
        // Update local statistics
        this.completedReviews++;
        this.qualitySum += quality;
        this.averageQuality = this.qualitySum / this.completedReviews;

        // Update session stats
        this.reviewSession.stats.completed++;
        this.reviewSession.stats.remaining--;
        this.reviewSession.stats.accuracy = this.averageQuality / 5;

        // Move to next card or complete session
        this.moveToNextCard();
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      this.message.error('Không thể lưu kết quả ôn tập');
    }
  }

  private moveToNextCard(): void {
    if (!this.reviewSession) return;

    if (this.reviewSession.currentIndex < this.reviewSession.cards.length - 1) {
      // Move to next card
      this.reviewSession.currentIndex++;
      this.reviewSession.showAnswer = false;
    } else {
      // Complete the review session
      this.completeReviewSession();
    }
  }

  private completeReviewSession(): void {
    this.reviewSession = null;
    this.showCompleteScreen = true;
    
    // Show success message
    this.message.success('Chúc mừng! Bạn đã hoàn thành phiên ôn tập hôm nay');
  }

  getTimeSpent(): string {
    if (!this.reviewSession) return '0 phút';
    
    const now = new Date();
    const diffMs = now.getTime() - this.reviewSession.startTime.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 1) return '< 1 phút';
    return `${diffMins} phút`;
  }

  startNewReview(): void {
    this.showCompleteScreen = false;
    this.completedReviews = 0;
    this.averageQuality = 0;
    this.qualitySum = 0;
    this.initializeDailyReview();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}