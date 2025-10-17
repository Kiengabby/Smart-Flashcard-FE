import { Component, OnInit } from '@angular/core';
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
  deck?: DeckDTO;
  cards: CardDTO[] = [];
  isLoading = true;

  stats: StudyStats = {
    totalWords: 0,
    mastered: 0,
    needReview: 0
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
      name: 'Đoán và Gõ Từ',
      description: 'Nghe audio, đoán và gõ lại từ vựng.',
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
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.deckId = +params['id'];
      if (this.deckId) {
        this.loadDeckInfo();
        this.loadCards();
      }
    });
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
    this.isLoading = true;
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        this.cards = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thẻ:', error);
        this.message.error('Không thể tải danh sách thẻ!');
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.totalWords = this.cards.length;
    // Tính số thẻ đã thành thạo (repetitions >= 3)
    this.stats.mastered = this.cards.filter(card => (card.repetitions || 0) >= 3).length;
    // Tính số thẻ cần ôn tập
    this.stats.needReview = this.cards.filter(card => {
      if (!card.nextReviewDate) return true;
      return new Date(card.nextReviewDate) <= new Date();
    }).length;
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

