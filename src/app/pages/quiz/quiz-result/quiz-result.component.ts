import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuizService } from '../../../services/quiz.service';
import { QuizResult } from '../../../interfaces/quiz.interface';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzStatisticModule,
    NzProgressModule,
    NzResultModule,
    NzSpinModule
  ],
  providers: [NzMessageService],
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.scss']
})
export class QuizResultComponent implements OnInit {
  deckId!: number;
  result?: QuizResult;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    // Thử nhiều cách lấy deckId từ route
    this.route.parent?.parent?.params.subscribe(params => {
      this.deckId = +params['id'];
      if (this.deckId) {
        this.loadQuizResult();
      }
    });
    
    // Backup: thử lấy từ route khác
    if (!this.deckId) {
      this.route.parent?.params.subscribe(params => {
        this.deckId = +params['id'];
        if (this.deckId) {
          this.loadQuizResult();
        }
      });
    }
    
    // Backup 2: thử lấy từ URL trực tiếp
    if (!this.deckId) {
      const urlSegments = this.router.url.split('/');
      const studyIndex = urlSegments.findIndex(segment => segment === 'study');
      if (studyIndex >= 0 && urlSegments[studyIndex + 1]) {
        this.deckId = +urlSegments[studyIndex + 1];
        if (this.deckId) {
          this.loadQuizResult();
        }
      }
    }
  }

  /**
   * Tải kết quả quiz
   */
  loadQuizResult(): void {
    if (!this.deckId) {
      console.error('DeckId is missing');
      this.message.error('Không tìm thấy thông tin deck');
      this.isLoading = false;
      return;
    }

    this.quizService.getQuizResult(this.deckId).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading quiz result:', error);
        this.message.error('Lỗi khi tải kết quả quiz. Vui lòng thử lại!');
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // Navigate back sau 2 giây
        setTimeout(() => {
          this.router.navigate(['/app/deck', this.deckId]);
        }, 2000);
      }
    });
  }

  /**
   * Lấy icon kết quả dựa trên độ chính xác
   */
  getResultIcon(): string {
    if (!this.result) return 'question';
    
    const accuracy = this.result.accuracyPercentage;
    if (accuracy >= 90) return 'trophy';
    if (accuracy >= 80) return 'like';
    if (accuracy >= 70) return 'meh';
    return 'frown';
  }

  /**
   * Lấy trạng thái kết quả
   */
  getResultStatus(): 'success' | 'info' | 'warning' | 'error' {
    if (!this.result) return 'info';
    
    const accuracy = this.result.accuracyPercentage;
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'info';
    if (accuracy >= 40) return 'warning';
    return 'error';
  }

  /**
   * Lấy màu cho progress bar
   */
  getProgressColor(): string {
    if (!this.result) return '#1890ff';
    
    const accuracy = this.result.accuracyPercentage;
    if (accuracy >= 80) return '#52c41a';
    if (accuracy >= 60) return '#1890ff';
    if (accuracy >= 40) return '#faad14';
    return '#ff4d4f';
  }

  /**
   * Format thời gian (seconds -> mm:ss)
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Làm lại quiz
   */
  retakeQuiz(): void {
    this.router.navigate(['/app/study', this.deckId, 'quiz']);
  }

  /**
   * Quay lại study mode
   */
  backToStudyMode(): void {
    this.router.navigate(['/app/study-mode', this.deckId], {
      queryParams: { refresh: Date.now() }
    });
  }

  /**
   * Custom formatter cho progress circle
   */
  progressFormatter = (percent: number): string => {
    return `${percent}%`;
  };

  /**
   * Tiếp tục với chế độ khác
   */
  continueWithFlashcard(): void {
    this.router.navigate(['/app/study', this.deckId, 'flashcard']);
  }
}