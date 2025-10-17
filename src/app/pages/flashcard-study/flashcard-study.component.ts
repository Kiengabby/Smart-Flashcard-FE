import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CardService } from '../../services/card.service';
import { CardDTO } from '../../interfaces/card.dto';

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
  currentIndex = 0;
  isFlipped = false;
  isLoading = true;

  get currentCard(): CardDTO | undefined {
    return this.cards[this.currentIndex];
  }

  get progress(): number {
    if (this.cards.length === 0) return 0;
    return Math.round(((this.currentIndex + 1) / this.cards.length) * 100);
  }

  get isFirstCard(): boolean {
    return this.currentIndex === 0;
  }

  get isLastCard(): boolean {
    return this.currentIndex === this.cards.length - 1;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.parent?.params.subscribe(params => {
      this.deckId = +params['id'];
      if (this.deckId) {
        this.loadCards();
      }
    });
  }

  loadCards(): void {
    this.isLoading = true;
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        this.cards = this.shuffleArray([...data]); // Shuffle cards
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thẻ:', error);
        this.message.error('Không thể tải danh sách thẻ!');
        this.isLoading = false;
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
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  previousCard(): void {
    if (!this.isFirstCard) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  markAsKnown(): void {
    // TODO: Update card progress
    this.message.success('Đã đánh dấu là biết!');
    if (!this.isLastCard) {
      this.nextCard();
    } else {
      this.completeStudy();
    }
  }

  markAsUnknown(): void {
    // TODO: Update card progress
    this.message.info('Đã đánh dấu cần ôn lại!');
    if (!this.isLastCard) {
      this.nextCard();
    } else {
      this.completeStudy();
    }
  }

  completeStudy(): void {
    this.message.success('Chúc mừng! Bạn đã hoàn thành học flashcard!');
    setTimeout(() => {
      this.router.navigate(['/app/study-mode', this.deckId]);
    }, 1500);
  }

  goBack(): void {
    this.router.navigate(['/app/study-mode', this.deckId]);
  }

  restart(): void {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.cards = this.shuffleArray([...this.cards]);
  }
}

