import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Challenge, CreateChallengeRequest, RespondToChallengeRequest, ApiResponse, ChallengeStatus } from '../interfaces/challenge.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private apiUrl = `${environment.apiUrl}/challenges`;

  constructor(
    private http: HttpClient,
    private message: NzMessageService
  ) {}

  /**
   * Get all challenges for the current user (sent and received)
   */
  getMyChallenges(): Observable<Challenge[]> {
    console.log('🔥 Getting challenges from backend...');
    
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/my-challenges`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Raw API Response:', response.data);
          
          // Transform backend format to frontend interface
          const challenges: Challenge[] = response.data.map((item: any) => ({
            id: item.id,
            challenger: {
              id: item.challengerId,
              displayName: item.challengerName,
              email: item.challengerEmail,
              avatar: item.challengerAvatar
            },
            opponent: {
              id: item.opponentId,
              displayName: item.opponentName,
              email: item.opponentEmail,
              avatar: item.opponentAvatar
            },
            deck: {
              id: item.deckId,
              name: item.deckName,
              description: item.deckDescription,
              cardCount: item.deckCardCount
            },
            status: item.status as ChallengeStatus,
            totalQuestions: item.totalQuestions,
            timeLimit: item.timeLimit,
            challengerScore: item.challengerScore,
            challengerTime: item.challengerTime,
            opponentScore: item.opponentScore,
            opponentTime: item.opponentTime,
            winnerId: item.winnerId,
            winnerName: item.winnerName,
            createdAt: new Date(item.createdAt),
            expiresAt: new Date(item.expiresAt),
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
            // Additional fields from backend
            isTie: item.isTie || false,
            expired: item.expired || false,
            pending: item.pending || false,
            completed: item.completed || false,
            rejected: item.rejected || false,
            accepted: item.accepted || false
          }));
          
          console.log('✅ Transformed challenges:', challenges);
          return challenges;
        }
        throw new Error(response.error || response.message || 'Unknown error');
      }),
      catchError(error => {
        console.error('❌ PRODUCTION API Error:', error);
        
        // Enhanced error handling with user feedback  
        let errorMessage = 'Không thể tải danh sách thách đấu';
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập thách đấu';
        } else if (error.status === 429) {
          errorMessage = 'Quá nhiều yêu cầu, vui lòng thử lại sau';
        } else if (error.status === 0) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
        } else if (error.status >= 500) {
          errorMessage = 'Lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên';
        }
        
        this.message?.error(errorMessage);
        
        // Return empty array for production 
        console.log('📋 Returning empty challenges list due to API error');
        return of([]);
      })
    );
  }

  /**
   * Get challenges sent by current user
   */
  getSentChallenges(): Observable<Challenge[]> {
    console.log('📤 Getting sent challenges...');
    
    return this.http.get<ApiResponse<Challenge[]>>(`${this.apiUrl}/sent`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Sent challenges:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to get sent challenges');
      }),
      catchError(error => {
        console.error('❌ Error fetching sent challenges:', error);
        this.message?.error('Không thể tải thách đấu đã gửi');
        return of([]);
      })
    );
  }

  /**
   * Get challenges received by current user
   */
  getReceivedChallenges(): Observable<Challenge[]> {
    console.log('📥 Getting received challenges...');
    
    return this.http.get<ApiResponse<Challenge[]>>(`${this.apiUrl}/received`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Received challenges:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to get received challenges');
      }),
      catchError(error => {
        console.error('❌ Error fetching received challenges:', error);
        this.message?.error('Không thể tải thách đấu nhận được');
        return of([]);
      })
    );
  }

  /**
   * Create a new challenge with professional validation
   */
  createChallenge(request: CreateChallengeRequest): Observable<Challenge> {
    console.log('🚀 Creating challenge:', request);
    
    return this.http.post<ApiResponse<Challenge>>(this.apiUrl, request).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Challenge created successfully:', response.data);
          this.message?.success(response.message || 'Thách đấu đã được tạo thành công');
          return response.data;
        }
        throw new Error(response.error || 'Failed to create challenge');
      }),
      catchError(error => {
        console.error('❌ Error creating challenge:', error);
        
        let errorMessage = 'Không thể tạo thách đấu';
        if (error.status === 400) {
          errorMessage = error.error?.error || 'Thông tin thách đấu không hợp lệ';
        } else if (error.status === 429) {
          errorMessage = 'Bạn đã tạo quá nhiều thách đấu. Vui lòng thử lại sau';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền tạo thách đấu với bộ thẻ này';
        }
        
        this.message?.error(errorMessage);
        throw error;
      })
    );
  }

  /**
   * Accept a challenge with professional feedback
   */
  acceptChallenge(challengeId: number): Observable<Challenge> {
    console.log('✅ Accepting challenge:', challengeId);
    
    return this.http.put<ApiResponse<Challenge>>(`${this.apiUrl}/${challengeId}/accept`, {}).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Challenge accepted successfully:', response.data);
          this.message?.success(response.message || 'Đã chấp nhận thách đấu');
          return response.data;
        }
        throw new Error(response.error || 'Failed to accept challenge');
      }),
      catchError(error => {
        console.error('❌ Error accepting challenge:', error);
        
        let errorMessage = 'Không thể chấp nhận thách đấu';
        if (error.status === 403) {
          errorMessage = 'Bạn không có quyền chấp nhận thách đấu này';
        } else if (error.status === 404) {
          errorMessage = 'Thách đấu không tồn tại';
        } else if (error.status === 409) {
          errorMessage = 'Thách đấu đã được xử lý hoặc đã hết hạn';
        }
        
        this.message?.error(errorMessage);
        throw error;
      })
    );
  }

  /**
   * Decline a challenge with professional feedback
   */
  declineChallenge(challengeId: number): Observable<Challenge> {
    console.log('❌ Declining challenge:', challengeId);
    
    return this.http.put<ApiResponse<Challenge>>(`${this.apiUrl}/${challengeId}/decline`, {}).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Challenge declined successfully:', response.data);
          this.message?.success(response.message || 'Đã từ chối thách đấu');
          return response.data;
        }
        throw new Error(response.error || 'Failed to decline challenge');
      }),
      catchError(error => {
        console.error('❌ Error declining challenge:', error);
        
        let errorMessage = 'Không thể từ chối thách đấu';
        if (error.status === 403) {
          errorMessage = 'Bạn không có quyền từ chối thách đấu này';
        } else if (error.status === 404) {
          errorMessage = 'Thách đấu không tồn tại';
        }
        
        this.message?.error(errorMessage);
        throw error;
      })
    );
  }

  /**
   * Respond to a challenge (accept or reject)
   */
  respondToChallenge(challengeId: number, request: RespondToChallengeRequest): Observable<Challenge> {
    const endpoint = request.accept ? 'accept' : 'reject';
    return this.http.put<Challenge>(`${this.apiUrl}/${challengeId}/${endpoint}`, {}).pipe(
      catchError(error => {
        console.error(`Error responding to challenge:`, error);
        throw error;
      })
    );
  }


  /**
   * Get challenge details by ID
   */
  getChallengeById(challengeId: number): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.apiUrl}/${challengeId}`).pipe(
      catchError(error => {
        console.error('Error fetching challenge details:', error);
        throw error;
      })
    );
  }

  /**
   * Complete a challenge with scores (enhanced with time tracking)
   */
  completeChallenge(challengeId: number, score: number, timeSpent?: number): Observable<Challenge> {
    console.log('🏁 Completing challenge:', challengeId, 'Score:', score, 'Time:', timeSpent);
    
    const payload = { score, timeSpent: timeSpent || 0 };
    
    return this.http.put<ApiResponse<Challenge>>(`${this.apiUrl}/${challengeId}/complete`, payload).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Challenge completed successfully:', response.data);
          this.message?.success(response.message || 'Đã nộp kết quả thành công');
          return response.data;
        }
        throw new Error(response.error || 'Failed to complete challenge');
      }),
      catchError(error => {
        console.error('❌ Error completing challenge:', error);
        
        let errorMessage = 'Không thể nộp kết quả';
        if (error.status === 400) {
          errorMessage = error.error?.error || 'Kết quả không hợp lệ';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền nộp kết quả cho thách đấu này';
        } else if (error.status === 409) {
          errorMessage = 'Bạn đã nộp kết quả rồi hoặc thách đấu chưa được chấp nhận';
        }
        
        this.message?.error(errorMessage);
        throw error;
      })
    );
  }

  /**
   * Get challenge statistics for current user
   */
  getChallengeStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(stats => stats || { total: 0, won: 0, lost: 0, pending: 0 }),
      catchError(error => {
        console.error('Error fetching challenge stats:', error);
        return of({ total: 0, won: 0, lost: 0, pending: 0 });
      })
    );
  }

  /**
   * Get challenge quiz data with questions
   */
  getChallengeQuizData(challengeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${challengeId}/quiz-data`).pipe(
      catchError(error => {
        console.error('Error fetching challenge quiz data:', error);
        throw error;
      })
    );
  }

  /**
   * Submit challenge result with score and time (professional version)
   */
  submitChallengeResult(challengeId: number, result: { score: number; timeSpent: number }): Observable<Challenge> {
    console.log('📊 Submitting challenge result:', challengeId, result);
    
    return this.http.put<ApiResponse<Challenge>>(`${this.apiUrl}/${challengeId}/submit-result`, result).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Result submitted successfully:', response.data);
          this.message?.success(response.message || 'Đã nộp kết quả thành công');
          return response.data;
        }
        throw new Error(response.error || 'Failed to submit result');
      }),
      catchError(error => {
        console.error('❌ Error submitting challenge result:', error);
        this.message?.error('Không thể nộp kết quả');
        throw error;
      })
    );
  }

  // ===== NEW PROFESSIONAL METHODS =====

  /**
   * Cancel a pending challenge
   */
  cancelChallenge(challengeId: number): Observable<Challenge> {
    console.log('🚫 Canceling challenge:', challengeId);
    
    return this.http.put<ApiResponse<Challenge>>(`${this.apiUrl}/${challengeId}/cancel`, {}).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Challenge canceled successfully:', response.data);
          this.message?.success(response.message || 'Đã hủy thách đấu');
          return response.data;
        }
        throw new Error(response.error || 'Failed to cancel challenge');
      }),
      catchError(error => {
        console.error('❌ Error canceling challenge:', error);
        this.message?.error('Không thể hủy thách đấu');
        throw error;
      })
    );
  }

  /**
   * Get available decks for challenges
   */
  getAvailableDecks(): Observable<any[]> {
    console.log('📚 Getting available decks...');
    
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/available-decks`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Available decks:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to get available decks');
      }),
      catchError(error => {
        console.error('❌ Error getting available decks:', error);
        this.message?.error('Không thể tải danh sách bộ thẻ');
        return of([]);
      })
    );
  }

  /**
   * Get user rate limit information
   */
  getRateLimitInfo(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/rate-limit-info`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return { remainingChallengesForToday: 20, secondsUntilNextChallenge: 0 };
      }),
      catchError(error => {
        console.error('❌ Error getting rate limit info:', error);
        return of({ remainingChallengesForToday: 20, secondsUntilNextChallenge: 0 });
      })
    );
  }

  /**
   * Enhanced challenge details with access validation
   */
  getChallengeDetails(challengeId: number): Observable<Challenge> {
    console.log('🔍 Getting challenge details:', challengeId);
    
    return this.http.get<ApiResponse<Challenge>>(`${this.apiUrl}/${challengeId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Challenge details:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to get challenge details');
      }),
      catchError(error => {
        console.error('❌ Error getting challenge details:', error);
        this.message?.error('Không thể tải chi tiết thách đấu');
        throw error;
      })
    );
  }

  /**
   * Get enhanced challenge quiz data
   */
  getEnhancedChallengeQuizData(challengeId: number): Observable<any> {
    console.log('🎯 Getting enhanced quiz data for challenge:', challengeId);
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${challengeId}/quiz-data`).pipe(
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Enhanced quiz data:', response.data);
          return response.data;
        }
        throw new Error(response.error || 'Failed to get quiz data');
      }),
      catchError(error => {
        console.error('❌ Error getting enhanced quiz data:', error);
        this.message?.error('Không thể tải dữ liệu câu hỏi');
        throw error;
      })
    );
  }
}

