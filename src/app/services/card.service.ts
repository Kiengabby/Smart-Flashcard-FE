import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardDTO, CreateCardRequest, UpdateCardRequest, ReviewCardRequest, ReviewCardResponse } from '../interfaces/card.dto';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly BASE_API = 'http://localhost:8080/api/decks';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách cards trong một deck
   */
  getCardsByDeck(deckId: number): Observable<CardDTO[]> {
    return this.http.get<CardDTO[]>(`${this.BASE_API}/${deckId}/cards`);
  }

  /**
   * Tạo card mới trong deck
   */
  createCard(deckId: number, data: CreateCardRequest): Observable<CardDTO> {
    return this.http.post<CardDTO>(`${this.BASE_API}/${deckId}/cards`, data);
  }

  /**
   * Cập nhật thông tin card
   */
  updateCard(deckId: number, cardId: number, data: UpdateCardRequest): Observable<CardDTO> {
    return this.http.put<CardDTO>(`${this.BASE_API}/${deckId}/cards/${cardId}`, data);
  }

  /**
   * Xóa card
   */
  deleteCard(deckId: number, cardId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_API}/${deckId}/cards/${cardId}`);
  }

  /**
   * Lấy danh sách thẻ cần ôn tập hôm nay
   */
  getCardsDueForReview(): Observable<CardDTO[]> {
    return this.http.get<CardDTO[]>(`${this.BASE_API}/cards/due-for-review`);
  }

  /**
   * Ghi nhận kết quả ôn tập thẻ
   */
  reviewCard(deckId: number, cardId: number, request: ReviewCardRequest): Observable<ReviewCardResponse> {
    return this.http.post<ReviewCardResponse>(`${this.BASE_API}/${deckId}/cards/${cardId}/review`, request);
  }

  /**
   * Lấy thống kê học tập
   */
  getStudyStats(): Observable<StudyStats> {
    return this.http.get<StudyStats>(`${this.BASE_API}/cards/study-stats`);
  }
}

/**
 * Interface cho thống kê học tập
 */
export interface StudyStats {
  totalCards: number;
  dueCards: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  averageQuality: number;
}


