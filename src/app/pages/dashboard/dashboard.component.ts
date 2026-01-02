import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// Services & Interfaces
import { DeckService } from '../../services/deck.service';
import { TokenService } from '../../services/token.service';
import { CardService } from '../../services/card.service';
import { DailyReviewService } from '../../services/daily-review.service';
import { ArenaService } from '../../services/arena.service';
import { InvitationService } from '../../services/invitation.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { UserRankingAlert } from '../../interfaces/arena.model';
import { Invitation, InvitationStatus } from '../../interfaces/invitation.model';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';

// Type Definitions
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
    NzBadgeModule,
    NzTagModule,
    NzAlertModule,
    NzToolTipModule,
  ],
  providers: [NzModalService, NzMessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', './dashboard-cute-book-bg.css'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
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
  isStatsLoading = true;
  isCalendarLoading = true;
  isWelcomeMinimized = false;
  motivationalQuote: string = '';
  
  // Arena Rankings
  rankingAlerts: UserRankingAlert[] = [];
  isLoadingRankings = true;

  // Invitations
  pendingInvitations: Invitation[] = [];
  isLoadingInvitations = true;
  InvitationStatus = InvitationStatus;
  private processingInvitations = new Set<number>();

  // ===========================
  // CALENDAR STATE
  // ===========================
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];

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
    private arenaService: ArenaService,
    private invitationService: InvitationService,
    private cdr: ChangeDetectorRef,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.motivationalQuote = this.generateMotivationalQuote();
    this.generateCalendar(new Map());
    
    Promise.resolve().then(() => {
      this.loadStudyStats();
      this.loadCalendarData();
      this.loadDecks();
      this.loadPendingInvitations();
      // this.loadRankingAlerts(); // 🔕 DISABLED: Waiting for backend API
    });
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
      'Mỗi từ mới là một bước tiến trong hành trình của bạn!',
      'Hôm nay là ngày tuyệt vời để học thêm điều gì đó mới!',
      'Kiên trì là chìa khóa để thành công trong việc học ngôn ngữ!',
      'Bạn đang làm rất tốt, hãy tiếp tục phấn đấu!',
      'Từng ngày một chút, bạn sẽ đạt được mục tiêu của mình!',
      'Học tập là hành trình, không phải đích đến!',
      'Hãy tự hào về những gì bạn đã đạt được!'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  getDailyProgress(): number {
    const studiedToday = this.currentUser.studiedToday || 0;
    const dailyGoal = 30;
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

    this.cardService.getCalendarActivity(this.currentYear, this.currentMonth).subscribe({
      next: (activityData) => {
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
    
    // Current month days
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
    this.loadCalendarData();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadCalendarData();
  }

  // ===========================
  // ARENA RANKINGS - TEMPORARILY DISABLED
  // ===========================
  // 🔕 TODO: Enable when backend API /api/arena/my-rankings is ready
  
  /*
  loadRankingAlerts(): void {
    this.isLoadingRankings = true;
    
    // Real API call:
    this.arenaService.getUserRankings().subscribe({
      next: (rankings) => {
        this.rankingAlerts = rankings;
        this.isLoadingRankings = false;
        console.log('✅ Ranking alerts loaded:', rankings);
      },
      error: (error) => {
        console.error('❌ Error loading ranking alerts:', error);
        this.isLoadingRankings = false;
        this.rankingAlerts = [];
      }
    });
  }
  */

  // 🧪 Mock data & helper methods (for future use when backend is ready)
  /*
  private getMockRankingData(): UserRankingAlert[] {
    return [
      {
        deckId: 9,
        deckName: 'English Vocabulary - Business',
        currentRank: 2,
        previousRank: 5,
        totalPlayers: 45,
        rankChange: 3,
        topPlayerName: 'Nguyễn Văn A',
        topPlayerScore: 850,
        userScore: 820,
        pointsBehind: 30,
        playersAhead: 1
      },
      {
        deckId: 12,
        deckName: 'Japanese N5 - Kanji',
        currentRank: 1,
        previousRank: 1,
        totalPlayers: 30,
        rankChange: 0,
        topPlayerName: 'Bạn',
        topPlayerScore: 920,
        userScore: 920,
        pointsBehind: 0,
        playersAhead: 0
      },
      {
        deckId: 15,
        deckName: 'TOEIC Vocabulary',
        currentRank: 8,
        previousRank: 5,
        totalPlayers: 60,
        rankChange: -3,
        topPlayerName: 'Trần Thị B',
        topPlayerScore: 950,
        userScore: 680,
        pointsBehind: 270,
        playersAhead: 7
      }
    ];
  }

  getRankIcon(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  }

  getRankChangeText(alert: UserRankingAlert): string {
    if (alert.rankChange > 0) {
      return `Tăng ${alert.rankChange} hạng! 📈`;
    } else if (alert.rankChange < 0) {
      return `Giảm ${Math.abs(alert.rankChange)} hạng 📉`;
    }
    return 'Không đổi';
  }

  getRankAlertClass(alert: UserRankingAlert): string {
    if (alert.currentRank <= 3) return 'top-rank';
    if (alert.rankChange > 0) return 'rank-up';
    if (alert.rankChange < 0) return 'rank-down';
    return 'rank-stable';
  }

  goToArenaLeaderboard(deckId: number): void {
    this.router.navigate(['/app/arena/leaderboard', deckId]);
  }

  goToArenaLobby(deckId: number): void {
    this.router.navigate(['/app/arena/lobby', deckId]);
  }
  */

  // ===========================
  // HELPER METHODS
  // ===========================
  
  private getCurrentUserId(): number {
    const userInfo = this.tokenService.getUserInfo();
    return userInfo?.id || 0;
  }

  getAvatarColor(name: string): string {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getAvatarGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #aed581 0%, #9ccc65 100%)',  // Light lime - nhẹ nhàng
      'linear-gradient(135deg, #c5e1a5 0%, #aed581 100%)',  // Pale lime - pastel
      'linear-gradient(135deg, #9ccc65 0%, #8bc34a 100%)',  // Lime green - mềm mại
      'linear-gradient(135deg, #dcedc8 0%, #c5e1a5 100%)',  // Very pale lime - rất nhẹ
      'linear-gradient(135deg, #8bc34a 0%, #7cb342 100%)'   // Sage green - thanh lịch
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  // ===========================
  // NAVIGATION METHODS
  // ===========================
  navigateToAction(action: string): void {
    this.messageService.info(`Chức năng ${action} đang được phát triển!`);
  }

  navigateToDailyReview(): void {
    // Bắt đầu ôn tập trực tiếp mà không hiển thị giao diện thống kê
    this.startDirectReview();
  }

  private startDirectReview(): void {
    // Bắt đầu session ôn tập và chuyển thẳng vào giao diện học
    this.dailyReviewService.startReviewSession().subscribe({
      next: (response) => {
        if (response && response.cards && response.cards.length > 0) {
          // Chuyển vào giao diện flashcard study với dữ liệu từ daily review
          this.router.navigate(['/app/flashcard-study'], {
            queryParams: { 
              sessionId: response.sessionId,
              source: 'daily-review'
            },
            state: { reviewSession: response }
          });
        } else {
          // Không có thẻ nào để ôn tập
          this.messageService.info('Không có thẻ nào cần ôn tập hôm nay!');
        }
      },
      error: (error) => {
        console.error('Error starting direct review session:', error);
        this.messageService.error('Không thể bắt đầu phiên ôn tập. Vui lòng thử lại!');
      }
    });
  }

  // ===========================
  // DECK MANAGEMENT
  // ===========================
  
  loadStudyStats(): void {
    this.isStatsLoading = true;
    this.cdr.detectChanges();

    this.dailyReviewService.getDailyOverview().subscribe({
      next: (overview) => {
        this.stats = {
          studyStreak: overview.currentStreak || 0,
          reviewToday: overview.totalDue || 0,
          conqueredDecks: overview.learningDistribution?.mastered || 0,
          totalWordsLearned: 
            (overview.learningDistribution?.learning || 0) +
            (overview.learningDistribution?.review || 0) +
            (overview.learningDistribution?.mastered || 0),
          totalDecks: this.stats.totalDecks || 0,
          activeChallenges: this.stats.activeChallenges || 0
        };
        
        this.currentUser.studiedToday = overview.hasStudiedToday ? 1 : 0;
        this.isStatsLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải thống kê từ Daily Review:', error);
        this.messageService.warning('Không thể tải thống kê học tập. Hiển thị dữ liệu mặc định.');
        
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
    if (this.stats.totalDecks === 0) {
      this.currentUser.totalDecks = this.decks.length;
    }
  }

  // ===========================
  // INVITATION MANAGEMENT
  // ===========================
  
  loadPendingInvitations(): void {
    this.isLoadingInvitations = true;
    
    this.invitationService.getReceivedInvitations().subscribe({
      next: (invitations) => {
        // Chỉ lấy invitations có status PENDING
        this.pendingInvitations = invitations.filter(inv => inv.status === InvitationStatus.PENDING);
        this.isLoadingInvitations = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading pending invitations:', error);
        this.pendingInvitations = [];
        this.isLoadingInvitations = false;
        this.cdr.detectChanges();
      }
    });
  }

  acceptInvitation(invitation: Invitation): void {
    this.processingInvitations.add(invitation.id);
    
    this.invitationService.respondToInvitation(invitation.id, true).subscribe({
      next: () => {
        // Dùng NgZone để tránh NG0100 error
        this.ngZone.run(() => {
          // Xóa khỏi processing set
          this.processingInvitations.delete(invitation.id);
          
          // Hiển thị thông báo thành công
          this.messageService.success(
            `🎉 Đã thêm bộ thẻ "${invitation.deck.name}" vào thư viện của bạn!`,
            { nzDuration: 3000 }
          );
          
          // Refresh data
          this.loadPendingInvitations();
          this.loadDecks();
          
          // Trigger change detection
          this.cdr.detectChanges();
          
          // Điều hướng đến thư viện sau 800ms
          setTimeout(() => {
            this.router.navigate(['/app/deck-library']).then(
              success => {
                if (!success) {
                  console.error('Navigation failed to /app/deck-library');
                  this.messageService.info('Vui lòng vào menu Thư viện để xem bộ thẻ mới!');
                }
              }
            );
          }, 800);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error accepting invitation:', error);
          this.processingInvitations.delete(invitation.id);
          this.messageService.error('Có lỗi xảy ra khi chấp nhận lời mời. Vui lòng thử lại!');
          this.cdr.detectChanges();
        });
      }
    });
  }

  rejectInvitation(invitation: Invitation): void {
    this.processingInvitations.add(invitation.id);
    
    this.invitationService.respondToInvitation(invitation.id, false).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.processingInvitations.delete(invitation.id);
          this.messageService.info(`Đã từ chối lời mời từ ${invitation.inviter.name}`);
          this.loadPendingInvitations();
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('Error rejecting invitation:', error);
          this.processingInvitations.delete(invitation.id);
          this.messageService.error('Có lỗi xảy ra khi từ chối lời mời. Vui lòng thử lại!');
          this.cdr.detectChanges();
        });
      }
    });
  }

  isInvitationProcessing(invitationId: number): boolean {
    return this.processingInvitations.has(invitationId);
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  }

  trackByInvitationId(index: number, invitation: Invitation): number {
    return invitation.id;
  }

  // ===========================
  // HELPER METHODS
  // ===========================
}