import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { LearningProgressService } from '../../services/learning-progress.service';
import { DeckService } from '../../services/deck.service';
import { LearningProgressDTO, LearningModeStatus } from '../../interfaces/learning-progress.dto';
import { DeckDTO } from '../../interfaces/deck.dto';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzBadgeModule,
    NzToolTipModule,
    NzTagModule,
    NzSpinModule
  ],
  providers: [NzMessageService],
  templateUrl: './learning-path.component.html',
  styleUrls: ['./learning-path.component.scss']
})
export class LearningPathComponent implements OnInit {
  deckId!: number;
  deck?: DeckDTO;
  progress?: LearningProgressDTO;
  learningModes: LearningModeStatus[] = [];
  isLoading = true;
  overallProgress = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private learningProgressService: LearningProgressService,
    private deckService: DeckService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.deckId = +params['id'];
      if (this.deckId) {
        this.loadData();
      }
    });
  }

  private loadData(): void {
    this.isLoading = true;

    // Load deck info
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (deck) => {
        this.deck = deck;
        
        // Load learning progress
        this.learningProgressService.getDeckProgress(this.deckId).subscribe({
          next: (progress) => {
            this.progress = progress;
            this.learningModes = this.learningProgressService.getLearningModes(progress);
            this.overallProgress = this.learningProgressService.calculateOverallProgress(progress);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading progress:', error);
            this.isLoading = false;
            this.message.error('Không thể tải tiến độ học tập');
          }
        });
      },
      error: (error) => {
        console.error('Error loading deck:', error);
        this.isLoading = false;
        this.message.error('Không thể tải thông tin bộ thẻ');
      }
    });
  }

  startMode(mode: LearningModeStatus): void {
    if (mode.isLocked) {
      this.message.warning(`Hãy hoàn thành "${this.getPreviousModeName(mode.order)}" trước!`);
      return;
    }

    if (mode.isCompleted) {
      // Ask if user wants to retry
      const confirmRetry = confirm(`Bạn đã hoàn thành chế độ này. Bạn có muốn học lại không?`);
      if (!confirmRetry) return;
    }

    // Navigate to the specific mode
    this.navigateToMode(mode.mode);
  }

  private navigateToMode(mode: string): void {
    switch (mode) {
      case 'flashcard':
        this.router.navigate(['/app/deck', this.deckId, 'study']);
        break;
      case 'quiz':
        this.router.navigate(['/app/deck', this.deckId, 'quiz']);
        break;
      case 'listening':
        this.router.navigate(['/app/deck', this.deckId, 'listening-practice']);
        break;
      case 'writing':
        this.router.navigate(['/app/deck', this.deckId, 'writing-practice']);
        break;
    }
  }

  private getPreviousModeName(order: number): string {
    const previousMode = this.learningModes.find(m => m.order === order - 1);
    return previousMode ? previousMode.nameVi : '';
  }

  getProgressColor(): string {
    if (this.overallProgress === 100) return '#52c41a';
    if (this.overallProgress >= 75) return '#10b981';
    if (this.overallProgress >= 50) return '#f59e0b';
    if (this.overallProgress >= 25) return '#3b82f6';
    return '#e5e7eb';
  }

  getCompletedCount(): number {
    return this.learningModes.filter(m => m.isCompleted).length;
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId]);
  }

  trackByMode(index: number, mode: LearningModeStatus): string {
    return mode.mode;
  }
}
