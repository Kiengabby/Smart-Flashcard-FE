import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuizQuestion, QuizAnswer, QuizAnswerResult, QuizResult } from '../interfaces/quiz.interface';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8080/api/v1/decks';

  constructor(private http: HttpClient) {}

  /**
   * Bắt đầu quiz mới cho deck
   */
  startQuiz(deckId: number): Observable<QuizQuestion> {
    return this.http.post<ApiResponse<QuizQuestion>>(`${this.apiUrl}/${deckId}/quiz/start`, {})
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
          return response.data;
        })
      );
  }

  /**
   * Lấy câu hỏi hiện tại
   */
  getCurrentQuestion(deckId: number): Observable<QuizQuestion> {
    return this.http.get<ApiResponse<QuizQuestion>>(`${this.apiUrl}/${deckId}/quiz/current`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
          return response.data;
        })
      );
  }

  /**
   * Submit câu trả lời
   */
  submitAnswer(deckId: number, answer: QuizAnswer): Observable<QuizAnswerResult> {
    return this.http.post<ApiResponse<QuizAnswerResult>>(`${this.apiUrl}/${deckId}/quiz/answer`, answer)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
          return response.data;
        })
      );
  }

  /**
   * Lấy kết quả quiz
   */
  getQuizResult(deckId: number): Observable<QuizResult> {
    return this.http.get<ApiResponse<QuizResult>>(`${this.apiUrl}/${deckId}/quiz/result`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
          return response.data;
        })
      );
  }
}