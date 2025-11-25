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
    return this.http.get<StudyStats>('http://localhost:8080/api/stats/study');
  }
  
  /**
   * Lấy các ngày có hoạt động học tập trong tháng
   */
  getActivityDates(year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`http://localhost:8080/api/stats/activity-dates?year=${year}&month=${month}`);
  }

  /**
   * Bulk create cards with AI translation
   */
  bulkCreateCards(deckId: number, request: BulkCreateCardsRequest): Observable<BulkCreateCardsResponse> {
    return this.http.post<BulkCreateCardsResponse>(`${this.BASE_API}/${deckId}/cards/bulk-create`, request);
  }

  /**
   * Get translations only (without creating cards)
   */
  getTranslations(request: BulkCreateCardsRequest): Observable<TranslationResult[]> {
    return this.http.post<TranslationResult[]>('http://localhost:8080/api/translation/batch-translate', request);
  }

  /**
   * Create cards from pre-translated data
   */
  createCardsFromTranslations(deckId: number, cardsData: CardTranslationData[]): Observable<BulkCreateCardsResponse> {
    return this.http.post<BulkCreateCardsResponse>(`${this.BASE_API}/${deckId}/cards/create-from-translations`, cardsData);
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
  totalDecks: number;
  studyingDecks: number;
  conqueredDecks: number;
  reviewToday: number;
  totalWordsLearned: number;
  activeChallenges: number;
}

/**
 * Interface for bulk card creation
 */
export interface BulkCreateCardsRequest {
  words: string[];
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  autoDetectLanguage: boolean;
}

export interface BulkCreateCardsResponse {
  createdCards: CardDTO[];
  failedCards: {
    word: string;
    error: string;
    translation?: string;
  }[];
  totalRequested: number;
  successCount: number;
  failureCount: number;
}

/**
 * Interface for translation results
 */
export interface TranslationResult {
  word: string;
  translation: string;
  confidence?: number;
}

/**
 * Interface for card translation data
 */
export interface CardTranslationData {
  frontText: string;
  backText: string;
}


