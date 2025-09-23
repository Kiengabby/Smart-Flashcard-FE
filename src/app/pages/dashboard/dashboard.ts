import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DeckService } from '../../services/deck.service';
import { DeckDTO } from '../../interfaces/deck.dto';
import { CreateDeckModalComponent } from '../../components/create-deck-modal/create-deck-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  decks: DeckDTO[] = [];
  isLoading = false;

  constructor(
    private deckService: DeckService,
    private modalService: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  /**
   * Tải danh sách deck từ API
   */
  loadDecks(): void {
    this.isLoading = true;
    this.deckService.getDecks().subscribe({
      next: (decks) => {
        this.decks = decks;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.message.error('Không thể tải danh sách bộ thẻ. Vui lòng thử lại!');
        console.error('Error loading decks:', error);
      }
    });
  }

  /**
   * Mở modal tạo deck mới
   */
  openCreateDeckModal(): void {
    const modalRef = this.modalService.create({
      nzTitle: 'Tạo bộ thẻ mới',
      nzContent: CreateDeckModalComponent,
      nzFooter: null,
      nzWidth: 500,
      nzClosable: true,
      nzMaskClosable: false
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.createDeck(result);
      }
    });
  }

  /**
   * Tạo deck mới
   */
  private createDeck(data: { name: string; description: string }): void {
    this.deckService.createDeck(data).subscribe({
      next: (newDeck) => {
        this.message.success('Tạo bộ thẻ thành công!');
        this.loadDecks(); // Reload danh sách deck
      },
      error: (error) => {
        this.message.error('Không thể tạo bộ thẻ. Vui lòng thử lại!');
        console.error('Error creating deck:', error);
      }
    });
  }
}


