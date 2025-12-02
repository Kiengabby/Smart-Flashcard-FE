import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CardService } from '../../services/card.service';
import { DeckService } from '../../services/deck.service';
import { LearningProgressService } from '../../services/learning-progress.service';
import { CardDTO, ReviewCardRequest } from '../../interfaces/card.dto';
import { DeckDTO } from '../../interfaces/deck.dto';
import { WebSpeechService } from '../../services/web-speech.service';

@Component({
  selector: 'app-flashcard-study',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzTooltipModule
  ],
  providers: [NzMessageService],
  templateUrl: './flashcard-study.component.html',
  styleUrls: ['./flashcard-study.component.scss']
})
export class FlashcardStudyComponent implements OnInit {
  deckId!: number;
  deck: DeckDTO | null = null;
  cards: CardDTO[] = [];
  private _currentIndex = 0;
  isFlipped = false;
  private _isLoading = true;
  isAudioLoading = false;
  private audioElement: HTMLAudioElement | null = null;

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
    private deckService: DeckService,
    private learningProgressService: LearningProgressService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private webSpeechService: WebSpeechService
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
          this.loadDeckInfo();
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
      quality: result.quality
    };

    // Call the correct backend endpoint  
    this.http.post(`http://localhost:8080/api/cards/${cardId}/review`, answerRequest).subscribe({
      next: (response) => {
        console.log('Review submitted successfully:', response);
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.message.error('Lỗi khi lưu kết quả học: ' + (error.message || 'Vui lòng thử lại'));
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
    // Calculate average score based on ratings
    const avgScore = this.cards.length > 0 ? 85 : 0; // Simplified score calculation
    
    // Update learning progress
    this.learningProgressService.updateProgress(this.deckId, {
      mode: 'flashcard',
      completed: true,
      score: avgScore
    }).subscribe({
      next: () => {
        this.message.success('🎉 Hoàn thành Flashcard Study! Quiz Practice đã được mở khóa!');
        // Navigate back to learning path to see progress
        setTimeout(() => {
          this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating progress:', error);
        // Still navigate even if update fails
        this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
  }

  restart(): void {
    this._currentIndex = 0;
    this.isFlipped = false;
    this.cards = this.shuffleArray([...this.cards]);
    this.cdr.detectChanges();
  }

  /**
   * Phát âm thanh của từ vựng
   */
  playAudio(): void {
    console.log('playAudio clicked', this.currentCard);
    if (!this.currentCard) {
      this.message.warning('Không có thẻ học để phát âm');
      return;
    }

    // Set loading state
    this.setAudioLoadingState(true);

    // Dừng audio đang phát (nếu có)
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    this.webSpeechService.stopSpeaking();

    // Thử phát audio file trước (nếu có)
    if (this.currentCard.audioUrl) {
      this.playAudioFile();
    } else {
      // Fallback: Sử dụng Web Speech API
      this.playWebSpeech();
    }
  }

  private playAudioFile(): void {
    if (!this.currentCard?.audioUrl) {
      this.playWebSpeech();
      return;
    }

    // Tạo audio element mới
    this.audioElement = new Audio(this.currentCard.audioUrl);
    
    this.audioElement.onloadeddata = () => {
      // Audio ready, but not playing yet
      console.log('Audio loaded, ready to play');
    };

    this.audioElement.onerror = () => {
      console.warn('Không thể phát file âm thanh, chuyển sang Web Speech API');
      this.resetAudioLoadingState();
      this.playWebSpeech();
    };

    this.audioElement.onended = () => {
      console.log('Audio playback ended');
      this.audioElement = null;
      this.resetAudioLoadingState();
    };

    this.audioElement.onplay = () => {
      // Audio started playing - reset loading immediately
      console.log('Audio started playing');
      this.resetAudioLoadingState();
    };

    this.audioElement.onpause = () => {
      console.log('Audio paused');
      this.resetAudioLoadingState();
    };

    // Phát âm thanh
    this.audioElement.play().catch(error => {
      console.warn('Lỗi khi phát file âm thanh, chuyển sang Web Speech API:', error);
      this.resetAudioLoadingState();
      this.playWebSpeech();
    });
  }

  private playWebSpeech(): void {
    if (!this.currentCard) {
      this.resetAudioLoadingState();
      return;
    }

    // Sử dụng ngôn ngữ từ deck nếu có, nếu không thì auto-detect
    let language: string;
    if (this.deck?.language) {
      // Chuyển đổi language code từ deck
      language = this.webSpeechService.convertToSpeechLanguage(this.deck.language);
      console.log(`Using deck language: ${this.deck.language} -> ${language}`);
    } else {
      // Fallback về auto-detect
      language = this.webSpeechService.detectLanguage(this.currentCard.frontText);
      console.log(`Auto-detected language: ${language}`);
    }
    
    const isSupported = this.webSpeechService.isLanguageSupported(language.split('-')[0]);
    
    console.log('Using Web Speech API for:', this.currentCard.frontText);
    console.log('Final language:', language);
    console.log('Language supported:', isSupported);
    console.log('Available languages:', this.webSpeechService.getAvailableLanguages());
    
    this.webSpeechService.speakText(this.currentCard.frontText, language)
      .then(() => {
        console.log('Web Speech API completed successfully');
        this.resetAudioLoadingState();
      })
      .catch((error) => {
        console.error('Lỗi Web Speech API:', error);
        this.resetAudioLoadingState();
      });
  }

  /**
   * Tính toán CSS class cho kích thước text dựa trên độ dài nội dung
   * Logic: Ưu tiên consistency giữa front và back, xét cả ký tự và từ
   */
  getTextSizeClass(text: string): string {
    if (!text) return 'medium-text';
    
    const trimmedText = text.trim();
    const charLength = trimmedText.length;
    const wordCount = trimmedText.split(/\s+/).length;
    
    // Ưu tiên short-text cho nội dung ngắn (flashcard words/phrases)
    // Bao gồm từ đơn, cụm từ ngắn, từ nước ngoài
    if (charLength <= 30 && wordCount <= 5) {
      return 'short-text';
    }
    
    // Medium cho câu ngắn hoặc định nghĩa vừa
    else if (charLength <= 100 && wordCount <= 15) {
      return 'medium-text';
    }
    
    // Long cho đoạn văn ngắn
    else if (charLength <= 200 && wordCount <= 30) {
      return 'long-text';
    }
    
    // Very long cho nội dung dài
    else {
      return 'very-long-text';
    }
  }

  /**
   * Load thông tin deck bao gồm ngôn ngữ
   */
  loadDeckInfo(): void {
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (data) => {
        this.deck = data;
        console.log('Loaded deck info:', data);
        console.log('Deck language:', data.language);
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin deck:', error);
        // Continue without deck info if loading fails
      }
    });
  }

  /**
   * Reset audio loading state with proper change detection
   */
  private resetAudioLoadingState(): void {
    setTimeout(() => {
      this.isAudioLoading = false;
      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Set audio loading state with proper change detection
   */
  private setAudioLoadingState(loading: boolean): void {
    setTimeout(() => {
      this.isAudioLoading = loading;
      this.cdr.detectChanges();
    }, 0);
  }
}

