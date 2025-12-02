import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzResultModule } from 'ng-zorro-antd/result';
import { CardService } from '../../services/card.service';
import { DeckService } from '../../services/deck.service';
import { LearningProgressService } from '../../services/learning-progress.service';
import { CardDTO } from '../../interfaces/card.dto';
import { DeckDTO } from '../../interfaces/deck.dto';
import { WebSpeechService } from '../../services/web-speech.service';

@Component({
  selector: 'app-listening-practice',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzTooltipModule,
    NzResultModule
  ],
  providers: [NzMessageService],
  templateUrl: './listening-practice.component.html',
  styleUrls: ['./listening-practice.component.scss']
})
export class ListeningPracticeComponent implements OnInit {
  deckId!: number;
  deck: DeckDTO | null = null;
  cards: CardDTO[] = [];
  currentCard: CardDTO | null = null;
  currentIndex = 0;
  isLoading = true;
  isAudioLoading = false;
  private audioElement: HTMLAudioElement | null = null;
  
  // Listening practice specific
  options: string[] = [];
  selectedAnswer: string | null = null;
  showResult = false;
  isCorrect = false;
  score = 0;
  totalAnswered = 0;
  hasPlayedAudio = false;

  get progress(): number {
    return this.cards.length > 0 ? Math.round(((this.currentIndex) / this.cards.length) * 100) : 0;
  }

  get accuracy(): number {
    return this.totalAnswered > 0 ? Math.round((this.score / this.totalAnswered) * 100) : 0;
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
    console.log('ListeningPracticeComponent initialized');
    
    // Get deckId from parent route
    this.route.parent?.params.subscribe(parentParams => {
      this.deckId = +parentParams['id'];
      console.log('Got deckId from parent params:', this.deckId);
      
      if (this.deckId) {
        this.loadCards();
      }
    });
  }

  private loadCards(): void {
    console.log('Loading cards for deckId:', this.deckId);
    this.isLoading = true;
    
    // Load deck info first to get language
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (deck: DeckDTO) => {
        this.deck = deck;
        console.log('Loaded deck info:', deck);
        
        // Then load cards
        this.cardService.getCardsByDeck(this.deckId).subscribe({
          next: (cards) => {
            console.log('Loaded cards:', cards);
            this.cards = this.shuffleArray([...cards]);
            
            if (this.cards.length > 0) {
              this.currentCard = this.cards[0];
              this.generateOptions();
              setTimeout(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }, 500);
            } else {
              this.isLoading = false;
              this.message.warning('Không có thẻ học nào trong bộ này');
            }
          },
          error: (error) => {
            console.error('Error loading cards:', error);
            this.isLoading = false;
            this.message.error('Lỗi khi tải thẻ học: ' + (error.message || 'Vui lòng thử lại'));
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading deck:', error);
        this.isLoading = false;
        this.message.error('Lỗi khi tải thông tin bộ thẻ');
      }
    });
  }

  private generateOptions(): void {
    if (!this.currentCard) return;

    const correctAnswer = this.currentCard.frontText.trim();
    const otherCards = this.cards.filter(card => 
      card.id !== this.currentCard!.id && 
      card.frontText.trim() !== correctAnswer
    );
    
    // Lấy 3 đáp án sai ngẫu nhiên
    const wrongAnswers = this.shuffleArray(otherCards)
      .slice(0, 3)
      .map(card => card.frontText.trim());
    
    // Kết hợp đáp án đúng và sai, sau đó shuffle
    this.options = this.shuffleArray([correctAnswer, ...wrongAnswers]);
    
    // Reset state
    this.selectedAnswer = null;
    this.showResult = false;
    this.hasPlayedAudio = false;
    
    console.log('Generated options:', this.options, 'Correct:', correctAnswer);
  }

