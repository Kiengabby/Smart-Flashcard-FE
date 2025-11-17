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
export class StudyModeComponent implements OnInit, OnDestroy {
  deckId!: number;
  deck?: DeckDTO;
  cards: CardDTO[] = [];
  private _isLoading = true;
  private focusHandler = () => {
    this.refreshData();
  };

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
    this.cdr.detectChanges();
  }

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
      name: 'Flashcard',
      description: 'Ôn tập từ vựng với thẻ ghi nhớ (Flashcard) tương tác.',
      icon: 'file-text',
      color: '#52c41a',
      route: 'flashcard'
    },
    {
      id: 'quiz',
      name: 'Kiểm tra',
      description: 'Kiểm tra kiến thức với câu hỏi trắc nghiệm hoặc điền từ.',
      icon: 'check-square',
      color: '#1890ff',
      route: 'quiz'
    },
    {
      id: 'listening',
      name: 'Luyện Nghe',
      description: 'Nghe âm thanh và chọn từ đúng để cải thiện khả năng nghe.',
      icon: 'audio',
      color: '#722ed1',
      route: 'listening'
    },
    {
      id: 'sentence',
      name: 'Luyện câu',
      description: 'Viết câu và nhận phản hồi từ AI.',
      icon: 'edit',
      color: '#fa8c16',
      route: 'sentence'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cardService: CardService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize data
    this.deck = undefined;
    this.cards = [];
    
    // Use setTimeout to avoid initial expression changed error
    setTimeout(() => {
      this.route.params.subscribe(params => {
        this.deckId = +params['id'];
        if (this.deckId) {
          this.refreshData();
        }
      });

      // Listen for query params changes (refresh signal from flashcard study)
      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['refresh'] && this.deckId) {
          console.log('Refreshing study-mode data after flashcard study');
          this.refreshData();
        }
      });
    }, 0);
  }

  ngOnDestroy(): void {
    // Component cleanup - no subscriptions to unsubscribe since we use async pipe
  }

  /**
   * Refresh all data - deck info and cards
   */
  private refreshData(): void {
    if (this.deckId) {
      console.log('RefreshData: Loading deck and cards for deckId:', this.deckId);
      this.loadDeckInfo();
      this.loadCards();
    }
  }

  loadDeckInfo(): void {
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (data) => {
        this.deck = data;
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin deck:', error);
        this.message.error('Không thể tải thông tin bộ thẻ!');
      }
    });
  }

  loadCards(): void {
    this._isLoading = true;
    this.cdr.detectChanges();
    
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        this.cards = data;
        this.calculateStats();
        this._isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thẻ:', error);
        this.message.error('Không thể tải danh sách thẻ!');
        this._isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateStats(): void {
    this.stats.totalWords = this.cards.length;
    
    // Log cards data for debugging
    console.log('Calculating stats for cards:', this.cards.map(card => ({
      id: card.id,
      repetitions: card.repetitions || 0,
      nextReviewDate: card.nextReviewDate,
      easinessFactor: card.easinessFactor
    })));
    
    // Tính số thẻ đã thành thạo (repetitions >= 3)
    const masteredCards = this.cards.filter(card => (card.repetitions || 0) >= 3);
    this.stats.mastered = masteredCards.length;
    
    // Tính số thẻ cần ôn tập:
    // - Tất cả thẻ chưa master (repetitions < 3)
    // - Có thể thêm điều kiện đã đến hạn ôn tập nếu cần
    const now = new Date();
    const needReviewCards = this.cards.filter(card => {
      const repetitions = card.repetitions || 0;
      
      // Thẻ chưa master
      if (repetitions < 3) {
        return true;
      }
      
      // Thẻ đã master nhưng đã đến hạn ôn tập lại
      if (card.nextReviewDate) {
        const reviewDate = new Date(card.nextReviewDate);
        return reviewDate <= now;
      }
      
      return false;
    });
    this.stats.needReview = needReviewCards.length;
    
    console.log('Stats calculated:', {
      totalWords: this.stats.totalWords,
      mastered: this.stats.mastered,
      needReview: this.stats.needReview,
      masteredCards: masteredCards.map(c => c.id),
      needReviewCards: needReviewCards.map(c => c.id)
    });
    
    // Calculate difficulty stats
    this.calculateDifficultyStats();
    
    // Force change detection
    this.cdr.detectChanges();
  }

  calculateDifficultyStats(): void {
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
        // Phân loại theo easiness factor cho các card đang học (1-2 repetitions)
        if (easinessFactor >= 2.5) {
          this.difficultyStats.easy++;
        } else if (easinessFactor >= 1.8) {
          this.difficultyStats.medium++;
        } else {
          this.difficultyStats.hard++;
        }
      }
    });

    console.log('Difficulty stats calculated:', this.difficultyStats);
  }

  selectMode(mode: StudyMode): void {
    if (this.cards.length === 0) {
      this.message.warning('Bộ thẻ chưa có thẻ nào. Hãy thêm thẻ trước khi học!');
      return;
    }

    if (this.cards.length < 5) {
      this.message.warning(`Bạn cần thêm ${5 - this.cards.length} thẻ nữa để bắt đầu học!`);
      return;
    }

    // Navigate to study mode
    this.router.navigate(['/app/study', this.deckId, mode.route]);
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId]);
  }
}

