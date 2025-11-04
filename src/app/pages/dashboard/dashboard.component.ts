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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

// Services & Interfaces
import { DeckService } from '../../services/deck.service';
import { TokenService } from '../../services/token.service';
// import { OnboardingService } from '../../services/onboarding.service'; // Đã tắt
import { DeckDTO } from '../../interfaces/deck.dto';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';

// Type Definitions
interface ChallengeNotification {
  id: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  deckName: string;
  target: string;
  type: 'speed' | 'accuracy' | 'streak' | 'vocabulary';
  timeAgo: string;
  isNew: boolean;
}

interface CalendarDay {
  date: number;
  currentMonth: boolean;
  isToday: boolean;
  hasActivity: boolean;
  activityLevel: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule,
    NzAvatarModule,
  ],
  providers: [NzModalService, NzMessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  
  // ===========================
  // APPLICATION STATE
  // ===========================
  stats = {
    conqueredDecks: 3,
    studyStreak: 7,
    totalWordsLearned: 156,
    reviewToday: 15,
    totalDecks: 5,
    activeChallenges: 1
  };

  currentUser = {
    name: 'Kien',
    totalDecks: 0,
    studiedToday: 15
  };

  // ===========================
  // UI STATE
  // ===========================
  decks: DeckDTO[] = [];
  isLoading = true;
  isWelcomeMinimized = false;

  // ===========================
  // CALENDAR STATE
  // ===========================
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];

  // ===========================
  // CHALLENGE NOTIFICATIONS
  // ===========================
  challengeNotifications: ChallengeNotification[] = [
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

  // ===========================
  // COMPUTED PROPERTIES
  // ===========================
  get usagePercentage(): number {
    return this.stats.conqueredDecks > 0 
      ? Math.round((this.stats.conqueredDecks / this.stats.totalDecks) * 100) 
      : 0;
  }

  constructor(
    private deckService: DeckService,
    private tokenService: TokenService,
    // private onboardingService: OnboardingService, // Đã tắt
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.generateCalendar();
    this.loadDecks();
    // Onboarding đã được tắt theo yêu cầu người dùng
    // this.checkAndStartOnboarding();
  }

  // ===========================
  // LIFECYCLE & INITIALIZATION
  // ===========================
  private loadUserInfo(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.currentUser.name = userInfo.displayName || userInfo.email || 'Kien';
    }
  }

  private checkAndStartOnboarding(): void {
    // Đã tắt onboarding theo yêu cầu người dùng
    // setTimeout(() => {
    //   if (!this.onboardingService.hasCompletedOnboarding()) {
    //     this.onboardingService.startDashboardTour();
    //   }
    // }, 500);
  }

  // ===========================
  // WELCOME HEADER METHODS
  // ===========================
  getGreetingIcon(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    if (hour < 20) return '🌆';
    return '🌙';
  }

  getGreetingText(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    if (hour < 20) return 'Chào buổi tối';
    return 'Chúc ngủ ngon';
  }

  getMotivationalQuote(): string {
    const quotes = [
      'Mỗi từ mới là một bước tiến trong hành trình của bạn! 🚀',
      'Hôm nay là ngày tuyệt vời để học thêm điều gì đó mới! ✨',
      'Kiên trì là chìa khóa để thành công trong việc học ngôn ngữ! 💪',
      'Bạn đang làm rất tốt, hãy tiếp tục phấn đấu! 🌟',
      'Từng ngày một chút, bạn sẽ đạt được mục tiêu của mình! 🎯',
      'Học tập là hành trình, không phải đích đến! 🛤️',
      'Hãy tự hào về những gì bạn đã đạt được! 🏆'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  getDailyProgress(): number {
    const studiedToday = this.currentUser.studiedToday || 0;
    const dailyGoal = 30; // 30 từ mỗi ngày
    return Math.min((studiedToday / dailyGoal) * 100, 100);
  }

  minimizeWelcome(): void {
    this.isWelcomeMinimized = !this.isWelcomeMinimized;
  }

  // ===========================
  // CALENDAR METHODS
  // ===========================
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
    
    // Random activity for demo
    const activityDates = [1, 3, 5, 7, 10, 13, 14, 15, 16, 17, 18, 22, 25, 28];
    
    // Previous month days
    for (let day = daysInPrevMonth - startingDayOfWeek + 1; day <= daysInPrevMonth; day++) {
      this.calendarDays.push({
        date: day,
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

  // ===========================
  // CHALLENGE METHODS
  // ===========================
  getChallengeIcon(type: string): string {
    switch (type) {
      case 'speed': return 'rocket';
      case 'accuracy': return 'bullseye';
      case 'streak': return 'fire';
      case 'vocabulary': return 'book';
      default: return 'trophy';
    }
  }

  acceptChallenge(challenge: ChallengeNotification): void {
    this.messageService.success(`Đã chấp nhận thách đấu từ ${challenge.senderName}!`);
    this.challengeNotifications = this.challengeNotifications.filter(c => c.id !== challenge.id);
  }

  declineChallenge(challenge: ChallengeNotification): void {
    this.messageService.info(`Đã từ chối thách đấu từ ${challenge.senderName}`);
    this.challengeNotifications = this.challengeNotifications.filter(c => c.id !== challenge.id);
  }

  // ===========================
  // NAVIGATION METHODS
  // ===========================
  navigateToAction(action: string): void {
    console.log('Navigate to:', action);
    this.messageService.info(`Chức năng ${action} đang được phát triển!`);
  }

  navigateToDailyReview(): void {
    this.router.navigate(['/app/daily-review']);
  }

  // ===========================
  // DECK MANAGEMENT
  // ===========================
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
}