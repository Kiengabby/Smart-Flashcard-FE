import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

import { DeckService } from '../../services/deck.service';
import { CardService } from '../../services/card.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CardDTO } from '../../interfaces/card.dto';
import { CardModalComponent } from '../../components/card-modal/card-modal.component';

@Component({
  selector: 'app-deck-detail',
  standalone: true,
  imports: [
    CommonModule,
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
    NzPopconfirmModule
  ],
  providers: [NzModalService, NzMessageService],
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss']
})
export class DeckDetailComponent implements OnInit {
  deckId!: number;
  deck?: DeckDTO;
  cards: CardDTO[] = [];
  isLoadingDeck = true;
  isLoadingCards = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deckService: DeckService,
    private cardService: CardService,
    private modalService: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Lấy deckId từ route params
    this.route.params.subscribe(params => {
      this.deckId = +params['id'];
      if (this.deckId) {
        this.loadDeckInfo();
        this.loadCards();
      }
    });
  }

  /**
   * Load thông tin deck
   */
  loadDeckInfo(): void {
    this.isLoadingDeck = true;
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (data) => {
        this.deck = data;
        this.isLoadingDeck = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin deck:', error);
        this.message.error('Không thể tải thông tin bộ thẻ!');
        this.isLoadingDeck = false;
      }
    });
  }

  /**
   * Load danh sách cards
   */
  loadCards(): void {
    this.isLoadingCards = true;
    this.cardService.getCardsByDeck(this.deckId).subscribe({
      next: (data) => {
        this.cards = data;
        this.isLoadingCards = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thẻ:', error);
        this.message.error('Không thể tải danh sách thẻ!');
        this.isLoadingCards = false;
      }
    });
  }

  /**
   * Mở modal thêm thẻ mới
   */
  openAddCardModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Thêm thẻ mới',
      nzContent: CardModalComponent,
      nzData: {
        deckId: this.deckId
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: 600
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
      nzTitle: 'Chỉnh sửa thẻ',
      nzContent: CardModalComponent,
      nzData: {
        deckId: this.deckId,
        card: card
      },
      nzFooter: null,
      nzCentered: true,
      nzWidth: 600
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.loadCards();
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
   * Bắt đầu học (chinh phục bộ thẻ)
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

    // Navigate to study mode selection
    this.router.navigate(['/app/study-mode', this.deckId]);
  }

  /**
   * Quay lại dashboard
   */
  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }
}


