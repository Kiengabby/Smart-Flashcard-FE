import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// NG-ZORRO Modules
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

// Services và interfaces
import { DeckService } from '../../services/deck.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';
import { DeckCardComponent } from '../../components/deck-card/deck-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // NG-ZORRO
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule,
    NzTypographyModule,
    NzStatisticModule,
    // Custom Components
    DeckCardComponent,
  ],
  providers: [
    NzModalService,
    NzMessageService
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  
  // Properties cho quản lý bộ thẻ
  decks: DeckDTO[] = [];
  isLoading = true;

  // User info - thông thường sẽ lấy từ AuthService
  currentUser = {
    name: 'Kiên Gabby',
    totalDecks: 0,
    studiedToday: 0,
    streakDays: 3
  };

  constructor(
    private deckService: DeckService,
    private modalService: NzModalService,
    private messageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  /**
   * Tải danh sách bộ thẻ từ server
   */
  loadDecks(): void {
    this.isLoading = true;
    
    // Tạm thời sử dụng mock data để test giao diện
    setTimeout(() => {
      this.decks = [
        {
          id: '1',
          name: 'Từ vựng Tiếng Anh cơ bản',
          description: 'Bộ từ vựng tiếng Anh dành cho người mới bắt đầu học. Bao gồm các từ thông dụng trong giao tiếp hàng ngày, giúp bạn tự tin giao tiếp.',
          cardCount: 150,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'Lịch sử Việt Nam',
          description: 'Những sự kiện quan trọng trong lịch sử Việt Nam từ thời cổ đại đến hiện đại. Tìm hiểu về các triều đại và những bước ngoặt lịch sử.',
          cardCount: 89,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Toán học lớp 12',
          description: 'Công thức và định lý toán học quan trọng cho kỳ thi THPT Quốc gia. Bao gồm đại số, hình học và giải tích.',
          cardCount: 234,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Từ vựng TOEIC',
          description: 'Bộ từ vựng TOEIC phần Business và Academic để đạt điểm cao. Được biên soạn theo chuẩn quốc tế.',
          cardCount: 456,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Khoa học tự nhiên',
          description: 'Kiến thức cơ bản về vật lý, hóa học, sinh học dành cho học sinh THCS. Dễ hiểu và thực tế.',
          cardCount: 178,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Ngữ pháp tiếng Anh',
          description: 'Các cấu trúc ngữ pháp tiếng Anh từ cơ bản đến nâng cao với ví dụ minh họa cụ thể.',
          cardCount: 312,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.isLoading = false;
      this.updateUserStats(); // Cập nhật thống kê sau khi load
    }, 1000); // Giả lập thời gian loading 1 giây

    // Code gốc để gọi API (sẽ dùng khi có backend)
    /*
    this.deckService.getDecks().subscribe({
      next: (data: DeckDTO[]) => {
        this.decks = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách bộ thẻ:', error);
        this.messageService.error('Không thể tải danh sách bộ thẻ. Vui lòng thử lại!');
        this.isLoading = false;
      }
    });
    */
  }

  /**
   * Mở modal tạo bộ thẻ mới
   */
  openCreateDeckModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Tạo một bộ thẻ mới',
      nzContent: CreateDeckModalComponent,
      nzFooter: null,
      nzCentered: true
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.messageService.success('Tạo bộ thẻ thành công!');
        this.loadDecks();
      }
    });
  }

  /**
   * Bắt đầu học một bộ thẻ
   */
  startStudying(deck: DeckDTO): void {
    this.messageService.info(`Bắt đầu học bộ thẻ: ${deck.name}`);
    // TODO: Navigate to study page
    // this.router.navigate(['/study', deck.id]);
  }

  /**
   * Mở cài đặt cho bộ thẻ
   */
  openDeckSettings(deck: DeckDTO): void {
    this.messageService.info(`Mở cài đặt cho bộ thẻ: ${deck.name}`);
    // TODO: Navigate to deck settings
    // this.router.navigate(['/deck', deck.id, 'settings']);
  }

  /**
   * Tính toán progress học tập giả lập
   */
  calculateProgress(deck: DeckDTO): number {
    // Giả lập tiến độ học dựa trên cardCount
    const baseProgress = Math.floor(Math.random() * 80) + 10; // 10-90%
    return Math.min(baseProgress, 100);
  }

  /**
   * Cập nhật thống kê user sau khi load decks
   */
  updateUserStats(): void {
    this.currentUser.totalDecks = this.decks.length;
    this.currentUser.studiedToday = Math.floor(Math.random() * 50) + 10; // Giả lập
  }
}



