import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DailyReviewOverview {
  // Backend response fields
  totalDue: number;           // Total cards due today
  overdueCards: number;       // Cards past their review date
  newCards: number;           // Cards never studied
  estimatedTime: number;      // Estimated time in SECONDS
  currentStreak: number;      // Current study streak in days
  hasStudiedToday: boolean;   // Whether user has studied today
  accuracy: number;           // Recent accuracy percentage
  
  learningDistribution: {
    new: number;
    learning: number;
    review: number;
    mastered: number;
  };
  
  recommendations: {
    priority: string;
    action: string;
  };
}

export interface ReviewSessionResponse {
  sessionId: string;
  cards: ReviewCard[];
  totalCards: number;
  estimatedTime: number;
  sessionType: string;
  startTime: string;
}

export interface ReviewCard {
  id: number;
  cardId: number;
  front: string;
  back: string;
  audioUrl?: string;
  currentPhase?: string;
  difficulty?: string;
  easinessFactor?: number;
  nextReviewDate?: string;
  deckId?: number;
  deckName?: string;
  hint?: string;
}

export interface ReviewCardRequest {
  quality: number;
  responseTime?: number;
}

export interface ReviewSessionStats {
  sessionId: string;
  totalCards: number;
  completedCards: number;
  averageQuality: number;
  totalTime: number;
  accuracyRate: number;
  cardsPerPhase?: {
    [key: string]: number;
  };
  qualityDistribution?: {
    [key: string]: number;
  };
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DailyReviewService {
  private readonly apiUrl = 'http://localhost:8080/api/daily-review';

  constructor(private http: HttpClient) {}

  /**
   * Get daily review overview with statistics
   */
  getDailyOverview(): Observable<DailyReviewOverview> {
    return this.http.get<ApiResponse<DailyReviewOverview>>(`${this.apiUrl}/overview`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Start a new review session
   */
  startReviewSession(deckIds?: number[]): Observable<ReviewSessionResponse> {
    const body: { [key: string]: any } = { userId: 1 }; // TODO: Get real user ID from auth service
    if (deckIds && deckIds.length > 0) {
      body['deckIds'] = deckIds;
    }
    return this.http.post<ApiResponse<ReviewSessionResponse>>(`${this.apiUrl}/sessions/start`, body).pipe(
      map(response => response.data)
    );
  }

  /**
   * Review a specific card with quality rating
   */
  reviewCard(sessionId: string, cardId: number, request: ReviewCardRequest): Observable<any> {
    // Backend expects userId in body, not sessionId in URL
    const body = {
      ...request,
      userId: 1, // TODO: Get from auth service
      timeSpent: request.responseTime || 0
    };
    return this.http.post(`${this.apiUrl}/cards/${cardId}/review`, body);
  }

  /**
   * Complete current review session and get statistics
   */
  completeSession(sessionId: string): Observable<ReviewSessionStats> {
    // Backend doesn't have this endpoint yet, return dummy data
    return new Observable(observer => {
      observer.next({
        sessionId: sessionId,
        totalCards: 0,
        completedCards: 0,
        averageQuality: 0,
        totalTime: 0,
        accuracyRate: 0
      } as ReviewSessionStats);
      observer.complete();
    });
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): Observable<ReviewSessionStats> {
    return this.http.get<ApiResponse<ReviewSessionStats>>(`${this.apiUrl}/sessions/${sessionId}/stats`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get user's study statistics
   */
  getStudyStatistics(days?: number): Observable<any> {
    const params: { [key: string]: string } = {};
    if (days) {
      params['days'] = days.toString();
    }
    return this.http.get(`${this.apiUrl}/statistics`, { params });
  }

  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }
}
