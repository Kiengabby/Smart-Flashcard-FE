import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// NG-ZORRO Modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzProgressModule } from 'ng-zorro-antd/progress';

// Components
import { DeckCardComponent } from '../../components/deck-card/deck-card.component';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';
import { EditDeckModalComponent } from '../../components/edit-deck-modal/edit-deck-modal.component';

// Services
import { DeckService } from '../../services/deck.service';
import { LearningProgressService } from '../../services/learning-progress.service';

// Interfaces
import { DeckDTO } from '../../interfaces/deck.dto';
import { LearningProgressDTO } from '../../interfaces/learning-progress.dto';

@Component({
  selector: 'app-deck-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzSelectModule,
    NzDropDownModule,
    NzModalModule,
    NzDividerModule,
    NzTagModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzStatisticModule,
    NzProgressModule
  ],
  providers: [NzModalService, NzMessageService],
  templateUrl: './deck-library.component.html',
  styleUrls: ['./deck-library.component.scss']
})
export class DeckLibraryComponent implements OnInit {
  // Data properties
  decks: DeckDTO[] = [];
  filteredDecks: DeckDTO[] = [];
  private _isLoading = false; // Start with false to avoid initial expression change error
  
  // Learning Progress mapping
  deckProgressMap: Map<number, LearningProgressDTO> = new Map();

  // Search & Filter properties
  searchText = '';
  selectedCategory = 'all';
  selectedSort = 'newest';

  // Stats properties
  totalDecks = 0;
  totalCards = 0;
  studyingDecks = 0;

