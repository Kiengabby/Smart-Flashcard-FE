import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { DeckService } from '../../services/deck.service';
import { CardService } from '../../services/card.service';
import { DeckMemberService } from '../../services/deck-member.service';
import { InvitationService } from '../../services/invitation.service';

import { AuthService } from '../../services/auth.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CardDTO } from '../../interfaces/card.dto';
import { DeckMember, MemberRole } from '../../interfaces/deck-member.model';
import { SendInvitationRequest } from '../../interfaces/invitation.model';
import { CardModalComponent } from '../../components/card-modal/card-modal.component';
import { BulkCreateCardsModalComponent } from '../../components/bulk-create-cards-modal/bulk-create-cards-modal.component';
import { CardIconComponent } from '../deck-library/card-icon/card-icon.component';


@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule,
    NzListModule,
    NzDividerModule,
    NzTypographyModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzTabsModule,
    NzAvatarModule,
    NzTagModule,
    NzInputModule,
    NzFormModule,
    NzBadgeModule,
    CardIconComponent
  ],
  providers: [NzModalService, NzMessageService],
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss']
})
export class DeckDetailComponent implements OnInit {
  deckId!: number;
  deck?: DeckDTO = undefined;
  cards: CardDTO[] = [];
  private _isLoadingDeck = false;
  private _isLoadingCards = false;

  // Members Tab
  selectedTab = 0; // 0 = Cards, 1 = Members
  members: DeckMember[] = [];
  isLoadingMembers = false;
  memberCount = 0;
  currentUserId?: number;
  currentUserRole?: MemberRole; // Track current user's role
  isCurrentUserOwner = false; // Flag to check if user is owner
  
  // Invite Modal
  isInviteModalVisible = false;
  inviteForm!: FormGroup;
  isInviting = false;

  // Getter/setter for isLoadingDeck to prevent expression changed error
  get isLoadingDeck(): boolean {
    return this._isLoadingDeck;
  }

  set isLoadingDeck(value: boolean) {
    if (this._isLoadingDeck !== value) {
      this._isLoadingDeck = value;
    }
  }

  // Getter/setter for isLoadingCards to prevent expression changed error
  get isLoadingCards(): boolean {
    return this._isLoadingCards;
  }

  set isLoadingCards(value: boolean) {
    if (this._isLoadingCards !== value) {
      this._isLoadingCards = value;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cardService: CardService,
    private deckMemberService: DeckMemberService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = +currentUser.id; // Convert to number
    }
  }

  ngOnInit(): void {
    console.log('DeckDetailComponent ngOnInit called');
    // Initialize properties
    this.deck = undefined;
    this.cards = [];
    
    // Use setTimeout to avoid initial expression changed error
    setTimeout(() => {
      // Lấy deckId từ route params
      this.route.params.subscribe(params => {
        console.log('Route params received:', params);
        this.deckId = +params['id'];
        console.log('Parsed deckId:', this.deckId);
        if (this.deckId) {
          this.loadDeckInfo();
          this.loadCards();
        } else {
          console.error('Invalid deckId:', params['id']);
        }
      });
    }, 0);
  }

  /**
   * Load thông tin deck
   */
  loadDeckInfo(): void {
    console.log('loadDeckInfo called for deckId:', this.deckId);
    this._isLoadingDeck = true;
    this.cdr.detectChanges();
    
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (data) => {
        console.log('Deck info loaded:', data);
        this.deck = data;
        this._isLoadingDeck = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin deck:', error);
        this.message.error('Không thể tải thông tin bộ thẻ!');
        this._isLoadingDeck = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Load danh sách cards
   */
  loadCards(): void {
    console.log('loadCards called for deckId:', this.deckId);
    this._isLoadingCards = true;
    this.cdr.detectChanges();
    
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        console.log('Cards loaded:', data);
        this.cards = data;
        this._isLoadingCards = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thẻ:', error);
        this.message.error('Không thể tải danh sách thẻ!');
        this._isLoadingCards = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Mở modal thêm thẻ mới
   */
  openAddCardModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: CardModalComponent,
      nzData: {
        deckId: this.deckId
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: '50%',
      nzMask: true,
      nzMaskClosable: true,
      nzClosable: false,
      nzBodyStyle: { padding: '0', background: 'transparent' },
      nzStyle: { background: 'transparent' }
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadCards();
        this.loadDeckInfo(); // Reload để cập nhật cardCount
      }
    });
  }

