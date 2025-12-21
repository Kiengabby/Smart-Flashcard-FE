import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { ArenaService } from '../../services/arena.service';
import { ArenaSession, ArenaQuestion, ArenaAnswer } from '../../interfaces/arena.model';

@Component({
  selector: 'app-arena-game',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzBadgeModule,
    NzModalModule
  ],
  templateUrl: './arena-game.component.html',
  styleUrls: ['./arena-game.component.scss']
})
export class ArenaGameComponent implements OnInit, OnDestroy {
  sessionId!: number;
  session?: ArenaSession;
  
  currentQuestionIndex = 0;
  selectedAnswers: ArenaAnswer[] = [];
  questionStartTime = 0;
  
  // 🚀 ĐẾM LÊN từ 0 thay vì đếm ngược
  elapsedTime = 0;
  timerInterval?: any;
  
  selectedOption: string | null = null;
  answeredCorrectly?: boolean;
  showFeedback = false;
  
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arenaService: ArenaService,
    private message: NzMessageService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get session from router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || window.history.state;
    
    this.route.params.subscribe(params => {
      this.sessionId = +params['id'];
      console.log('🎮 Arena Game Init - Session ID:', this.sessionId);
      
      if (state && state['session']) {
        this.session = state['session'];
        console.log('✅ Session loaded from router state:', this.session);
        
        // ✅ Use setTimeout with 0 delay to avoid NG0100
        setTimeout(() => {
          this.elapsedTime = 0;
          this.questionStartTime = Date.now();
          this.startTimer();
          console.log('⏰ Timer started!');
        }, 0);
      } else {
        console.error('❌ No session data in router state');
        this.message.error('Lỗi: Không có dữ liệu phiên chơi');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      console.log('⏹️ Timer stopped');
    }
  }

  // 🚀 Đếm LÊN từ 0 - Run outside Angular zone to avoid NG0100
  startTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
        // Manually trigger change detection every second
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      }, 1000);
    });
  }

  get currentQuestion(): ArenaQuestion | undefined {
    const question = this.session?.questions[this.currentQuestionIndex];
    console.log('🔍 Current Question:', question);
    console.log('📝 Question Text:', question?.questionText);
    console.log('📋 Options:', question?.options);
    return question;
  }

  get progress(): number {
    if (!this.session) return 0;
    return ((this.currentQuestionIndex + 1) / this.session.totalQuestions) * 100;
  }

  selectOption(option: string): void {
    if (this.showFeedback) return; // Đã chọn rồi thì không cho chọn nữa
    
    // Use NgZone to avoid NG0100
    this.ngZone.run(() => {
      this.selectedOption = option;
      
      // 🚀 Kiểm tra đúng/sai NGAY LẬP TỨC (như Quiz mode)
      const correctAnswer = this.currentQuestion?.correctAnswer;
      this.answeredCorrectly = (option === correctAnswer);
      
      // Lưu câu trả lời
      const timeSpent = Math.floor((Date.now() - this.questionStartTime) / 1000);
      this.selectedAnswers.push({
        cardId: this.currentQuestion!.cardId,
        selectedAnswer: option,
        timeSpent: timeSpent
      });

      // Show feedback (màu xanh/đỏ)
      this.showFeedback = true;
      
      console.log(`✅ Chọn: "${option}" | Đúng: "${correctAnswer}" | Kết quả: ${this.answeredCorrectly ? '✅ ĐÚNG' : '❌ SAI'}`);
      
      this.cdr.detectChanges();
    });
    
    // 🚀 TỰ ĐỘNG chuyển câu sau 1.5 giây (không cần button)
    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  // Không cần submitAnswer() nữa - tự động submit khi chọn!

  nextQuestion(): void {
    // Use NgZone to avoid NG0100
    this.ngZone.run(() => {
      this.showFeedback = false;
      this.selectedOption = null;
      this.answeredCorrectly = undefined;
      
      if (this.currentQuestionIndex < (this.session?.totalQuestions || 0) - 1) {
        this.currentQuestionIndex++;
        this.questionStartTime = Date.now();
      } else {
        this.submitGame();
      }
      this.cdr.detectChanges();
    });
  }

  playAudio(): void {
    if (this.currentQuestion?.audioUrl) {
      const audio = new Audio(this.currentQuestion.audioUrl);
      audio.play();
    }
  }

  submitGame(): void {
    if (!this.session) return;
    
    // Use NgZone to avoid NG0100
    this.ngZone.run(() => {
      this.submitting = true;
      this.cdr.detectChanges();
    });
    
    this.arenaService.submitArenaResult(this.sessionId, {
      answers: this.selectedAnswers,
      totalTimeUsed: this.elapsedTime
    }).subscribe({
      next: (result) => {
        console.log('✅ Game submitted, result:', result);
        
        // ✅ Ensure deckId is in result (fallback to session.deckId if needed)
        if (!result.deckId && this.session?.deckId) {
          result.deckId = this.session.deckId;
          console.log('⚠️ Added deckId from session:', result.deckId);
        }
        
        // Navigate with result data in state to avoid NG0100
        setTimeout(() => {
          this.router.navigate(['/app/arena/result', this.sessionId], {
            state: { result }
          });
        }, 0);
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.message.error('❌ Không thể gửi kết quả');
          this.submitting = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  quitGame(): void {
    if (confirm('⚠️ Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      clearInterval(this.timerInterval);
      this.router.navigate(['/app/arena/lobby', this.session?.deckId]);
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
