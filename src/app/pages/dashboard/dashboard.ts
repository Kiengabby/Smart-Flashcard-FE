import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

// Services và interfaces
import { DeckService } from '../../services/deck.service';
import { TokenService } from '../../services/token.service';
import { OnboardingService } from '../../services/onboarding.service';
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
    NzAvatarModule,
  ],
  providers: [
    NzModalService,
    NzMessageService
  ],
  templateUrl: './dashboard-clean.html',
  styleUrls: ['./dashboard-new.scss'],
})
export class DashboardComponent implements OnInit {
  
  // Properties cho thống kê - đúng với tính năng dự án
  stats = {
    conqueredDecks: 3,        // Số bộ thẻ đã chinh phục
    studyStreak: 7,           // Chuỗi ngày học liên tiếp
    totalWordsLearned: 156,   // Tổng số từ đã học
    reviewToday: 15,          // Số thẻ cần ôn tập hôm nay
    totalDecks: 5,            // Tổng số bộ thẻ
    activeChallenges: 1       // Số lời thách đấu đang chờ
  };

  // Tính phần trăm sử dụng
  get usagePercentage(): number {
    return this.stats.conqueredDecks > 0 
      ? Math.round((this.stats.conqueredDecks / this.stats.totalDecks) * 100) 
      : 0;
  }

  // Calendar properties
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  calendarDays: Array<{
    date: number;
    currentMonth: boolean;
    isToday: boolean;
    hasActivity: boolean;
    activityLevel: number;
  }> = [];

  // Properties cho quản lý bộ thẻ
  decks: DeckDTO[] = [];
  isLoading = true;

  // User info - lấy từ TokenService
  currentUser = {
    name: '',
    totalDecks: 0,
    studiedToday: 0
  };

  constructor(
    private deckService: DeckService,
    private tokenService: TokenService,
    private onboardingService: OnboardingService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.generateCalendar();
    this.loadDecks();
    
    // 🎯 Check và trigger onboarding tour cho người dùng mới
    this.checkAndStartOnboarding();
  }

  /**
   * Kiểm tra và bắt đầu onboarding tour cho người dùng lần đầu
   */
  checkAndStartOnboarding(): void {
    // Delay một chút để đảm bảo DOM đã render đầy đủ
    setTimeout(() => {
      if (!this.onboardingService.hasCompletedOnboarding()) {
        this.onboardingService.startDashboardTour();
      }
    }, 500);
  }

  /**
   * Load thông tin user từ token
   */
  loadUserInfo(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.currentUser.name = userInfo.displayName || userInfo.email;
    }
  }

  /**
   * Tạo calendar cho tháng hiện tại
   */
  generateCalendar(): void {
    this.calendarDays = [];
    const year = this.currentYear;
    const month = this.currentMonth - 1; // JS months are 0-indexed
    
    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Số ngày trong tháng
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Số ngày của tháng trước
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Ngày hôm nay
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    
    // Sample activity data (sẽ thay bằng data thực từ API)
    const activityDates = [13, 14, 15, 16, 17, 18];
    
    // Thêm các ngày của tháng trước
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: daysInPrevMonth - i,
        currentMonth: false,
        isToday: false,
        hasActivity: false,
        activityLevel: 0
      });
    }
    
    // Thêm các ngày của tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const hasActivity = activityDates.includes(day);
      this.calendarDays.push({
        date: day,
        currentMonth: true,
        isToday: isCurrentMonth && day === todayDate,
        hasActivity: hasActivity,
        activityLevel: hasActivity ? Math.floor(Math.random() * 3) + 1 : 0
      });
    }
    
    // Thêm các ngày của tháng sau để fill calendar grid
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push({
        date: day,
        currentMonth: false,
        isToday: false,
        hasActivity: false,
        activityLevel: 0
      });
    }
  }

  /**
   * Chuyển sang tháng trước
   */
  previousMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  /**
   * Chuyển sang tháng sau
   */
  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  /**
   * Điều hướng đến các action
   */
  navigateToAction(action: string): void {
    console.log('Navigate to:', action);
    this.messageService.info(`Chức năng ${action} đang được phát triển!`);
  }

  /**
   * Tải danh sách bộ thẻ từ server
   */
  loadDecks(): void {
    this.isLoading = true;
    
    this.deckService.getDecks().subscribe({
      next: (data: DeckDTO[]) => {
        this.decks = data;
        this.isLoading = false;
        this.updateUserStats(); // Cập nhật thống kê sau khi load
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách bộ thẻ:', error);
        this.messageService.error('Không thể tải danh sách bộ thẻ. Vui lòng thử lại!');
        this.isLoading = false;
        // Có thể giữ một số mock data cho demo nếu API fail
      }
    });
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
    // Navigate đến deck detail để xem và quản lý thẻ
    this.router.navigate(['/app/deck', deck.id]);
  }

  /**
   * Mở cài đặt cho bộ thẻ
   */
  openDeckSettings(deck: DeckDTO): void {
    // Navigate đến deck detail (trong tương lai sẽ có tab settings)
    this.router.navigate(['/app/deck', deck.id]);
  }
  
  /**
   * Xem chi tiết deck
   */
  viewDeckDetail(deck: DeckDTO): void {
    this.router.navigate(['/app/deck', deck.id]);
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



