import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { CommunityTipService } from '../../services/community-tip.service';
import { CommunityTipDTO, CreateTipRequest, TipReactionRequest } from '../../interfaces/community-tip.dto';
import { CardDTO } from '../../interfaces/card.dto';

@Component({
  selector: 'app-community-tips-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzFormModule,
    NzCardModule,
    NzAvatarModule,
    NzDividerModule,
    NzEmptyModule,
    NzSpinModule,
    NzTooltipModule,
    NzTypographyModule,
    NzPopconfirmModule
  ],
  templateUrl: './community-tips-modal.component.html',
  styleUrls: ['./community-tips-modal.component.scss']
})
export class CommunityTipsModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() card!: CardDTO;
  @Output() visibleChange = new EventEmitter<boolean>();

  tips: CommunityTipDTO[] = [];
  isLoading = true; // Start with loading true
  isSubmitting = false;
  newTipContent = '';
  showAddTipForm = false;

  constructor(
    private communityTipService: CommunityTipService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialization logic if needed
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible && this.card) {
      console.log('Modal opened, loading tips for card:', this.card);
      // Use setTimeout to avoid change detection issues
      setTimeout(() => this.loadTips(), 0);
    }
  }

  onVisibleChange(visible: boolean) {
    console.log('Modal visibility changed:', visible);
    this.visibleChange.emit(visible);
    
    if (!visible) {
      console.log('Resetting form');
      this.resetForm();
    }
  }

  loadTips() {
    console.log('loadTips called with card:', this.card);
    if (!this.card?.id) {
      console.log('No card or card ID available');
      return;
    }
    
    console.log('Loading tips for card ID:', this.card.id);
    
    // Use async pipe approach - set observable directly
    this.communityTipService.getTipsByCard(this.card.id).subscribe({
      next: (tips) => {
        console.log('Component: Received tips:', tips);
        console.log('Component: Number of tips:', tips.length);
        
        // Use setTimeout to ensure we're outside the current change detection cycle
        setTimeout(() => {
          this.tips = tips;
          this.isLoading = false;
          console.log('Component: State updated asynchronously');
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading tips:', error);
        this.message.error('Không thể tải mẹo học từ cộng đồng');
        setTimeout(() => {
          this.isLoading = false;
        }, 0);
      }
    });
  }

  toggleAddTipForm() {
    this.showAddTipForm = !this.showAddTipForm;
    if (!this.showAddTipForm) {
      this.newTipContent = '';
    }
  }

  submitTip() {
    if (!this.newTipContent.trim() || !this.card?.id) {
      this.message.warning('Vui lòng nhập nội dung mẹo học');
      return;
    }

    this.isSubmitting = true;
    const request: CreateTipRequest = {
      cardId: this.card.id,
      content: this.newTipContent.trim()
    };

    this.communityTipService.createTip(request).subscribe({
      next: (newTip) => {
        this.tips.unshift(newTip);
        this.resetForm();
        this.message.success('Chia sẻ mẹo học thành công! 🎉');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error creating tip:', error);
        this.message.error('Không thể chia sẻ mẹo học. Vui lòng thử lại!');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  reactToTip(tip: CommunityTipDTO, reactionType: 'LIKE' | 'DISLIKE') {
    // Nếu user đã react với loại tương tự thì remove reaction
    const currentReaction = tip.isLikedByCurrentUser ? 'LIKE' : 
                          (tip.isDislikedByCurrentUser ? 'DISLIKE' : null);
    
    const finalReaction = currentReaction === reactionType ? 'REMOVE' : reactionType;

    this.communityTipService.reactToTip({
      tipId: tip.id,
      reactionType: finalReaction
    }).subscribe({
      next: (response) => {
        tip.likesCount = response.likesCount;
        tip.dislikesCount = response.dislikesCount;
        tip.isLikedByCurrentUser = response.userReaction === 'LIKE';
        tip.isDislikedByCurrentUser = response.userReaction === 'DISLIKE';
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error reacting to tip:', error);
        this.message.error('Không thể thực hiện hành động này');
      }
    });
  }

  deleteTip(tip: CommunityTipDTO) {
    this.communityTipService.deleteTip(tip.id).subscribe({
      next: () => {
        this.tips = this.tips.filter(t => t.id !== tip.id);
        this.message.success('Đã xóa mẹo học');
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error deleting tip:', error);
        this.message.error('Không thể xóa mẹo học');
      }
    });
  }

  private resetForm() {
    this.newTipContent = '';
    this.showAddTipForm = false;
    this.isSubmitting = false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  }

  trackByTipId(index: number, tip: CommunityTipDTO): number {
    return tip.id;
  }

  getCurrentUserId(): number {
    // TODO: Implement logic to get current user ID from auth service
    // For now, return a mock value
    return 1; // Replace with actual logic
  }

  close() {
    this.visibleChange.emit(false);
  }

  // Tip management methods
  submittingTip = false;
  editingTipId: number | null = null;
  editTipContent = '';
  updatingTip = false;
  processingReaction: number | null = null;

  cancelAddTip() {
    this.showAddTipForm = false;
    this.newTipContent = '';
  }

  editTip(tip: CommunityTipDTO) {
    this.editingTipId = tip.id;
    this.editTipContent = tip.content;
  }

  saveEdit(tipId: number) {
    if (!this.editTipContent.trim()) return;

    this.updatingTip = true;
    this.communityTipService.updateTip(tipId, this.editTipContent.trim()).subscribe({
      next: (updatedTip) => {
        const index = this.tips.findIndex(t => t.id === tipId);
        if (index !== -1) {
          this.tips[index] = updatedTip;
        }
        this.cancelEdit();
        this.updatingTip = false;
        this.message.success('Cập nhật mẹo học thành công!');
      },
      error: (error: any) => {
        console.error('Error updating tip:', error);
        this.message.error('Không thể cập nhật mẹo học');
        this.updatingTip = false;
      }
    });
  }

  cancelEdit() {
    this.editingTipId = null;
    this.editTipContent = '';
  }

  toggleReaction(tip: CommunityTipDTO, reactionType: 'LIKE' | 'DISLIKE') {
    this.processingReaction = tip.id;
    
    const request: TipReactionRequest = {
      tipId: tip.id,
      reactionType: reactionType
    };
    
    this.communityTipService.reactToTip(request).subscribe({
      next: (response: any) => {
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          // Update tip with new reaction counts
          const index = this.tips.findIndex(t => t.id === tip.id);
          if (index !== -1) {
            this.tips[index] = {
              ...this.tips[index],
              likesCount: response.likesCount,
              dislikesCount: response.dislikesCount,
              isLikedByCurrentUser: response.userReaction === 'LIKE',
              isDislikedByCurrentUser: response.userReaction === 'DISLIKE'
            };
          }
          this.processingReaction = null;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error toggling reaction:', error);
        this.message.error('Không thể thực hiện hành động này');
        setTimeout(() => {
          this.processingReaction = null;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  getAvatarText(displayName: string): string {
    return displayName?.charAt(0).toUpperCase() || 'U';
  }

  canEditTip(tip: CommunityTipDTO): boolean {
    // For now, allow editing for all tips
    // In real app, check if current user is the author
    return true;
  }
}
