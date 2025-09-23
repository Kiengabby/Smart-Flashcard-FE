import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { DeckService } from '../../services/deck.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';
import { Router } from '@angular/router';

interface Skill {
  name: string;
  icon: string;
  color: string;
  progress: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule,
    NzProgressModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  decks: DeckDTO[] = [];
  isLoading = false;
  
  // User data
  userName = 'Bạn'; // Sẽ được load từ user service
  currentStreak = 5;
  
  // Progress tracking
  skills: Skill[] = [
    { name: 'Nghe', icon: 'sound', color: '#1890ff', progress: 75 },
    { name: 'Nói', icon: 'audio', color: '#52c41a', progress: 60 },
    { name: 'Đọc', icon: 'read', color: '#fa541c', progress: 85 },
    { name: 'Viết', icon: 'edit', color: '#722ed1', progress: 45 }
  ];
  
  // Goal setting
  timeOptions = [5, 10, 15, 20, 30];
  selectedTime = 15; // Default goal
  studiedTime = 8; // Current progress

  constructor(
    private deckService: DeckService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDecks();
    this.loadUserData();
  }

  /**
   * Load user data from service
   */
  private loadUserData(): void {
    // TODO: Implement user service call
    // For now using mock data
    this.userName = 'Nguyễn Văn A';
  }

  /**
   * Get greeting based on current time
   */
  getGreetingTime(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'sáng';
    if (hour < 18) return 'chiều';
    return 'tối';
  }

  /**
   * Custom progress format for circles
   */
  progressFormat = (percent: number): string => `${percent}%`;

  /**
   * Select study time goal
   */
  selectTime(time: number): void {
    this.selectedTime = time;
    // TODO: Save to user preferences
  }

  /**
   * Get progress percentage for daily goal
   */
  getProgressPercentage(): number {
    return Math.min(Math.round((this.studiedTime / this.selectedTime) * 100), 100);
  }

  /**
   * Start learning session
   */
  startLearning(): void {
    if (this.decks.length === 0) {
      this.message.info('Vui lòng tạo bộ thẻ trước khi bắt đầu học!');
      this.openCreateDeckModal();
      return;
    }
    
    // Navigate to first deck or show deck selection
    this.message.success('Bắt đầu học! 🚀');
    // TODO: Navigate to learning interface
  }

  /**
   * Open specific deck
   */
  openDeck(deck: DeckDTO): void {
    this.message.info(`Mở bộ thẻ: ${deck.name}`);
    // TODO: Navigate to deck detail
  }

  /**
   * Get last studied time for deck
   */
  getLastStudied(deck: DeckDTO): string {
    // TODO: Calculate based on real data
    const randomDays = Math.floor(Math.random() * 7) + 1;
    return `${randomDays} ngày trước`;
  }

  /**
   * Tải danh sách deck từ API
   */
  loadDecks(): void {
    this.isLoading = true;
    this.deckService.getDecks().subscribe({
      next: (decks) => {
        this.decks = decks.map(deck => ({
          ...deck,
          progress: Math.floor(Math.random() * 100), // Mock progress
          cardCount: Math.floor(Math.random() * 50) + 10 // Mock card count
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error('Không thể tải danh sách bộ thẻ. Vui lòng thử lại!');
        console.error('Error loading decks:', error);
        
        // Show mock data for demo
        this.decks = [
          {
            id: '1',
            name: 'Từ vựng tiếng Anh cơ bản',
            description: 'Học các từ vựng tiếng Anh thường dùng trong cuộc sống hàng ngày',
            progress: 65,
            cardCount: 120
          },
          {
            id: '2', 
            name: 'TOEIC Vocabulary',
            description: 'Từ vựng TOEIC theo chủ đề và cấp độ',
            progress: 30,
            cardCount: 200
          },
          {
            id: '3',
            name: 'Phrasal Verbs',
            description: 'Động từ kép thường gặp trong tiếng Anh',
            progress: 80,
            cardCount: 85
          }
        ] as DeckDTO[];
      }
    });
  }

  /**
   * Mở modal tạo deck mới
   */
  openCreateDeckModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Tạo bộ thẻ mới',
      nzContent: CreateDeckModalComponent,
      nzFooter: null,
      nzWidth: 500,
      nzClosable: true,
      nzMaskClosable: false
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.createDeck(result);
      }
    });
  }

  /**
   * Tạo deck mới
   */
  private createDeck(data: { name: string; description: string }): void {
    this.deckService.createDeck(data).subscribe({
      next: (newDeck) => {
        this.message.success('Tạo bộ thẻ thành công!');
        this.loadDecks(); // Reload danh sách deck
      },
      error: (error) => {
        this.message.error('Không thể tạo bộ thẻ. Vui lòng thử lại!');
        console.error('Error creating deck:', error);
      }
    });
  }
}


