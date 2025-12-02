import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuizService } from '../../services/quiz.service';
import { LearningProgressService } from '../../services/learning-progress.service';
import { QuizQuestion, QuizAnswer, QuizAnswerResult } from '../../interfaces/quiz.interface';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzAlertModule,
    NzSpinModule
  ],
  providers: [NzMessageService],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  deckId!: number;
  currentQuestion?: QuizQuestion;
  selectedAnswerIndex: number | null = null;
  showResult = false;
  answerResult?: QuizAnswerResult;
  isLoading = false;
  isSubmitting = false;
  startTime = Date.now();

  // Stats
  totalQuestions = 0;
  currentQuestionNumber = 0;
  correctAnswers = 0;
  wrongAnswers = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private learningProgressService: LearningProgressService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Lấy deckId từ route params
    this.route.parent?.params.subscribe(params => {
      this.deckId = +params['id'];
      this.startQuiz();
    });
  }

  ngOnDestroy(): void {
    // Cleanup nếu cần
  }

  /**
   * Bắt đầu quiz mới
   */
  startQuiz(): void {
    this.isLoading = true;
    this.startTime = Date.now();

    this.quizService.startQuiz(this.deckId).subscribe({
      next: (question) => {
        this.currentQuestion = question;
        this.totalQuestions = question.totalQuestions;
        this.currentQuestionNumber = question.questionNumber;
        this.resetQuestionState();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error starting quiz:', error);
        this.message.error('Lỗi khi bắt đầu quiz: ' + error.message);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Chọn đáp án và submit luôn
   */
  selectAnswer(index: number): void {
    if (this.isSubmitting || this.showResult) {
      return;
    }
    
    this.selectedAnswerIndex = index;
    
    // Auto submit sau khi chọn với delay ngắn để UX mượt mà hơn
    setTimeout(() => {
      this.submitAnswer();
    }, 300);
  }

  /**
   * Submit đáp án đã chọn
   */
  submitAnswer(): void {
    if (this.selectedAnswerIndex === null || !this.currentQuestion || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const responseTime = Date.now() - this.startTime;
    const answer: QuizAnswer = {
      cardId: this.currentQuestion.cardId,
      selectedAnswerIndex: this.selectedAnswerIndex,
      responseTime: responseTime
    };

    this.quizService.submitAnswer(this.deckId, answer).subscribe({
      next: (result) => {
        this.answerResult = result;
        this.showResult = true;
        this.isSubmitting = false;

        // Update stats
        if (result.isCorrect) {
          this.correctAnswers++;
        } else {
          this.wrongAnswers++;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
        this.message.error('Lỗi khi gửi câu trả lời: ' + error.message);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Chuyển sang câu hỏi tiếp theo
   */
  nextQuestion(): void {
    if (!this.answerResult) {
      return;
    }

    if (this.answerResult.nextQuestion) {
      // Còn câu hỏi tiếp theo
      this.currentQuestion = this.answerResult.nextQuestion;
      this.currentQuestionNumber = this.answerResult.nextQuestion.questionNumber;
      this.resetQuestionState();
      this.startTime = Date.now(); // Reset timer cho câu hỏi mới
    } else {
      // Hết câu hỏi -> hoàn thành quiz
      this.completeQuiz();
    }
  }

  /**
   * Hoàn thành quiz và cập nhật progress
   */
  completeQuiz(): void {
    const score = this.totalQuestions > 0 ? 
      Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
    
    // Update learning progress
    this.learningProgressService.updateProgress(this.deckId, {
      mode: 'quiz',
      completed: true,
      score: score
    }).subscribe({
      next: () => {
        this.message.success(`🎉 Hoàn thành Quiz! Điểm: ${score}/100. Listening Practice đã được mở khóa!`);
        setTimeout(() => {
          this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error updating progress:', error);
        this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
      }
    });
  }

  /**
   * Reset trạng thái cho câu hỏi mới
   */
  private resetQuestionState(): void {
    this.selectedAnswerIndex = null;
    this.showResult = false;
    this.answerResult = undefined;
  }

  /**
   * Lấy class CSS cho button đáp án
   */
  getAnswerButtonClass(index: number): string {
    const baseClass = 'answer-button';
    
    if (!this.showResult) {
      // Chưa submit -> chỉ highlight khi được chọn
      return this.selectedAnswerIndex === index ? 
        `${baseClass} selected` : baseClass;
    }
    
    // Đã submit -> hiển thị kết quả
    if (index === this.answerResult?.correctAnswerIndex) {
      return `${baseClass} correct`;
    }
    
    if (index === this.selectedAnswerIndex && !this.answerResult?.isCorrect) {
      return `${baseClass} wrong`;
    }
    
    return baseClass;
  }

  /**
   * Kiểm tra xem có thể submit không
   */
  canSubmit(): boolean {
    return this.selectedAnswerIndex !== null && !this.isSubmitting && !this.showResult;
  }

  /**
   * Tính phần trăm hoàn thành
   */
  get progressPercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.currentQuestionNumber / this.totalQuestions) * 100);
  }

  /**
   * Lấy chữ cái cho option (A, B, C, D)
   */
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Quay lại learning path
   */
  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
  }
}