  /**
   * Mở modal sửa thẻ
   */
  openEditCardModal(card: CardDTO): void {
    const modalRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: CardModalComponent,
      nzData: {
        deckId: this.deckId,
        card: card
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: '50%',
      nzMask: true,
      nzMaskClosable: true,
      nzClosable: false,
      nzBodyStyle: { padding: '0', background: 'transparent' },
      nzStyle: { background: 'transparent' }
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadCards();
      }
    });
  }

  /**
   * Mở modal tạo thẻ nhanh với AI
   */
  openBulkCreateModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: '',
      nzContent: BulkCreateCardsModalComponent,
      nzData: {
        deck: this.deck
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: 800,
      nzClassName: 'bulk-create-modal-wrapper'
    });

    modalRef.afterClose.subscribe((result) => {
      if (result && result.successCount > 0) {
        this.loadCards();
        this.loadDeckInfo(); // Reload để cập nhật cardCount
      }
    });
  }

  /**
   * Xóa thẻ
   */
  deleteCard(card: CardDTO): void {
    this.cardService.deleteCard(this.deckId, card.id).subscribe({
      next: () => {
        this.message.success('Đã xóa thẻ thành công!');
        this.loadCards();
        this.loadDeckInfo(); // Reload để cập nhật cardCount
      },
      error: (error) => {
        console.error('Lỗi khi xóa thẻ:', error);
        this.message.error('Không thể xóa thẻ. Vui lòng thử lại!');
      }
    });
  }

  /**
   * Bắt đầu học (chinh phục bộ thẻ) - Navigate to Learning Path
   */
  startLearning(): void {
    if (!this.cards.length) {
      this.message.warning('Bộ thẻ chưa có thẻ nào. Hãy thêm ít nhất 5 thẻ để bắt đầu!');
      return;
    }

    if (this.cards.length < 5) {
      this.message.warning(`Bạn cần thêm ${5 - this.cards.length} thẻ nữa để có thể bắt đầu chinh phục!`);
      return;
    }

    // Navigate to progressive learning path
    this.router.navigate(['/app/deck', this.deckId, 'learning-path']);
  }

  /**
   * Quay lại thư viện bộ thẻ
   */
  goBack(): void {
    // Kiểm tra xem người dùng đến từ đâu
    const navigationState = window.history.state;
    const referrer = document.referrer;
    
    // Nếu có state navigation hoặc referrer chứa deck-library, quay về deck-library
    if (referrer.includes('/deck-library') || navigationState?.fromDeckLibrary) {
      this.router.navigate(['/app/deck-library']);
    } else {
      // Mặc định quay về deck-library thay vì dashboard  
      this.router.navigate(['/app/deck-library']);
    }
  }

  // ========================================
  // MEMBERS TAB METHODS
  // ========================================

  /**
   * Load members list
   */
  loadMembers(): void {
    console.log('🔍 Loading members for deck:', this.deckId, 'Current user ID:', this.currentUserId);
    this.isLoadingMembers = true;
    this.cdr.detectChanges();
    
    this.deckMemberService.getDeckMembers(this.deckId).subscribe({
      next: (data) => {
        console.log('📋 Members data received:', data);
        this.members = data;
        this.memberCount = data.length;
        
        // Find current user and check if owner
        const currentUser = data.find(m => m.userId === this.currentUserId);
        console.log('👤 Current user in members list:', currentUser);
        if (currentUser) {
          this.currentUserRole = currentUser.role;
          this.isCurrentUserOwner = currentUser.role === MemberRole.OWNER;
          console.log('🏆 Is current user owner?', this.isCurrentUserOwner, 'Role:', this.currentUserRole);
        } else {
          console.warn('⚠️ Current user not found in members list!');
        }
        
        this.isLoadingMembers = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.message.error('Không thể tải danh sách thành viên!');
        this.isLoadingMembers = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Tab change handler
   */
  onTabChange(index: number): void {
    this.selectedTab = index;
    if (index === 1) { // Members tab
      this.loadMembers();
    }
  }

  /**
   * Open invite modal
   */
  openInviteModal(): void {
    this.isInviteModalVisible = true;
    this.inviteForm.reset();
  }

  /**
   * Handle invite modal cancel
   */
  handleInviteCancel(): void {
    this.isInviteModalVisible = false;
    this.inviteForm.reset();
  }

  /**
   * Send invitation
   */
  sendInvitation(): void {
    if (this.inviteForm.invalid) {
      Object.values(this.inviteForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isInviting = true;
    this.cdr.detectChanges();
    
    const request: SendInvitationRequest = {
      deckId: this.deckId,
      receiverEmail: this.inviteForm.value.email
    };

    this.invitationService.sendInvitation(request).subscribe({
      next: () => {
        this.message.success('Đã gửi lời mời thành công!');
        this.isInviteModalVisible = false;
        this.inviteForm.reset();
        this.isInviting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error sending invitation:', error);
        if (error.status === 403) {
          this.message.error('Bạn không có quyền gửi lời mời! Chỉ chủ sở hữu bộ thẻ mới có thể mời người khác.');
        } else if (error.status === 404) {
          this.message.error('Email không tồn tại trong hệ thống!');
        } else if (error.status === 409) {
          this.message.error('Người dùng đã là thành viên của bộ thẻ!');
        } else {
          this.message.error('Không thể gửi lời mời. Vui lòng thử lại!');
        }
        this.isInviting = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Remove member from deck
   */
  removeMember(member: DeckMember): void {
    // Kiểm tra quyền: chỉ owner mới có thể xóa thành viên
    if (!this.isCurrentUserOwner) {
      this.message.error('Chỉ chủ sở hữu bộ thẻ mới có thể xóa thành viên!');
      return;
    }

    // Không thể xóa owner
    if (this.isOwner(member)) {
      this.message.error('Không thể xóa chủ sở hữu bộ thẻ!');
      return;
    }

    this.deckMemberService.removeMember(this.deckId, member.userId).subscribe({
      next: () => {
        this.message.success(`Đã xóa ${member.userName} khỏi bộ thẻ!`);
        this.loadMembers();
      },
      error: (error) => {
        console.error('Error removing member:', error);
        if (error.status === 403) {
          this.message.error('Bạn không có quyền xóa thành viên!');
        } else {
          this.message.error('Không thể xóa thành viên. Vui lòng thử lại!');
        }
      }
    });
  }

  /**
   * Check if user is owner
   */
  isOwner(member: DeckMember): boolean {
    return member.role === MemberRole.OWNER;
  }

  /**
   * Check if member is current user
   */
  isCurrentUser(member: DeckMember): boolean {
    return member.userId === this.currentUserId;
  }

  /**
   * Check if current user can remove this member
   */
  canRemoveMember(member: DeckMember): boolean {
    // Chỉ owner mới có thể xóa member (không thể xóa chính mình)
    return this.isCurrentUserOwner && !this.isOwner(member);
  }

  /**
   * Get avatar color based on user ID
   */
  getAvatarColor(userId: number): string {
    const colors = [
      '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
      '#1890ff', '#52c41a', '#fa8c16', '#eb2f96'
    ];
    return colors[userId % colors.length];
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(userName: string): string {
    const parts = userName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  }

  /**
   * Navigate to Arena Mode
   */
  goToArena(): void {
    console.log('🎯 goToArena called, deckId:', this.deckId);
    
    if (!this.deckId || isNaN(this.deckId)) {
      console.error('❌ Invalid deckId:', this.deckId);
      this.message.error('Không tìm thấy ID bộ thẻ');
      return;
    }
    
    console.log('✅ Navigating to arena lobby with deckId:', this.deckId);
    this.router.navigate(['/app/arena/lobby', this.deckId]);
  }
}


