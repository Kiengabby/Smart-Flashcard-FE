import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// NG-ZORRO Modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzButtonModule } from 'ng-zorro-antd/button';

// Interfaces
import { DeckDTO } from '../../interfaces/deck.dto';

@Component({
  selector: 'app-deck-card',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzIconModule,
    NzProgressModule,
    NzButtonModule
  ],
  templateUrl: './deck-card.component.html',
  styleUrls: ['./deck-card.component.css']
})
export class DeckCardComponent {
  @Input() deck!: DeckDTO;
  @Input() progress: number = 0; // Tiến độ học tập (0-100)
  
  @Output() onStartStudy = new EventEmitter<DeckDTO>();
  @Output() onSettings = new EventEmitter<DeckDTO>();

  // Expose Math to template
  Math = Math;

  /**
   * Xử lý sự kiện bắt đầu học
   */
  startStudy(): void {
    this.onStartStudy.emit(this.deck);
  }

  /**
   * Xử lý sự kiện mở cài đặt
   */
  openSettings(): void {
    this.onSettings.emit(this.deck);
  }

  /**
   * Lấy màu cho progress bar dựa trên tiến độ
   */
  getProgressColor(): string {
    if (this.progress >= 80) return '#52c41a'; // Xanh lá
    if (this.progress >= 50) return '#1890ff'; // Xanh dương  
    if (this.progress >= 20) return '#faad14'; // Vàng
    return '#f5222d'; // Đỏ
  }

  /**
   * Lấy trạng thái học tập
   */
  getStudyStatus(): string {
    if (this.progress >= 80) return 'Hoàn thành tốt';
    if (this.progress >= 50) return 'Đang tiến bộ';
    if (this.progress >= 20) return 'Mới bắt đầu';
    return 'Chưa học';
  }
}