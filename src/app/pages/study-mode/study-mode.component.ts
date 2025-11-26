import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DeckService } from '../../services/deck.service';
import { CardService } from '../../services/card.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CardDTO } from '../../interfaces/card.dto';

interface StudyStats {
  totalWords: number;
  mastered: number;
  needReview: number;
}

interface DifficultyStats {
  known: number;     // Đã biết (repetitions >= 3)
  easy: number;      // Dễ (easinessFactor >= 2.5)  
  medium: number;    // Trung bình (1.8 <= easinessFactor < 2.5)
  hard: number;      // Khó (easinessFactor < 1.8)
  notStarted: number; // Chưa bắt đầu (repetitions = 0)
}

interface StudyMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-study-mode',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzStatisticModule
  ],
  providers: [NzMessageService],
  templateUrl: './study-mode.component.html',
  styleUrls: ['./study-mode.component.scss']
})
export class StudyModeComponent implements OnInit {
  deckId!: number;
  deck: DeckDTO | null = null;
  cards: CardDTO[] = [];
  stats: StudyStats = {
    totalWords: 0,
    mastered: 0,
    needReview: 0
  };
  
  difficultyStats: DifficultyStats = {
    known: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    notStarted: 0
  };

  studyModes: StudyMode[] = [
    {
      id: 'flashcard',
      name: 'Thẻ ghi nhớ',
      description: 'Học từ vựng theo phương pháp lặp lại ngắt quãng',
      icon: 'credit-card',
      color: '#1890ff',
      route: 'flashcard'
    },
    {
      id: 'quiz',
      name: 'Trắc nghiệm',
      description: 'Kiểm tra kiến thức với các câu hỏi trắc nghiệm',
      icon: 'question-circle',
      color: '#52c41a',
      route: 'quiz'
    },
    {
      id: 'listening',
      name: 'Luyện nghe',
      description: 'Rèn luyện khả năng nghe và phát âm',
      icon: 'sound',
      color: '#fa8c16',
      route: 'listening'
    },
    {
      id: 'writing',
      name: 'Luyện viết với AI',
      description: 'Viết câu sử dụng từ vựng và nhận feedback từ AI',
      icon: 'edit',
      color: '#722ed1',
      route: 'writing'
    }
  ];

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cardService: CardService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.deckId = +params['id'];
      if (this.deckId) {
        this.loadDeckInfo();
        this.loadCards();
      }
    });

    // Check if returning from completed study
    this.route.queryParams.subscribe(params => {
      if (params['completed']) {
        this.message.success('Chúc mừng! Bạn đã hoàn thành phiên học.');
      }
    });
  }

  private loadDeckInfo(): void {
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (data) => {
        this.deck = data;
      },
      error: (error) => {
        this.message.error('Lỗi khi tải thông tin bộ thẻ: ' + error.message);
      }
    });
  }

  private loadCards(): void {
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        this.cards = data || [];
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.message.error('Lỗi khi tải danh sách thẻ: ' + error.message);
        this.isLoading = false;
      }
    });
  }

  private calculateStats(): void {
    if (!this.cards || this.cards.length === 0) {
      return;
    }

    this.stats.totalWords = this.cards.length;

    // Calculate mastered cards (repetitions >= 3 and easinessFactor >= 2.5)
    const masteredCards = this.cards.filter(card => 
      (card.repetitions || 0) >= 3 && (card.easinessFactor || 2.5) >= 2.5
    );

    this.stats.mastered = masteredCards.length;

    // Calculate cards that need review (based on nextReviewDate)
    const now = new Date();
    const needReviewCards = this.cards.filter(card => {
      if (!card.nextReviewDate) {
        return true; // Never studied, needs review
      }
      const reviewDate = new Date(card.nextReviewDate);
      return reviewDate <= now;
    });

    this.stats.needReview = needReviewCards.length;

    // Store stats for potential API call
    const studyStats = {
      totalWords: this.stats.totalWords,
      mastered: this.stats.mastered,
      needReview: this.stats.needReview,
      masteredCards: masteredCards.map(c => c.id),
      needReviewCards: needReviewCards.map(c => c.id)
    };

    // Calculate difficulty distribution
    this.calculateDifficultyStats();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  private calculateDifficultyStats(): void {
    this.difficultyStats = {
      known: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      notStarted: 0
    };

    this.cards.forEach(card => {
      const repetitions = card.repetitions || 0;
      const easinessFactor = card.easinessFactor || 2.5;

      if (repetitions === 0) {
        this.difficultyStats.notStarted++;
      } else if (repetitions >= 3) {
        this.difficultyStats.known++;
      } else {
        if (easinessFactor >= 2.5) {
          this.difficultyStats.easy++;
        } else if (easinessFactor >= 1.8) {
          this.difficultyStats.medium++;
        } else {
          this.difficultyStats.hard++;
        }
      }
    });
  }

  selectMode(mode: StudyMode): void {
    if (this.cards.length === 0) {
      this.message.warning('Bộ thẻ chưa có thẻ nào. Hãy thêm thẻ trước khi học!');
      return;
    }
    
    if (this.cards.length < 5) {
      this.message.warning(`Bạn cần thêm ${5 - this.cards.length} thẻ nữa để có thể bắt đầu học!`);
      return;
    }

    this.router.navigate(['/app/study', this.deckId, mode.route]);
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId]);
  }
}
