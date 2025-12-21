import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { ArenaService } from '../../services/arena.service';
import { ArenaInfo, ArenaPlayer } from '../../interfaces/arena.model';

@Component({
  selector: 'app-arena-lobby',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzStatisticModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTypographyModule,
    NzDividerModule,
    NzEmptyModule
  ],
  templateUrl: './arena-lobby.component.html',
  styleUrls: ['./arena-lobby.component.scss']
})
export class ArenaLobbyComponent implements OnInit {
  deckId!: number;
  arenaInfo?: ArenaInfo;
  loading = false;
  startingGame = false;
  
  // Make Math available in template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arenaService: ArenaService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.deckId = +params['deckId']; // ✅ Fixed: Use 'deckId' to match route parameter
      console.log('📋 Arena Lobby - Received deckId:', this.deckId);
      this.loadArenaInfo();
    });
  }

  loadArenaInfo(): void {
    console.log('🔄 Loading arena info for deck:', this.deckId);
    
    // ✅ Wrap state change in NgZone to avoid NG0100
    this.ngZone.run(() => {
      this.loading = true;
      this.cdr.detectChanges();
    });
    
    this.arenaService.getArenaInfo(this.deckId).subscribe({
      next: (info) => {
        console.log('✅ Arena info received:', info);
        
        // ✅ Wrap state change in NgZone
        this.ngZone.run(() => {
          this.arenaInfo = info;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('❌ Arena info error:', error);
        
        // ✅ Wrap state change in NgZone
        this.ngZone.run(() => {
          this.message.error('❌ Không thể tải thông tin sân chơi');
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  startGame(): void {
    // ✅ Wrap state change in NgZone
    this.ngZone.run(() => {
      this.startingGame = true;
      this.cdr.detectChanges();
    });
    
    this.arenaService.startArenaSession(this.deckId).subscribe({
      next: (session) => {
        console.log('🚀 Starting game with session:', session);
        
        // ✅ Wrap state change and navigation in NgZone
        this.ngZone.run(() => {
          this.startingGame = false;
          this.cdr.detectChanges();
        });
        
        // Navigate after state update
        setTimeout(() => {
          this.router.navigate(['/app/arena/game', session.sessionId], {
            state: { session }
          });
        }, 0);
      },
      error: (error) => {
        // ✅ Wrap state change in NgZone
        this.ngZone.run(() => {
          this.startingGame = false;
          this.message.error('❌ Không thể bắt đầu thử thách');
          this.cdr.detectChanges();
        });
      }
    });
  }

  viewLeaderboard(): void {
    this.router.navigate(['/app/arena/leaderboard', this.deckId]);
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId]);
  }

  getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#1890ff';
  }

  getRankIcon(rank: number): string {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal';
    return 'user';
  }
}
