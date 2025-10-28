import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ReviewQuality, SM2Service } from '../../services/sm2.service';

/**
 * Quality Rating Component
 * 
 * Component cho phép user đánh giá chất lượng ôn tập từ 0-5
 * theo chuẩn SM-2 algorithm
 */
@Component({
  selector: 'app-quality-rating',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule
  ],
  templateUrl: './quality-rating.component.html',
  styleUrls: ['./quality-rating.component.scss']
})
export class QualityRatingComponent {
  @Input() disabled = false;
  @Input() showDescription = true;
  @Output() qualitySelected = new EventEmitter<number>();

  // Rating options with detailed descriptions
  ratingOptions = [
    {
      quality: ReviewQuality.BLACKOUT,
      label: 'Quên hoàn toàn',
      description: 'Không nhớ gì cả, cần học lại từ đầu',
      icon: 'close-circle',
      color: '#ff4d4f',
      bgColor: '#fff2f0'
    },
    {
      quality: ReviewQuality.INCORRECT,
      label: 'Sai hoàn toàn',
      description: 'Trả lời sai, không biết đáp án đúng',
      icon: 'exclamation-circle',
      color: '#ff7a45',
      bgColor: '#fff7e6'
    },
    {
      quality: ReviewQuality.INCORRECT_EASY,
      label: 'Sai nhưng nhớ được',
      description: 'Trả lời sai nhưng khi xem đáp án thì nhớ lại',
      icon: 'warning',
      color: '#faad14',
      bgColor: '#fffbe6'
    },
    {
      quality: ReviewQuality.CORRECT_HARD,
      label: 'Đúng nhưng khó',
      description: 'Trả lời đúng nhưng phải suy nghĩ rất lâu',
      icon: 'check-circle',
      color: '#fadb14',
      bgColor: '#feffe6'
    },
    {
      quality: ReviewQuality.CORRECT,
      label: 'Đúng',
      description: 'Trả lời đúng một cách tự tin',
      icon: 'check-circle',
      color: '#52c41a',
      bgColor: '#f6ffed'
    },
    {
      quality: ReviewQuality.PERFECT,
      label: 'Hoàn hảo',
      description: 'Rất dễ, trả lời ngay lập tức không cần suy nghĩ',
      icon: 'heart',
      color: '#13c2c2',
      bgColor: '#e6fffb'
    }
  ];

  constructor(private sm2Service: SM2Service) {}

  /**
   * Xử lý khi user chọn rating
   */
  onRatingSelect(quality: number): void {
    if (this.disabled) return;
    
    this.qualitySelected.emit(quality);
  }

  /**
   * Lấy mô tả cho rating quality
   */
  getQualityDescription(quality: number): string {
    return this.sm2Service.getQualityDescription(quality as ReviewQuality);
  }
}