import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { 
  LearningProgressDTO, 
  UpdateLearningProgressRequest,
  LearningModeStatus 
} from '../interfaces/learning-progress.dto';

@Injectable({
  providedIn: 'root'
})
export class LearningProgressService {
  private apiUrl = 'http://localhost:8080/api/learning-progress';
  
  // ⚠️ MOCK MODE - Set to false to use real backend API
  private USE_MOCK = false; // 🔥 Using real backend now!
  private mockProgressStorage: Map<number, LearningProgressDTO> = new Map();
  private STORAGE_KEY = 'smart_flashcard_learning_progress';

  constructor(private http: HttpClient) {
    // 🔥 Load progress from localStorage on initialization
    this.loadProgressFromStorage();
  }

  /**
   * Get learning progress for a specific deck
   */
  getDeckProgress(deckId: number): Observable<LearningProgressDTO> {
    // MOCK MODE: Use in-memory storage
    if (this.USE_MOCK) {
      console.log('🎭 [MOCK MODE] Getting progress for deck:', deckId);
      
      if (!this.mockProgressStorage.has(deckId)) {
        this.mockProgressStorage.set(deckId, this.getDefaultProgress(deckId));
      }
      
      const progress = this.mockProgressStorage.get(deckId)!;
      return of(progress).pipe(delay(300)); // Simulate network delay
    }

    // REAL MODE: Call backend API
    return this.http.get<LearningProgressDTO>(`${this.apiUrl}/deck/${deckId}`).pipe(
      catchError(() => {
        return of(this.getDefaultProgress(deckId));
      })
    );
  }

  /**
   * Update learning progress when completing a mode
   */
  updateProgress(
    deckId: number, 
    request: UpdateLearningProgressRequest
  ): Observable<LearningProgressDTO> {
    // MOCK MODE: Update in-memory storage
    if (this.USE_MOCK) {
      console.log('🎭 [MOCK MODE] Updating progress:', { deckId, request });
      
      let progress = this.mockProgressStorage.get(deckId);
      if (!progress) {
        progress = this.getDefaultProgress(deckId);
      }

      // Update progress based on mode
      const now = new Date().toISOString();
      switch (request.mode) {
        case 'flashcard':
          progress.flashcardCompleted = request.completed;
          progress.flashcardScore = request.score;
          progress.flashcardCompletedAt = now;
          break;
        case 'quiz':
          progress.quizCompleted = request.completed;
          progress.quizScore = request.score;
          progress.quizCompletedAt = now;
          break;
        case 'listening':
          progress.listeningCompleted = request.completed;
          progress.listeningScore = request.score;
          progress.listeningCompletedAt = now;
          break;
        case 'writing':
          progress.writingCompleted = request.completed;
          progress.writingScore = request.score;
          progress.writingCompletedAt = now;
          break;
      }

      // Recalculate overall progress
      progress.overallProgress = this.calculateOverallProgress(progress);
      progress.isFullyCompleted = progress.overallProgress === 100;
      if (progress.isFullyCompleted && !progress.completedAt) {
        progress.completedAt = now;
      }
      progress.updatedAt = now;

      this.mockProgressStorage.set(deckId, progress);
      this.saveProgressToStorage();
      console.log('✅ [MOCK MODE] Progress updated:', progress);
      
      return of(progress).pipe(delay(500)); // Simulate network delay
    }

    // REAL MODE: Call backend API
    return this.http.put<LearningProgressDTO>(
      `${this.apiUrl}/deck/${deckId}`,
      request
    );
  }

