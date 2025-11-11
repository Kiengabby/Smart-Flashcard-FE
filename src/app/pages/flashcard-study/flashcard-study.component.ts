import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CardService } from '../../services/card.service';
import { CardDTO, ReviewCardRequest } from '../../interfaces/card.dto';

@Component({
  selector: 'app-flashcard-study',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule
  ],
  providers: [NzMessageService],
  templateUrl: './flashcard-study.component.html',
  styleUrls: ['./flashcard-study.component.scss']
})
export class FlashcardStudyComponent implements OnInit {
  deckId!: number;
  cards: CardDTO[] = [];
  private _currentIndex = 0;
  isFlipped = false;
  private _isLoading = true;

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

  get currentCard(): CardDTO | undefined {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Initialize data
    this.cards = [];
    this._currentIndex = 0;
    this.isFlipped = false;
    
    // Use setTimeout to avoid initial expression changed error
    setTimeout(() => {
      // Lấy deckId từ parent route (vì route structure là /study/:id/flashcard)
      this.route.parent?.params.subscribe(parentParams => {
        this.deckId = +parentParams['id'];
        console.log('Got deckId from parent params:', this.deckId);
        if (this.deckId && this.deckId > 0) {
          this.loadCards();
        } else {
          console.error('Invalid deckId:', this.deckId);
          // Redirect silently without showing error message
          this.router.navigate(['/app/dashboard']);
        }
      });
    }, 0);
  }

  loadCards(): void {
    this._isLoading = true;
    this.cdr.detectChanges();
    
    console.log('Loading cards for deckId:', this.deckId);
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        console.log('Loaded cards:', data);
        this.cards = this.shuffleArray([...data]); // Shuffle cards
        this._isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thẻ:', error);
        // Don't show error message to user, just redirect back
        this._isLoading = false;
        this.cdr.detectChanges();
        // Redirect back to deck detail if loading fails
        this.router.navigate(['/app/deck', this.deckId]);
      }
    });
  }

  // Shuffle array using Fisher-Yates algorithm
  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  nextCard(): void {
    if (!this.isLastCard) {
      this._currentIndex++;
      this.isFlipped = false;
      this.cdr.detectChanges();
    }
  }

  previousCard(): void {
    if (!this.isFirstCard) {
      this._currentIndex--;
      this.isFlipped = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Đánh giá độ khó của thẻ theo thuật toán SM-2
   * @param quality Chất lượng câu trả lời (0-5)
   * 0: Sai hoàn toàn
   * 1: Sai nhưng nhớ được câu trả lời đúng 
   * 2: Sai nhưng câu trả lời đúng có vẻ quen thuộc
   * 3: Đúng nhưng khó khăn
   * 4: Đúng với một chút do dự
   * 5: Đúng và dễ dàng
   */
  rateCard(quality: number): void {
    if (!this.currentCard) return;

    // Apply SM-2 algorithm
    const result = this.calculateNextReview(this.currentCard, quality);
    
    // Add quality to result for API call
    result.quality = quality;
    
    // Update card with new values
    this.updateCardProgress(this.currentCard.id, result);

    // Show feedback message
    this.showRatingFeedback(quality, result.interval);

    // Move to next card or complete study with shorter delay
    setTimeout(() => {
      if (!this.isLastCard) {
        this.nextCard();
      } else {
        this.completeStudy();
      }
    }, 300); // Reduced from 1000ms to 300ms for better UX
  }

  /**
   * Tính toán lịch ôn tập tiếp theo theo thuật toán SM-2
   */
  private calculateNextReview(card: CardDTO, quality: number) {
    let easinessFactor = card.easinessFactor || 2.5;
    let repetitions = card.repetitions || 0;
    let interval = card.interval || 1;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
      repetitions++;
    } else {
      // Incorrect response
      repetitions = 0;
      interval = 1;
    }

    // Update easiness factor
    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easinessFactor < 1.3) {
      easinessFactor = 1.3;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      easinessFactor,
      repetitions,
      interval,
      nextReviewDate: nextReviewDate.toISOString(),
      quality: 0 // Will be set by caller
    };
  }

  /**
   * Cập nhật tiến trình học của thẻ
   */
  private updateCardProgress(cardId: number, result: any): void {
    // Update local card data immediately
    if (this.currentCard && this.currentCard.id === cardId) {
      this.currentCard.easinessFactor = result.easinessFactor;
      this.currentCard.repetitions = result.repetitions;
      this.currentCard.interval = result.interval;
      this.currentCard.nextReviewDate = result.nextReviewDate;
      this.currentCard.lastReviewedAt = new Date().toISOString();
    }

    console.log('Card progress updated locally:', {
      cardId: cardId,
      easinessFactor: result.easinessFactor,
      repetitions: result.repetitions,
      interval: result.interval,
      nextReviewDate: result.nextReviewDate,
      quality: result.quality
    });

    // Call backend API to save review result
    const answerRequest = {
      cardId: cardId,
      quality: result.quality
    };

    // Call the correct backend endpoint
    this.http.post('http://localhost:8080/api/v1/reviews', answerRequest).subscribe({
      next: (response) => {
        console.log('Review submitted successfully:', response);
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        // Don't show error to user, just log it since local update already happened
      }
    });
  }

  /**
   * Hiển thị thông báo phản hồi
   */
  private showRatingFeedback(quality: number, interval: number): void {
    // Comment out feedback messages - users don't need to see the scheduling details
    /*
    const messages = {
      1: `Khó quá! Sẽ ôn lại sau ${interval} ngày`,
      3: `Trung bình. Sẽ ôn lại sau ${interval} ngày`,
      4: `Tốt! Sẽ ôn lại sau ${interval} ngày`,
      5: `Xuất sắc! Sẽ ôn lại sau ${interval} ngày`
    };

    const message = messages[quality as keyof typeof messages] || `Sẽ ôn lại sau ${interval} ngày`;
    
    if (quality === 5) {
      this.message.success(message);
    } else if (quality >= 3) {
      this.message.info(message);
    } else {
      this.message.warning(message);
    }
    */
    
    // Just log to console for debugging
    console.log(`Card rated ${quality}, next review in ${interval} days`);
  }

  markAsKnown(): void {
    this.rateCard(4);
  }

  markAsUnknown(): void {
    this.rateCard(1);
  }

  completeStudy(): void {
    // Navigate back with refresh flag to trigger data reload
    this.router.navigate(['/app/study-mode', this.deckId], { 
      queryParams: { refresh: Date.now() } 
    });
  }

  goBack(): void {
    this.router.navigate(['/app/study-mode', this.deckId]);
  }

  restart(): void {
    this._currentIndex = 0;
    this.isFlipped = false;
    this.cards = this.shuffleArray([...this.cards]);
    this.cdr.detectChanges();
  }
}

