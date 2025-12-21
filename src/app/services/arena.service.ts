import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ArenaInfo,
  ArenaSession,
  ArenaSubmitRequest,
  ArenaResult,
  ArenaPlayer,
  ApiResponse
} from '../interfaces/arena.model';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Arena Service
 * Handles all Arena Mode API calls
 * 
 * @author Minh Kien
 * @version 1.0.0
 * @since 2025-12-17
 */
@Injectable({
  providedIn: 'root'
})
export class ArenaService {
  private apiUrl = `${environment.apiUrl}/arena`;

  constructor(
    private http: HttpClient,
    private message: NzMessageService
  ) {}

  /**
   * Get arena information for a deck
   */
  getArenaInfo(deckId: number): Observable<ArenaInfo> {
    console.log(`🎮 Getting arena info for deck ${deckId}`);
    
    return this.http.get<ApiResponse<ArenaInfo>>(`${this.apiUrl}/decks/${deckId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Arena info loaded:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to load arena info');
      }),
      catchError(error => {
        console.error('❌ Error loading arena info:', error);
        this.message.error('Không thể tải thông tin sân chơi');
        throw error;
      })
    );
  }

  /**
   * Start a new arena session
   */
  startArenaSession(deckId: number): Observable<ArenaSession> {
    console.log(`🚀 Starting arena session for deck ${deckId}`);
    
    return this.http.post<ApiResponse<ArenaSession>>(`${this.apiUrl}/decks/${deckId}/start`, {}).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Arena session started:', response.data);
          this.message.success('🎮 Bắt đầu thử thách!');
          return response.data;
        }
        throw new Error(response.error || 'Failed to start arena session');
      }),
      catchError(error => {
        console.error('❌ Error starting arena session:', error);
        
        let errorMessage = 'Không thể bắt đầu thử thách';
        if (error.status === 409) {
          errorMessage = '⚠️ Thử thách trước chưa hoàn thành';
        } else if (error.status === 400) {
          errorMessage = error.error?.error || '❌ Cần tối thiểu 10 thẻ';
        }
        
        this.message.error(errorMessage);
        throw error;
      })
    );
  }

  /**
   * Submit arena result
   */
  submitArenaResult(sessionId: number, request: ArenaSubmitRequest): Observable<ArenaResult> {
    console.log(`📊 Submitting arena result for session ${sessionId}`, request);
    
    return this.http.post<ApiResponse<ArenaResult>>(`${this.apiUrl}/sessions/${sessionId}/submit`, request).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Arena result submitted:', response.data);
          this.message.success('Đã nộp kết quả thành công!');
          return response.data;
        }
        throw new Error(response.error || 'Failed to submit result');
      }),
      catchError(error => {
        console.error('❌ Error submitting arena result:', error);
        
        let errorMessage = 'Không thể nộp kết quả';
        if (error.status === 409) {
          errorMessage = 'Phiên chơi đã kết thúc hoặc không hợp lệ';
        } else if (error.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ';
        }
        
        this.message.error(errorMessage);
        throw error;
      })
    );
  }

  /**
   * Get arena result by session ID
   */
  getArenaResult(sessionId: number): Observable<ArenaResult> {
    console.log(`📊 Loading arena result for session ${sessionId}`);
    
    return this.http.get<ApiResponse<ArenaResult>>(`${this.apiUrl}/sessions/${sessionId}/result`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Arena result loaded:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to load result');
      }),
      catchError(error => {
        console.error('❌ Error loading arena result:', error);
        this.message.error('Không thể tải kết quả');
        throw error;
      })
    );
  }

  /**
   * Get full leaderboard
   */
  getLeaderboard(deckId: number, period: 'all' | 'today' | 'week' = 'all'): Observable<ArenaPlayer[]> {
    console.log(`🏆 Getting leaderboard for deck ${deckId} (period: ${period})`);
    
    return this.http.get<ApiResponse<ArenaPlayer[]>>(`${this.apiUrl}/decks/${deckId}/leaderboard`, {
      params: { period }
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Leaderboard loaded:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to load leaderboard');
      }),
      catchError(error => {
        console.error('❌ Error loading leaderboard:', error);
        this.message.error('Không thể tải bảng xếp hạng');
        throw error;
      })
    );
  }

  /**
   * Get user's rankings across all decks for dashboard
   */
  getUserRankings(): Observable<any[]> {
    console.log('📊 Getting user rankings for dashboard');
    
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/my-rankings`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ User rankings loaded:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to load rankings');
      }),
      catchError(error => {
        console.error('❌ Error loading user rankings:', error);
        // Don't show error message - this is optional dashboard data
        return [];
      })
    );
  }
}
