import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { DeckService, Deck } from '../../services/deck.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  decks$!: Observable<Deck[]>;

  constructor(private deckService: DeckService) {}

  ngOnInit(): void {
    try {
      this.decks$ = this.deckService.getDecksForCurrentUser();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bộ thẻ:', error);
      // Hiển thị dữ liệu mẫu nếu người dùng chưa đăng nhập
      this.decks$ = of([
        { 
          id: '1', 
          name: 'Bộ thẻ mẫu 1', 
          description: 'Mô tả ngắn gọn cho bộ thẻ 1', 
          cardCount: 10,
          ownerId: 'sample',
          createdAt: new Date()
        },
        { 
          id: '2', 
          name: 'Bộ thẻ mẫu 2', 
          description: 'Mô tả ngắn gọn cho bộ thẻ 2', 
          cardCount: 15,
          ownerId: 'sample',
          createdAt: new Date()
        }
      ]);
    }
  }

  openCreateDeckDialog(): void {
    console.log('Mở dialog tạo deck');
    // TODO: Implement dialog tạo deck mới
  }
}
