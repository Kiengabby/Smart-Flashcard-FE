import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ArenaService } from '../../services/arena.service';
import { ArenaResult } from '../../interfaces/arena.model';

@Component({
  selector: 'app-arena-result',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzResultModule,
    NzStatisticModule,
    NzProgressModule,
    NzBadgeModule,
    NzTagModule,
    NzSpinModule
  ],
  templateUrl: './arena-result.component.html',
  styleUrls: ['./arena-result.component.scss']
})
export class ArenaResultComponent implements OnInit {
  sessionId!: number;
  result?: ArenaResult;
  loading = true;
  
  showConfetti = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arenaService: ArenaService,
    private message: NzMessageService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sessionId = +params['id'];
      
      // Try to get result from router state first
      const state = window.history.state;
      if (state && state['result']) {
        console.log('✅ Result loaded from router state:', state['result']);
        console.log('📋 deckId in result:', state['result'].deckId);
        // Use setTimeout to avoid NG0100
        setTimeout(() => {
          this.ngZone.run(() => {
            this.result = state['result'];
            this.loading = false;
            
            if (this.result?.isPerfectScore || this.result?.isTopThree) {
              this.showConfetti = true;
              this.triggerConfetti();
            }
            
            this.cdr.detectChanges();
          });
        }, 0);
      } else {
        // Fallback: Try to load from API (will need backend endpoint)
        console.log('⚠️ No result in state, would need to load from API');
        setTimeout(() => {
          this.ngZone.run(() => {
            this.loading = false;
            this.message.warning('Không tìm thấy kết quả');
            this.cdr.detectChanges();
          });
        }, 0);
      }
    });
  }

  loadResult(): void {
    // For future use when backend has GET /result endpoint
    console.log('📊 Loading result for session:', this.sessionId);
    
    this.arenaService.getArenaResult(this.sessionId).subscribe({
      next: (result) => {
        this.ngZone.run(() => {
          this.result = result;
          this.loading = false;
          
          if (result.isPerfectScore || result.isTopThree) {
            this.showConfetti = true;
            this.triggerConfetti();
          }
          
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.message.error('Không thể tải kết quả');
          this.cdr.detectChanges();
        });
      }
    });
  }

  triggerConfetti(): void {
    // Simple confetti animation trigger
    setTimeout(() => {
      this.showConfetti = false;
    }, 5000);
  }

  playAgain(): void {
    if (!this.result) return;
    console.log('🔄 Play again - navigating to arena lobby:', this.result.deckId);
    this.router.navigate(['/app/arena/lobby', this.result.deckId]);
  }

  viewLeaderboard(): void {
    if (!this.result) return;
    console.log('🏆 View leaderboard - navigating to:', this.result.deckId);
    this.router.navigate(['/app/arena/leaderboard', this.result.deckId]);
  }

  goToDeck(): void {
    if (!this.result) return;
    console.log('🏠 Go to deck - navigating to:', this.result.deckId);
    this.router.navigate(['/app/deck', this.result.deckId]);
  }

  getRankChangeIcon(): string {
    if (!this.result) return 'minus';
    if (this.result.rankChange > 0) return 'rise';
    if (this.result.rankChange < 0) return 'fall';
    return 'minus';
  }

  getRankChangeColor(): string {
    if (!this.result) return '#8c8c8c';
    if (this.result.rankChange > 0) return '#52c41a';
    if (this.result.rankChange < 0) return '#ff4d4f';
    return '#8c8c8c';
  }

  getAccuracyColor(): string {
    if (!this.result) return '#1890ff';
    const accuracy = this.result.accuracyPercentage;
    if (accuracy === 100) return '#52c41a';
    if (accuracy >= 80) return '#1890ff';
    if (accuracy >= 60) return '#faad14';
    return '#ff4d4f';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getResultTitle(): string {
    if (!this.result) return 'Kết quả';
    
    if (this.result.isPerfectScore) {
      return '🎉 Hoàn hảo!';
    }
    if (this.result.isTopThree) {
      return '🏆 Top 3!';
    }
    if (this.result.accuracyPercentage >= 80) {
      return '👍 Tuyệt vời!';
    }
    if (this.result.accuracyPercentage >= 60) {
      return '😊 Tốt lắm!';
    }
    return '💪 Cố gắng hơn!';
  }

  getResultSubtitle(): string {
    if (!this.result) return '';
    
    if (this.result.isPerfectScore) {
      return 'Bạn đã trả lời đúng tất cả câu hỏi!';
    }
    if (this.result.isNewPersonalBest) {
      return 'Bạn đã phá kỷ lục cá nhân!';
    }
    if (this.result.isTopThree) {
      return 'Bạn đã lọt vào Top 3 Cao Thủ!';
    }
    return `Bạn đã trả lời đúng ${this.result.correctAnswers}/${this.result.totalQuestions} câu`;
  }
}
