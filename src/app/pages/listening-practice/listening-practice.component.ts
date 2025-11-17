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

  playAudio(): void {
    if (!this.currentCard) return;

    this.isAudioLoading = true;
    this.hasPlayedAudio = true;

    const deckLanguage = this.deck?.language;
    console.log('Playing audio for:', this.currentCard.frontText, 'Deck Language:', deckLanguage);
    
    this.webSpeechService.speakTextWithDeckLanguage(this.currentCard.frontText, deckLanguage)
      .then(() => {
        setTimeout(() => {
          this.isAudioLoading = false;
          this.cdr.detectChanges();
        }, 0);
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
        setTimeout(() => {
          this.isAudioLoading = false;
          this.cdr.detectChanges();
        }, 0);
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
    let message = `Hoàn thành! Điểm: ${this.score}/${this.totalAnswered} (${accuracy}%)`;
    
    if (accuracy >= 80) {
      message += ' 🌟 Xuất sắc!';
      this.message.success(message);
    } else if (accuracy >= 60) {
      message += ' 👍 Khá tốt!';
      this.message.info(message);
    } else {
      message += ' 💪 Cần luyện tập thêm!';
      this.message.warning(message);
    }

    // Navigate back after 3 seconds
    setTimeout(() => {
      this.goBack();
    }, 3000);
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
    this.router.navigate(['/app/study-mode', this.deckId]);
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
}