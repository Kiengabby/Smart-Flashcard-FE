import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

// Ng-Zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

// Services and interfaces
import { ChallengeService } from '../../services/challenge.service';
import { Challenge } from '../../interfaces/challenge.model';

interface QuizQuestion {
  id: number;
  front: string;
  back: string;
  options: string[];
  correctIndex: number;
}

interface QuizResult {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

@Component({
  selector: 'app-challenge-arena',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzRadioModule,
    NzSpinModule,
    NzResultModule,
    NzStatisticModule,
    NzTagModule,
    NzAvatarModule
  ],
  templateUrl: './challenge-arena.component.html',
  styleUrls: ['./challenge-arena.component.scss']
})
export class ChallengeArenaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timerSubscription?: Subscription;
  private questionStartTime = 0;

  // Challenge data
  challengeId!: number;
  challenge: Challenge | null = null;
  questions: QuizQuestion[] = [];
  
  // Quiz state
  currentQuestionIndex = 0;
  selectedAnswers: QuizResult[] = [];
  answerForm: FormGroup;
  
  // Timer state
  timeRemaining = 300; // 5 minutes default
  totalTime = 300;
  isTimeUp = false;
  
  // UI state
  isLoading = true;
  isQuizStarted = false;
  isQuizCompleted = false;
  showCountdown = true;
  countdownSeconds = 3;
  
  // Results
  finalScore = 0;
  totalTimeSpent = 0;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private challengeService: ChallengeService,
    private message: NzMessageService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef
  ) {
    this.answerForm = this.fb.group({
      selectedOption: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.challengeId = +params['id'];
      this.loadChallengeData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerSubscription?.unsubscribe();
  }

  async loadChallengeData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Get challenge details
      this.challenge = (await this.challengeService.getChallengeDetails(this.challengeId).toPromise()) || null;
      
      if (!this.challenge) {
        this.message.error('Không tìm thấy thách đấu');
        this.router.navigate(['/app/challenges']);
        return;
      }

      // Get quiz data
      const quizData = (await this.challengeService.getEnhancedChallengeQuizData(this.challengeId).toPromise()) || { questions: [] };
      this.questions = quizData.questions || this.generateMockQuestions();
      
      this.totalTime = this.challenge.timeLimit;
      this.timeRemaining = this.totalTime;
      
      this.isLoading = false;
      this.startCountdown();
      
    } catch (error) {
      console.error('Error loading challenge data:', error);
      this.message.error('Không thể tải dữ liệu thách đấu');
      this.router.navigate(['/app/challenges']);
    }
  }

  // Mock questions for testing
  private generateMockQuestions(): QuizQuestion[] {
    return [
      {
        id: 1,
        front: "Hello",
        back: "Xin chào",
        options: ["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"],
        correctIndex: 0
      },
      {
        id: 2,
        front: "Thank you", 
        back: "Cảm ơn",
        options: ["Xin lỗi", "Cảm ơn", "Xin chào", "Tạm biệt"],
        correctIndex: 1
      },
      {
        id: 3,
        front: "Good morning",
        back: "Chào buổi sáng", 
        options: ["Chào buổi tối", "Chào buổi sáng", "Chào buổi chiều", "Chúc ngủ ngon"],
        correctIndex: 1
      },
      {
        id: 4,
        front: "How are you?",
        back: "Bạn có khỏe không?",
        options: ["Bạn tên gì?", "Bạn có khỏe không?", "Bạn ở đâu?", "Bạn làm gì?"],
        correctIndex: 1
      },
      {
        id: 5,
        front: "Water",
        back: "Nước",
        options: ["Đất", "Lửa", "Nước", "Gió"],
        correctIndex: 2
      }
    ];
  }

  startCountdown(): void {
    const countdown = interval(1000).pipe(take(3));
    
    countdown.subscribe({
      next: () => {
        this.countdownSeconds--;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.showCountdown = false;
        this.startQuiz();
      }
    });
  }

  startQuiz(): void {
    this.isQuizStarted = true;
    this.questionStartTime = Date.now();
    this.startTimer();
    this.cdr.detectChanges();
  }

  startTimer(): void {
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
          this.isTimeUp = true;
          this.completeQuiz();
        }
        
        this.cdr.detectChanges();
      });
  }

  submitAnswer(): void {
    const selectedOption = this.answerForm.get('selectedOption')?.value;
    
    if (selectedOption === null || selectedOption === undefined) {
      this.message.warning('Vui lòng chọn một đáp án!');
      return;
    }

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const timeSpent = Date.now() - this.questionStartTime;
    const isCorrect = selectedOption === currentQuestion.correctIndex;

    // Save result
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      isCorrect,
      timeSpent
    };
    
    this.selectedAnswers.push(result);

    // Show feedback
    if (isCorrect) {
      this.message.success('Chính xác! 🎉', { nzDuration: 1000 });
    } else {
      this.message.error(`Sai rồi! Đáp án đúng: ${currentQuestion.options[currentQuestion.correctIndex]}`, { nzDuration: 2000 });
    }

    // Move to next question or finish
    setTimeout(() => {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.nextQuestion();
      } else {
        this.completeQuiz();
      }
    }, 1500);
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;
    this.answerForm.reset();
    this.questionStartTime = Date.now();
    this.cdr.detectChanges();
  }

  completeQuiz(): void {
    this.isQuizCompleted = true;
    this.timerSubscription?.unsubscribe();
    
    // Calculate results
    this.finalScore = this.selectedAnswers.filter(r => r.isCorrect).length;
    this.totalTimeSpent = this.totalTime - this.timeRemaining;
    
    this.submitResults();
  }

  async submitResults(): Promise<void> {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    try {
      await this.challengeService.completeChallenge(
        this.challengeId,
        this.finalScore,
        this.totalTimeSpent
      ).toPromise();
      
      this.message.success('Đã nộp kết quả thành công!');
      
      // Navigate to results page after delay
      setTimeout(() => {
        this.router.navigate(['/app/challenge-result', this.challengeId]);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting results:', error);
      this.message.error('Có lỗi khi nộp kết quả. Thử lại sau!');
      this.isSubmitting = false;
    }
  }

  getProgressPercentage(): number {
    if (!this.isQuizStarted) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  getTimeProgressPercentage(): number {
    return ((this.totalTime - this.timeRemaining) / this.totalTime) * 100;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  exitChallenge(): void {
    this.modal.confirm({
      nzTitle: 'Thoát thách đấu?',
      nzContent: 'Bạn có chắc muốn thoát? Kết quả sẽ không được lưu.',
      nzOkText: 'Thoát',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.router.navigate(['/app/challenges']);
      }
    });
  }

  get Math() {
    return Math;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  get currentQuestion(): QuizQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get questionNumber(): number {
    return this.currentQuestionIndex + 1;
  }

  get totalQuestions(): number {
    return this.questions.length;
  }
}