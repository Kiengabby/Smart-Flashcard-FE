import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeckDTO, CreateDeckRequest, UpdateDeckRequest } from '../interfaces/deck.dto';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private readonly DECK_API = 'http://localhost:8080/api/decks';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả deck của user
   */
  getDecks(): Observable<DeckDTO[]> {
    return this.http.get<DeckDTO[]>(this.DECK_API);
  }

  /**
   * Lấy thông tin chi tiết một deck
   */
  getDeckById(id: string): Observable<DeckDTO> {
    return this.http.get<DeckDTO>(`${this.DECK_API}/${id}`);
  }

  /**
   * Tạo deck mới
   */
  createDeck(data: CreateDeckRequest): Observable<DeckDTO> {
    return this.http.post<DeckDTO>(this.DECK_API, data);
  }

  /**
   * Cập nhật thông tin deck
   */
  updateDeck(id: string, data: UpdateDeckRequest): Observable<DeckDTO> {
    return this.http.put<DeckDTO>(`${this.DECK_API}/${id}`, data);
  }

  /**
   * Xóa deck
   */
  deleteDeck(id: string): Observable<void> {
    return this.http.delete<void>(`${this.DECK_API}/${id}`);
  }
}
