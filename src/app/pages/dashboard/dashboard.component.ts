import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { CardService, StudyStats } from '../../services/card.service';
import { DailyReviewService } from '../../services/daily-review.service';
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
    conqueredDecks: 0,
    studyStreak: 0,
    totalWordsLearned: 0,
    reviewToday: 0,
    totalDecks: 0,
    activeChallenges: 0
  };

  currentUser = {
    name: 'Kien',
    totalDecks: 0,
    studiedToday: 0
  };

  // ===========================
  // UI STATE
  // ===========================
  decks: DeckDTO[] = [];
  isLoading = true;
  isStatsLoading = true; // Khởi tạo là true để hiển thị loading ban đầu
  isCalendarLoading = true; // Khởi tạo là true để hiển thị loading ban đầu
  isWelcomeMinimized = false;
  motivationalQuote: string = ''; // Cache quote để tránh lỗi ExpressionChanged

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
    private cardService: CardService,
    private dailyReviewService: DailyReviewService,
    private cdr: ChangeDetectorRef,
    // private onboardingService: OnboardingService, // Đã tắt
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.motivationalQuote = this.generateMotivationalQuote(); // Set quote một lần
    
    // Initialize calendar với empty data trước
    this.generateCalendar(new Map());
    
    // Sử dụng Promise.resolve để đảm bảo thực thi trong nextTick
    Promise.resolve().then(() => {
      this.loadStudyStats();
      this.loadCalendarData();
      this.loadDecks();
    });
    
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
    return this.motivationalQuote;
  }

  generateMotivationalQuote(): string {
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
  
  loadCalendarData(): void {
    this.isCalendarLoading = true;

    // Load calendar activity data với review counts
    this.cardService.getCalendarActivity(this.currentYear, this.currentMonth).subscribe({
      next: (activityData) => {
        // Convert CalendarActivityData[] to Map for easy lookup
        const activityMap = new Map<number, { reviewCount: number; activityLevel: number }>();
        activityData.forEach(data => {
          activityMap.set(data.day, { 
            reviewCount: data.reviewCount, 
            activityLevel: data.activityLevel 
          });
        });
        
        this.generateCalendar(activityMap);
        this.isCalendarLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu calendar:', error);
        // Fallback với dữ liệu mặc định
        this.generateCalendar(new Map());
        this.isCalendarLoading = false;
      }
    });
  }

  generateCalendar(activityMap: Map<number, { reviewCount: number; activityLevel: number }> = new Map()): void {
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
    
    // Current month days - use REAL data from activityMap
    for (let day = 1; day <= daysInMonth; day++) {
      const activityData = activityMap.get(day);
      const hasActivity = activityData !== undefined;
      
      this.calendarDays.push({
        date: day,
        currentMonth: true,
        isToday: isCurrentMonth && day === todayDate,
        hasActivity: hasActivity,
        activityLevel: hasActivity ? activityData.activityLevel : 0
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
    this.loadCalendarData(); // Load dữ liệu mới cho tháng được chọn
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadCalendarData(); // Load dữ liệu mới cho tháng được chọn
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
    this.messageService.info(`Chức năng ${action} đang được phát triển!`);
  }

  navigateToDailyReview(): void {
    this.router.navigate(['/app/daily-review']);
  }

  // ===========================
  // DECK MANAGEMENT
  // ===========================
  
  loadStudyStats(): void {
    this.isStatsLoading = true;
    this.cdr.detectChanges();

    // Sử dụng DailyReviewService để lấy dữ liệu THẬT
    this.dailyReviewService.getDailyOverview().subscribe({
      next: (overview) => {
        // Cập nhật stats với dữ liệu THẬT từ backend
        this.stats = {
          // Streak THẬT từ review history
          studyStreak: overview.currentStreak || 0,
          
          // Thẻ cần ôn tập THẬT
          reviewToday: overview.totalDue || 0,
          
          // Bộ thẻ đã chinh phục = số thẻ MASTERED
          conqueredDecks: overview.learningDistribution?.mastered || 0,
          
          // Tổng từ đã học = tổng các thẻ không phải NEW
          totalWordsLearned: 
            (overview.learningDistribution?.learning || 0) +
            (overview.learningDistribution?.review || 0) +
            (overview.learningDistribution?.mastered || 0),
          
          // Placeholder cho total decks (sẽ được update từ loadDecks)
          totalDecks: this.stats.totalDecks || 0,
          
          // Active challenges - placeholder
          activeChallenges: 3
        };
        
        // Cập nhật currentUser stats
        this.currentUser.studiedToday = overview.hasStudiedToday ? 1 : 0;
        
        this.isStatsLoading = false;
        this.cdr.detectChanges();
        
        console.log('✅ Dashboard stats loaded from REAL data:', {
          streak: this.stats.studyStreak,
          dueCards: this.stats.reviewToday,
          conquered: this.stats.conqueredDecks,
          totalWords: this.stats.totalWordsLearned
        });
      },
      error: (error) => {
        console.error('Lỗi khi tải thống kê từ Daily Review:', error);
        this.messageService.warning('Không thể tải thống kê học tập. Hiển thị dữ liệu mặc định.');
        
        // Fallback data
        this.stats = {
          conqueredDecks: 0,
          studyStreak: 0,
          totalWordsLearned: 0,
          reviewToday: 0,
          totalDecks: 0,
          activeChallenges: 0
        };
        this.isStatsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
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
    // Chỉ cập nhật những thông tin cần thiết từ deck data
    // Thông tin khác đã được cập nhật từ loadStudyStats()
    if (this.stats.totalDecks === 0) {
      this.currentUser.totalDecks = this.decks.length;
    }
  }
}