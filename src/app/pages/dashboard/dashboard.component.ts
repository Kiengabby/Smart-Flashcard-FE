import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// NG-ZORRO Modules
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

// Services
import { DeckService } from '../../services/deck.service';
import { TokenService } from '../../services/token.service';
import { OnboardingService } from '../../services/onboarding.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  
  // Stats và User Info
  stats = {
    conqueredDecks: 3,
    studyStreak: 7,
    totalWordsLearned: 156,
    reviewToday: 15,
    totalDecks: 5,
    activeChallenges: 1
  };

  currentUser = {
    name: '',
    totalDecks: 0,
    studiedToday: 0
  };

  // Calendar
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  calendarDays: Array<{
    date: number;
    currentMonth: boolean;
    isToday: boolean;
    hasActivity: boolean;
    activityLevel: number;
  }> = [];

  // Decks
  decks: DeckDTO[] = [];
  isLoading = true;

  // Welcome section
  motivationMessages = [
    "🚀 Hãy tiếp tục hành trình chinh phục ngôn ngữ của bạn hôm nay!",
    "💪 Mỗi từ vựng mới là một bước tiến trong hành trình của bạn!",
    "🎯 Hôm nay là cơ hội tuyệt vời để nâng cao kỹ năng ngôn ngữ!",
    "⭐ Bạn đang làm rất tốt! Hãy tiếp tục duy trì momentum này!",
    "🌟 Kiến thức là chìa khóa mở cửa thành công - hãy học tiếp!",
    "🔥 Streak của bạn thật ấn tượng! Hãy giữ vững phong độ!",
    "📚 Mỗi ngày học là một ngày đầu tư cho tương lai tươi sáng!",
    "✨ Bạn có thể làm được! Hãy bắt đầu với một thẻ đầu tiên!"
  ];

  // Challenge Notifications
  challengeNotifications: Array<{
    id: string;
    senderName: string;
    senderAvatar: string;
    message: string;
    deckName: string;
    target: string;
    type: 'speed' | 'accuracy' | 'streak' | 'vocabulary';
    timeAgo: string;
    isNew: boolean;
  }> = [
    {
      id: '1',
      senderName: 'Minh Anh',
      senderAvatar: '',
      message: 'thách đấu bạn trong bộ thẻ Tiếng Anh cơ bản',
      deckName: 'Tiếng Anh cơ bản',
      target: 'Học 50 từ trong 3 ngày',
      type: 'vocabulary',
      timeAgo: '2 phút trước',
      isNew: true
    },
    {
      id: '2',
      senderName: 'Quang Huy',
      senderAvatar: '',
      message: 'thách đấu tốc độ ôn tập',
      deckName: 'TOEIC Vocabulary',
      target: 'Hoàn thành 100 thẻ trong 30 phút',
      type: 'speed',
      timeAgo: '1 giờ trước',
      isNew: false
    },
    {
      id: '3',
      senderName: 'Thu Hà',
      senderAvatar: '',
      message: 'thách đấu chuỗi ngày học',
      deckName: 'Japanese N5',
      target: 'Duy trì streak 10 ngày',
      type: 'streak',
      timeAgo: '3 giờ trước',
      isNew: true
    }
  ];

  // Getter
  get usagePercentage(): number {
    return this.stats.conqueredDecks > 0 
      ? Math.round((this.stats.conqueredDecks / this.stats.totalDecks) * 100) 
      : 0;
  }

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
    this.checkAndStartOnboarding();
  }

  // Onboarding check
  checkAndStartOnboarding(): void {
    setTimeout(() => {
      if (!this.onboardingService.hasCompletedOnboarding()) {
        this.onboardingService.startDashboardTour();
      }
    }, 500);
  }

  // Load user info
  loadUserInfo(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.currentUser.name = userInfo.displayName || userInfo.email;
    }
  }

  // Calendar methods
  generateCalendar(): void {
    this.calendarDays = [];
    const year = this.currentYear;
    const month = this.currentMonth - 1;
    
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    
    const activityDates = [13, 14, 15, 16, 17, 18];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: daysInPrevMonth - i,
        currentMonth: false,
        isToday: false,
        hasActivity: false,
        activityLevel: 0
      });
    }
    
    // Current month days
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
    
    // Next month days
    const remainingDays = 42 - this.calendarDays.length;
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

  previousMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  // Navigation
  navigateToAction(action: string): void {
    console.log('Navigate to:', action);
    this.messageService.info(`Chức năng ${action} đang được phát triển!`);
  }

  navigateToDailyReview(): void {
    this.router.navigate(['/app/daily-review']);
  }

  // Deck operations
  loadDecks(): void {
    this.isLoading = true;
    
    this.deckService.getDecks().subscribe({
      next: (data: DeckDTO[]) => {
        this.decks = data;
        this.isLoading = false;
        this.updateUserStats();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách bộ thẻ:', error);
        this.messageService.error('Không thể tải danh sách bộ thẻ. Vui lòng thử lại!');
        this.isLoading = false;
      }
    });
  }

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

  startStudying(deck: DeckDTO): void {
    this.router.navigate(['/app/deck', deck.id]);
  }

  openDeckSettings(deck: DeckDTO): void {
    this.router.navigate(['/app/deck', deck.id]);
  }
  
  viewDeckDetail(deck: DeckDTO): void {
    this.router.navigate(['/app/deck', deck.id]);
  }

  calculateProgress(deck: DeckDTO): number {
    const baseProgress = Math.floor(Math.random() * 80) + 10;
    return Math.min(baseProgress, 100);
  }

  updateUserStats(): void {
    this.currentUser.totalDecks = this.decks.length;
    this.currentUser.studiedToday = Math.floor(Math.random() * 50) + 10;
  }

  // Challenge methods
  getChallengeIcon(type: string): string {
    switch (type) {
      case 'speed': return 'rocket';
      case 'accuracy': return 'bullseye';
      case 'streak': return 'fire';
      case 'vocabulary': return 'book';
      default: return 'trophy';
    }
  }

  acceptChallenge(challenge: any): void {
    this.messageService.success(`Đã chấp nhận thách đấu từ ${challenge.senderName}!`);
    // Remove from notifications
    this.challengeNotifications = this.challengeNotifications.filter(c => c.id !== challenge.id);
  }

  declineChallenge(challenge: any): void {
    this.messageService.info(`Đã từ chối thách đấu từ ${challenge.senderName}`);
    // Remove from notifications
    this.challengeNotifications = this.challengeNotifications.filter(c => c.id !== challenge.id);
  }

  // Generate weekly progress for compact display
  generateWeeklyProgress(): void {
    // Method removed - using original calendar display
  }

  // Welcome section methods
  getRandomMotivation(): string {
    const randomIndex = Math.floor(Math.random() * this.motivationMessages.length);
    return this.motivationMessages[randomIndex];
  }
}



