import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WritingEvaluationRequest {
  word: string;
  meaning: string;
  sentence: string;
}

export interface WritingFeedbackResponse {
  score: number;
  suggestion: string;
  positivePoints: string[];
  improvementAreas: string[];
  grammarCheck: string;
  vocabularyLevel: string;
  isCorrect: boolean;
}

export interface ExampleSentenceRequest {
  word: string;
  meaning: string;
}

export interface ExampleSentenceResponse {
  exampleSentence: string;
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class WritingPracticeService {
  private readonly BASE_API = 'http://localhost:8080/api/writing-practice';

  constructor(private http: HttpClient) {}

  evaluateSentence(request: WritingEvaluationRequest): Observable<WritingFeedbackResponse> {
    return this.http.post<WritingFeedbackResponse>(`${this.BASE_API}/evaluate`, request);
  }

  getExampleSentence(request: ExampleSentenceRequest): Observable<ExampleSentenceResponse> {
    // Backend expects a simple object with word and meaning
    const payload = {
      word: request.word,
      meaning: request.meaning
    };
    
    return this.http.post<ExampleSentenceResponse>(`${this.BASE_API}/example`, payload);
  }
}