  /**
   * Get learning mode statuses with lock/unlock logic
   */
  getLearningModes(progress: LearningProgressDTO): LearningModeStatus[] {
    const modes: LearningModeStatus[] = [
      {
        mode: 'flashcard',
        name: 'Flashcard Study',
        nameVi: 'Học Flashcard',
        icon: 'credit-card',
        description: 'Ghi nhớ từ vựng với thẻ học thông minh',
        isCompleted: progress.flashcardCompleted,
        isLocked: false, // Always unlocked - first mode
        score: progress.flashcardScore,
        completedAt: progress.flashcardCompletedAt,
        order: 1,
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      },
      {
        mode: 'quiz',
        name: 'Quiz Practice',
        nameVi: 'Làm Trắc Nghiệm',
        icon: 'check-circle',
        description: 'Kiểm tra kiến thức với bài trắc nghiệm',
        isCompleted: progress.quizCompleted,
        isLocked: !progress.flashcardCompleted, // Locked until flashcard done
        score: progress.quizScore,
        completedAt: progress.quizCompletedAt,
        order: 2,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      },
      {
        mode: 'listening',
        name: 'Listening Practice',
        nameVi: 'Luyện Nghe',
        icon: 'sound',
        description: 'Rèn luyện kỹ năng nghe hiểu',
        isCompleted: progress.listeningCompleted,
        isLocked: !progress.quizCompleted, // Locked until quiz done
        score: progress.listeningScore,
        completedAt: progress.listeningCompletedAt,
        order: 3,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      },
      {
        mode: 'writing',
        name: 'AI Writing Practice',
        nameVi: 'Luyện Viết AI',
        icon: 'edit',
        description: 'Thực hành viết câu với AI đánh giá',
        isCompleted: progress.writingCompleted,
        isLocked: !progress.listeningCompleted, // Locked until listening done
        score: progress.writingScore,
        completedAt: progress.writingCompletedAt,
        order: 4,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
      }
    ];

    return modes;
  }

  /**
   * Check if user can access a specific mode
   */
  canAccessMode(mode: string, progress: LearningProgressDTO): boolean {
    switch (mode) {
      case 'flashcard':
        return true; // Always accessible
      case 'quiz':
        return progress.flashcardCompleted;
      case 'listening':
        return progress.quizCompleted;
      case 'writing':
        return progress.listeningCompleted;
      default:
        return false;
    }
  }

  /**
   * Get next unlocked mode
   */
  getNextMode(progress: LearningProgressDTO): string | null {
    if (!progress.flashcardCompleted) return 'flashcard';
    if (!progress.quizCompleted) return 'quiz';
    if (!progress.listeningCompleted) return 'listening';
    if (!progress.writingCompleted) return 'writing';
    return null; // All completed
  }

  /**
   * Calculate overall progress percentage
   */
  calculateOverallProgress(progress: LearningProgressDTO): number {
    let completed = 0;
    if (progress.flashcardCompleted) completed += 25;
    if (progress.quizCompleted) completed += 25;
    if (progress.listeningCompleted) completed += 25;
    if (progress.writingCompleted) completed += 25;
    return completed;
  }

  /**
   * Get default progress object
   */
  private getDefaultProgress(deckId: number): LearningProgressDTO {
    return {
      id: 0,
      deckId: deckId,
      userId: '',
      flashcardCompleted: false,
      quizCompleted: false,
      listeningCompleted: false,
      writingCompleted: false,
      overallProgress: 0,
      isFullyCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // ========================================
  // 🔥 LOCALSTORAGE PERSISTENCE METHODS
  // ========================================

  /**
   * Load all progress from localStorage
   */
  private loadProgressFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const progressArray: LearningProgressDTO[] = JSON.parse(stored);
        progressArray.forEach(progress => {
          this.mockProgressStorage.set(progress.deckId, progress);
        });
        console.log('✅ Loaded progress from localStorage:', progressArray.length, 'decks');
      }
    } catch (error) {
      console.error('❌ Error loading progress from localStorage:', error);
    }
  }

  /**
   * Save all progress to localStorage
   */
  private saveProgressToStorage(): void {
    try {
      const progressArray = Array.from(this.mockProgressStorage.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressArray));
      console.log('💾 Saved progress to localStorage:', progressArray.length, 'decks');
    } catch (error) {
      console.error('❌ Error saving progress to localStorage:', error);
    }
  }

  /**
   * Clear all progress (for testing or reset)
   */
  clearAllProgress(): void {
    this.mockProgressStorage.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Cleared all progress');
  }

  /**
   * Clear progress for a specific deck
   */
  clearDeckProgress(deckId: number): void {
    this.mockProgressStorage.delete(deckId);
    this.saveProgressToStorage();
    console.log('🗑️ Cleared progress for deck:', deckId);
  }
}
