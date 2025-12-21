import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ArenaService } from '../../services/arena.service';
import { ArenaPlayer } from '../../interfaces/arena.model';

@Component({
  selector: 'app-arena-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTabsModule,
    NzAvatarModule,
    NzBadgeModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule
  ],
  templateUrl: './arena-leaderboard.component.html',
  styleUrls: ['./arena-leaderboard.component.scss']
})
export class ArenaLeaderboardComponent implements OnInit {
  deckId!: number;
  players: ArenaPlayer[] = [];
  filteredPlayers: ArenaPlayer[] = [];
  loading = false;
  
  searchText = '';
  selectedTab = 'all';
  
  currentUserId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arenaService: ArenaService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.deckId = +params['deckId']; // ✅ Fixed: Use 'deckId' to match route parameter
      console.log('📊 Leaderboard - Received deckId:', this.deckId);
      this.loadLeaderboard();
    });
  }

  loadLeaderboard(timeFilter: 'all' | 'today' | 'week' = 'all'): void {
    this.loading = true;
    this.arenaService.getLeaderboard(this.deckId, timeFilter).subscribe({
      next: (players) => {
        this.players = players;
        this.filteredPlayers = players;
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Không thể tải bảng xếp hạng');
        this.loading = false;
      }
    });
  }

  onTabChange(index: number): void {
    const filters: ('all' | 'today' | 'week')[] = ['all', 'today', 'week'];
    this.selectedTab = filters[index];
    this.loadLeaderboard(filters[index]);
  }

  searchPlayers(): void {
    if (!this.searchText.trim()) {
      this.filteredPlayers = this.players;
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredPlayers = this.players.filter(player =>
      player.displayName.toLowerCase().includes(search) ||
      player.email.toLowerCase().includes(search)
    );
  }

  goBack(): void {
    this.router.navigate(['/app/arena/lobby', this.deckId]);
  }

  getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#1890ff';
  }

  getRankIcon(rank: number): string {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal';
    return 'user';
  }

  isCurrentUser(player: ArenaPlayer): boolean {
    return player.userId === this.currentUserId;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