  // Getter for isLoading to ensure stable expression evaluation
  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    if (this._isLoading !== value) {
      this._isLoading = value;
    }
  }

  // Expose Math to template
  Math = Math;

  // Filter options
  categoryOptions = [
    { label: 'Tất cả bộ thẻ', value: 'all' },
    { label: 'Đang học', value: 'studying' },
    { label: 'Đã hoàn thành', value: 'completed' },
    { label: 'Chưa bắt đầu', value: 'not-started' }
  ];

  sortOptions = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Cũ nhất', value: 'oldest' },
    { label: 'A → Z', value: 'name-asc' },
    { label: 'Z → A', value: 'name-desc' },
    { label: 'Nhiều thẻ nhất', value: 'card-count-desc' },
    { label: 'Ít thẻ nhất', value: 'card-count-asc' }
  ];

  constructor(
    private deckService: DeckService,
    private learningProgressService: LearningProgressService,
    private router: Router,
    private modalService: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize with empty data to avoid undefined errors
    this.totalDecks = 0;
    this.totalCards = 0;
    this.studyingDecks = 0;
    this.filteredDecks = [];
    
    // Use setTimeout to avoid initial expression changed error
    setTimeout(() => {
      this.loadDecks();
    }, 0);
  }

  /**
   * Load danh sách deck từ API
   */
  loadDecks(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // Force change detection
    
    this.deckService.getDecks().subscribe({
      next: (data: DeckDTO[]) => {
        this.decks = data;
        
        // Load learning progress for all decks
        this.loadLearningProgress();
        
        this.updateStats();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection after data update
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách bộ thẻ:', error);
        
        // Detailed error handling
        if (error.status === 0 || error.name === 'TimeoutError') {
          console.warn('API không khả dụng hoặc timeout, sử dụng mock data...');
          this.message.warning('Không thể kết nối server, hiển thị dữ liệu mẫu');
          this.decks = this.getMockDecks();
          this.updateStats();
          this.applyFilters();
        } else if (error.status === 404) {
          this.message.info('Chưa có bộ thẻ nào');
          this.decks = [];
          this.updateStats();
          this.applyFilters();
        } else {
          this.message.error(`Không thể tải danh sách bộ thẻ: ${error.message || 'Lỗi không xác định'}`);
          this.decks = [];
          this.updateStats();
          this.applyFilters();
        }
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection after error handling
      }
    });
  }

  /**
   * Load learning progress for all decks
   */
  private loadLearningProgress(): void {
    this.decks.forEach(deck => {
      this.learningProgressService.getDeckProgress(deck.id!).subscribe({
        next: (progress) => {
          this.deckProgressMap.set(deck.id!, progress);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(`Error loading progress for deck ${deck.id}:`, err);
        }
      });
    });
  }

  /**
   * Get learning progress for a deck
   */
  getDeckProgress(deckId: number): LearningProgressDTO | undefined {
    return this.deckProgressMap.get(deckId);
  }

  /**
   * Mock data for development when API is not available
   */
  private getMockDecks(): DeckDTO[] {
    return [
      {
        id: 1,
        name: 'Từ vựng tiếng Anh cơ bản',
        description: 'Tổng hợp 500 từ vựng tiếng Anh thông dụng nhất cho người mới bắt đầu',
        cardCount: 8,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Ngữ pháp tiếng Anh',
        description: 'Các cấu trúc ngữ pháp quan trọng',
        cardCount: 3,
        createdAt: '2024-01-20T14:30:00Z'
      }
    ];
  }

  /**
   * Cập nhật thống kê
   */
  updateStats(): void {
    const newTotalDecks = this.decks.length;
    const newTotalCards = this.decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0);
    const newStudyingDecks = this.decks.filter(deck => this.getDeckStatus(deck) === 'studying').length;
    
    // Only update if values have changed
    if (this.totalDecks !== newTotalDecks) {
      this.totalDecks = newTotalDecks;
    }
    if (this.totalCards !== newTotalCards) {
      this.totalCards = newTotalCards;
    }
    if (this.studyingDecks !== newStudyingDecks) {
      this.studyingDecks = newStudyingDecks;
    }
  }

  /**
   * Xác định trạng thái deck
   */
  getDeckStatus(deck: DeckDTO): string {
    if (!deck.cardCount || deck.cardCount === 0) return 'not-started';
    if (deck.cardCount < 5) return 'not-started';
    
    const progress = this.getDeckProgress(deck.id!);
    if (!progress) return 'not-started';
    
    // Deck đã hoàn thành tất cả 4 modes
    if (progress.isFullyCompleted) return 'completed';
    
    // Deck đang học (có ít nhất 1 mode đã completed)
    if (progress.flashcardCompleted || progress.quizCompleted || 
        progress.listeningCompleted || progress.writingCompleted) {
      return 'studying';
    }
    
    return 'not-started';
  }

  /**
   * Apply search & filter
   */
  applyFilters(): void {
    let filtered = [...this.decks];

    // Search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(deck => 
        deck.name.toLowerCase().includes(searchLower) ||
        (deck.description && deck.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(deck => this.getDeckStatus(deck) === this.selectedCategory);
    }

    // Sort
    switch (this.selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'card-count-desc':
        filtered.sort((a, b) => (b.cardCount || 0) - (a.cardCount || 0));
        break;
      case 'card-count-asc':
        filtered.sort((a, b) => (a.cardCount || 0) - (b.cardCount || 0));
        break;
    }

    this.filteredDecks = filtered;
  }

  /**
   * Xử lý search
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * Xử lý thay đổi category
   */
  onCategoryChange(): void {
    this.applyFilters();
  }

  /**
   * Xử lý thay đổi sort
   */
  onSortChange(): void {
    this.applyFilters();
  }

  /**
   * Tính progress cho deck dựa trên learning progress thực tế
   */
  calculateProgress(deck: DeckDTO): number {
    if (!deck.cardCount || deck.cardCount === 0) return 0;
    if (deck.cardCount < 5) return Math.round((deck.cardCount / 5) * 100);
    
    const progress = this.getDeckProgress(deck.id!);
    if (!progress) return 0;
    
    // Sử dụng overallProgress từ backend
    return progress.overallProgress || 0;
  }

  /**
   * Mở modal tạo deck mới
   */
  openCreateDeckModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Tạo bộ thẻ mới',
      nzContent: CreateDeckModalComponent,
      nzFooter: null,
      nzCentered: true,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      // If the modal returned a DeckDTO (newly created deck), add it to the list and navigate to its detail
      if (result && typeof result === 'object' && (result as any).id) {
        const newDeck = result as DeckDTO;
        // Prepend to decks so user sees it immediately
        this.decks.unshift(newDeck);
        this.updateStats();
        this.applyFilters();
        this.cdr.detectChanges();
        // Navigate to the new deck detail page
        this.router.navigate(['/app/deck', newDeck.id]);
        return;
      }

      // Backwards compatibility: some modals may return 'success'
      if (result === 'success') {
        this.loadDecks(); // Reload danh sách
      }
    });
  }

  /**
   * Mở modal chỉnh sửa deck
   */
  openEditDeckModal(deck: DeckDTO): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Chỉnh sửa thông tin bộ thẻ',
      nzContent: EditDeckModalComponent,
      nzData: {
        deck: deck
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        // Tìm và cập nhật deck trong danh sách
        const index = this.decks.findIndex(d => d.id === deck.id);
        if (index !== -1) {
          this.decks[index] = { ...this.decks[index], ...result };
          this.applyFilters(); // Refresh filtered list
          this.cdr.detectChanges();
        }
        this.message.success('Đã cập nhật thông tin bộ thẻ!');
      }
    });
  }

  /**
   * Bắt đầu học deck
   */
  startStudying(deck: DeckDTO, event?: Event): void {
    // Ngăn chặn event bubbling để không trigger viewDeckDetail
    if (event) {
      event.stopPropagation();
    }
    
    if (!deck.cardCount || deck.cardCount < 5) {
      this.message.warning('Bộ thẻ cần có ít nhất 5 thẻ để bắt đầu học!');
      this.viewDeckDetail(deck);
      return;
    }
    
    // Navigate to study mode
    this.router.navigate(['/app/study-mode', deck.id]);
  }

  /**
   * Xem chi tiết deck
   */
  /**
   * Xem chi tiết bộ thẻ
   */
  viewDeckDetail(deck: DeckDTO): void {
    console.log('viewDeckDetail called with deck:', deck);
    console.log('Navigating to:', `/app/deck/${deck.id}`);
    
    this.router.navigate(['/app/deck', deck.id], {
      state: { 
        fromDeckLibrary: true,
        previousUrl: '/app/deck-library' 
      }
    }).then(success => {
      console.log('Navigation success:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  /**
   * Xóa deck
   */
  deleteDeck(deck: DeckDTO): void {
    this.deckService.deleteDeck(deck.id.toString()).subscribe({
      next: () => {
        this.message.success(`Đã xóa bộ thẻ "${deck.name}" thành công!`);
        this.loadDecks(); // Reload danh sách
      },
      error: (error) => {
        console.error('Lỗi khi xóa deck:', error);
        this.message.error('Không thể xóa bộ thẻ!');
      }
    });
  }

  /**
   * Get tag color based on deck status
   */
  getTagColor(deck: DeckDTO): string {
    const status = this.getDeckStatus(deck);
    switch (status) {
      case 'completed': return 'green';
      case 'studying': return 'blue';
      case 'not-started': return 'default';
      default: return 'default';
    }
  }

  /**
   * Get tag text based on deck status
   */
  getTagText(deck: DeckDTO): string {
    const status = this.getDeckStatus(deck);
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'studying': return 'Đang học';
      case 'not-started': return 'Chưa bắt đầu';
      default: return 'Chưa rõ';
    }
  }

  /**
   * Get progress color based on percentage
   */
  getProgressColor(percent: number): string {
    if (percent >= 80) return '#52c41a';
    if (percent >= 50) return '#1890ff';
    if (percent >= 20) return '#faad14';
    return '#ff4d4f';
  }

  /**
   * Get study tooltip text
   */
  getStudyTooltip(deck: DeckDTO): string {
    if (!deck.cardCount || deck.cardCount < 5) {
      return 'Cần ít nhất 5 thẻ để bắt đầu học';
    }
    return 'Bắt đầu học bộ thẻ này';
  }

  /**
   * Get button text based on deck status
   */
  getStartButtonText(deck: DeckDTO): string {
    const status = this.getDeckStatus(deck);
    switch (status) {
      case 'completed': return '🏆 Đã chinh phục';
      case 'studying': return '📚 Tiếp tục học';
      case 'not-started': return '🚀 Bắt đầu Chinh phục';
      default: return 'Bắt đầu';
    }
  }

  /**
   * Get button type based on deck status
   */
  getStartButtonType(deck: DeckDTO): 'primary' | 'default' {
    const status = this.getDeckStatus(deck);
    return status === 'completed' ? 'default' : 'primary';
  }
}