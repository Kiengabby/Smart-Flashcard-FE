import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timeout, catchError, throwError, retry, delay } from 'rxjs';
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
    return this.http.get<DeckDTO[]>(`${this.DECK_API}/`).pipe(
      timeout(10000), // 10 second timeout
      retry(2), // Retry 2 times
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin chi tiết một deck
   */
  getDeckById(id: string): Observable<DeckDTO> {
    return this.http.get<DeckDTO>(`${this.DECK_API}/${id}`).pipe(
      timeout(5000), // 5 second timeout
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Không thể kết nối đến server';
          break;
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu';
          break;
        case 500:
          errorMessage = 'Lỗi server nội bộ';
          break;
        default:
          errorMessage = `Lỗi ${error.status}: ${error.message}`;
      }
    }
    
    console.error('DeckService Error:', errorMessage, error);
    return throwError(() => error);
  }

  /**
   * Tạo deck mới
   */
  createDeck(data: CreateDeckRequest): Observable<DeckDTO> {
    return this.http.post<DeckDTO>(`${this.DECK_API}/`, data);
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