  /**
   * Phát âm thanh của từ vựng (giống logic flashcard study)
   */
  playAudio(): void {
    console.log('playAudio clicked for listening practice', this.currentCard);
    if (!this.currentCard) {
      this.message.warning('Không có thẻ học để phát âm');
      return;
    }

    // Set loading state và mark đã phát audio
    this.setAudioLoadingState(true);
    this.hasPlayedAudio = true;

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

    console.log('Playing audio file:', this.currentCard.audioUrl);
    
    // Tạo audio element mới
    this.audioElement = new Audio(this.currentCard.audioUrl);
    
    this.audioElement.onloadeddata = () => {
      console.log('Audio loaded for listening practice');
    };

    this.audioElement.onerror = () => {
      console.warn('Cannot play audio file, switching to Web Speech API');
      this.resetAudioLoadingState();
      this.playWebSpeech();
    };

    this.audioElement.onended = () => {
      console.log('Audio playback ended');
      this.audioElement = null;
      this.resetAudioLoadingState();
    };

    this.audioElement.onplay = () => {
      console.log('Audio started playing');
      this.resetAudioLoadingState();
    };

    this.audioElement.onpause = () => {
      console.log('Audio paused');
      this.resetAudioLoadingState();
    };

    // Phát âm thanh
    this.audioElement.play().catch(error => {
      console.warn('Error playing audio file, switching to Web Speech API:', error);
      this.resetAudioLoadingState();
      this.playWebSpeech();
    });
  }

  private playWebSpeech(): void {
    if (!this.currentCard) {
      this.resetAudioLoadingState();
      return;
    }

    console.log('Using Web Speech API for listening practice');

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
    
    console.log('Using Web Speech API for listening practice:', this.currentCard.frontText);
    console.log('Final language:', language);
    console.log('Language supported:', isSupported);
    
    this.webSpeechService.speakText(this.currentCard.frontText, language)
      .then(() => {
        console.log('Web Speech API completed successfully for listening practice');
        this.resetAudioLoadingState();
      })
      .catch((error) => {
        console.error('Web Speech API error in listening practice:', error);
        this.resetAudioLoadingState();
        this.message.error('Không thể phát âm thanh');
      });
  }

  selectAnswer(option: string): void {
    if (this.showResult || !this.hasPlayedAudio) {
      if (!this.hasPlayedAudio) {
        this.message.warning('Vui lòng nghe âm thanh trước khi chọn đáp án');
      }
      return;
    }

    this.selectedAnswer = option;
    this.isCorrect = option.trim() === this.currentCard?.frontText.trim();
    this.showResult = true;
    this.totalAnswered++;

    if (this.isCorrect) {
      this.score++;
      this.message.success('Chính xác! 🎉');
    } else {
      this.message.error('Sai rồi! 😅');
    }

    console.log('Answer selected:', option, 'Correct:', this.isCorrect);
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.currentCard = this.cards[this.currentIndex];
      this.generateOptions();
    } else {
      this.showFinalResult();
    }
  }

  private showFinalResult(): void {
    const accuracy = this.accuracy;
    const finalScore = Math.round(accuracy);
    
    // Update learning progress
    this.learningProgressService.updateProgress(this.deckId, {
      mode: 'listening',
      completed: true,
      score: finalScore
    }).subscribe({
      next: () => {
        let message = `🎉 Hoàn thành Listening Practice! Điểm: ${this.score}/${this.totalAnswered} (${accuracy}%)`;
        
        if (accuracy >= 80) {
          message += ' 🌟 Xuất sắc! Writing Practice đã được mở khóa!';
          this.message.success(message, { nzDuration: 3000 });
        } else if (accuracy >= 60) {
          message += ' 👍 Khá tốt! Writing Practice đã được mở khóa!';
          this.message.info(message, { nzDuration: 3000 });
        } else {
          message += ' 💪 Writing Practice đã được mở khóa!';
          this.message.warning(message, { nzDuration: 3000 });
        }

        // Navigate back to learning path after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating progress:', error);
        this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
      }
    });
  }

  restart(): void {
    this.currentIndex = 0;
    this.score = 0;
    this.totalAnswered = 0;
    this.cards = this.shuffleArray([...this.cards]);
    this.currentCard = this.cards[0];
    this.generateOptions();
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
  }

  trackByOption(index: number, option: string): string {
    return option;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
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