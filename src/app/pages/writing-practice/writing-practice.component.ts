import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CardService } from '../../services/card.service';
import { DeckService } from '../../services/deck.service';
import { WritingPracticeService, WritingFeedbackResponse, ExampleSentenceRequest, ExampleSentenceResponse } from '../../services/writing-practice.service';
import { CardDTO } from '../../interfaces/card.dto';
import { DeckDTO } from '../../interfaces/deck.dto';
import { WebSpeechService } from '../../services/web-speech.service';

@Component({
  selector: 'app-writing-practice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzInputModule,
    NzAlertModule,
    NzTagModule,
    NzSpinModule,
    NzDividerModule,
    NzResultModule,
    NzTooltipModule,
    NzFormModule,
    NzModalModule
  ],
  providers: [NzMessageService],
  templateUrl: './writing-practice.component.html',
  styleUrls: ['./writing-practice.component.scss']
})
export class WritingPracticeComponent implements OnInit {
  deckId!: number;
  deck: DeckDTO | null = null;
  cards: CardDTO[] = [];
  currentCard: CardDTO | null = null;
  currentIndex = 0;
  isLoading = true;
  isEvaluating = false;
  isAudioLoading = false;
  private audioElement: HTMLAudioElement | null = null;

  // Writing practice specific
  userSentence = '';
  feedback: WritingFeedbackResponse | null = null;
  showFeedback = false;
  hasEvaluated = false;
  
  // Example sentence functionality
  exampleSentence: ExampleSentenceResponse | null = null;
  showExample = false;
  isLoadingExample = false;
  
  // Stats
  score = 0;
  totalEvaluated = 0;

  get progress(): number {
    return this.cards.length > 0 ? Math.round(((this.currentIndex) / this.cards.length) * 100) : 0;
  }

  get averageScore(): number {
    return this.totalEvaluated > 0 ? Math.round((this.score / this.totalEvaluated)) : 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private deckService: DeckService,
    private writingPracticeService: WritingPracticeService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private webSpeechService: WebSpeechService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    console.log('WritingPracticeComponent initialized');
    
    this.route.parent?.params.subscribe(parentParams => {
      this.deckId = +parentParams['id'];
      console.log('Got deckId from parent params:', this.deckId);
      
      if (this.deckId) {
        this.loadCards();
      }
    });
  }

  private loadCards(): void {
    console.log('Loading cards for deckId:', this.deckId);
    this.isLoading = true;
    
    this.deckService.getDeckById(this.deckId.toString()).subscribe({
      next: (deck: DeckDTO) => {
        this.deck = deck;
        console.log('Loaded deck info:', deck);
        
        this.cardService.getCardsByDeck(this.deckId).subscribe({
          next: (cards) => {
            console.log('Loaded cards:', cards);
            this.cards = this.shuffleArray([...cards]);
            
            if (this.cards.length > 0) {
              this.currentCard = this.cards[0];
              setTimeout(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
              }, 500);
            } else {
              this.isLoading = false;
              this.message.warning('Không có thẻ học nào trong bộ này');
            }
          },
          error: (error) => {
            console.error('Error loading cards:', error);
            this.isLoading = false;
            this.message.error('Lỗi khi tải thẻ học: ' + (error.message || 'Vui lòng thử lại'));
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading deck:', error);
        this.isLoading = false;
        this.message.error('Lỗi khi tải thông tin bộ thẻ');
      }
    });
  }

  playAudio(): void {
    if (!this.currentCard || !this.deck) return;
    
    this.isAudioLoading = true;
    const text = this.currentCard.frontText;
    const language = this.deck.language || 'en-US';

    this.webSpeechService.speakText(text, language).then(() => {
      this.isAudioLoading = false;
      this.cdr.detectChanges();
    }).catch((error: any) => {
      console.error('Speech error:', error);
      this.isAudioLoading = false;
      this.message.error('Lỗi phát âm thanh');
      this.cdr.detectChanges();
    });
  }

  evaluateSentence(): void {
    console.log('evaluateSentence called');
    console.log('userSentence:', this.userSentence);
    
    if (!this.userSentence.trim()) {
      console.log('No sentence entered');
      this.message.warning('Vui lòng nhập câu trước khi đánh giá');
      return;
    }

    if (!this.currentCard) {
      console.log('No current card');
      return;
    }

    console.log('Starting evaluation...');
    this.isEvaluating = true;

    const request = {
      word: this.currentCard.frontText,
      meaning: this.currentCard.backText,
      sentence: this.userSentence
    };

    console.log('Evaluation request:', request);

    this.writingPracticeService.evaluateSentence(request).subscribe({
      next: (response) => {
        console.log('Evaluation response:', response);
        this.feedback = response;
        this.hasEvaluated = true;
        this.isEvaluating = false;
        
        // Update stats
        this.totalEvaluated++;
        this.score += response.score;

        // Show feedback in modal instead of inline
        this.showFeedbackModal(response);

        console.log('State after evaluation:', {
          feedback: this.feedback,
          hasEvaluated: this.hasEvaluated
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error evaluating sentence:', error);
        this.isEvaluating = false;
        this.message.error('Lỗi khi đánh giá câu: ' + (error.message || 'Vui lòng thử lại'));
      }
    });
  }

  showFeedbackModal(feedback: WritingFeedbackResponse): void {
    const modalContent = this.createModalContent(feedback);
    this.modal.create({
      nzTitle: '', // Use empty string for no title
      nzContent: modalContent,
      nzWidth: 700,
      nzBodyStyle: {
        padding: '0',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)'
      },
      nzFooter: [
        {
          label: 'Thử lại',
          type: 'default',
          onClick: () => {
            this.tryAgain();
            return true;
          }
        },
        {
          label: 'Tiếp tục',
          type: 'primary',
          onClick: () => {
            this.nextCard();
            return true;
          }
        }
      ],
      nzMaskClosable: true,
      nzKeyboard: true,
      nzCentered: true,
      nzMaskStyle: {
        backdropFilter: 'blur(8px)',
        background: 'rgba(0,0,0,0.35)'
      }
    });
  }

  createModalContent(feedback: WritingFeedbackResponse): string {
    const scoreColor = this.getFeedbackScoreColor(feedback.score);
    const scoreText = this.getFeedbackScoreText(feedback.score);
    const vocabularyColor = this.getVocabularyLevelColor(feedback.vocabularyLevel);
    
    let positivePointsHtml = '';
    if (feedback.positivePoints && feedback.positivePoints.length > 0) {
      positivePointsHtml = `
        <div class="feedback-section positive-section">
          <div class="section-header">
            <span class="section-icon positive-icon">✨</span>
            <h4>Điểm tốt</h4>
          </div>
          <ul class="feedback-list">
            ${feedback.positivePoints.map(point => `<li class="feedback-item positive-item">${point}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    let improvementAreasHtml = '';
    if (feedback.improvementAreas && feedback.improvementAreas.length > 0) {
      improvementAreasHtml = `
        <div class="feedback-section improvement-section">
          <div class="section-header">
            <span class="section-icon improvement-icon">🚀</span>
            <h4>Có thể cải thiện</h4>
          </div>
          <ul class="feedback-list">
            ${feedback.improvementAreas.map(area => `<li class="feedback-item improvement-item">${area}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    return `
      <div class="modern-feedback-modal">
        <div class="modal-header-section">
          <div class="score-display-modern">
            <div class="score-circle" style="border-color: ${scoreColor}; background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%);">
              <div class="score-number" style="color: ${scoreColor}">
                ${feedback.score}
                <span class="score-denominator">/10</span>
              </div>
            </div>
            <div class="score-info">
              <h3 class="score-title">Kết quả đánh giá</h3>
              <p class="score-description" style="color: ${scoreColor}">${scoreText}</p>
            </div>
          </div>
        </div>
        <div class="user-sentence-section">
          <div class="section-header">
            <span class="section-icon sentence-icon">💬</span>
            <h4>Câu của bạn</h4>
          </div>
          <div class="sentence-display">
            "${this.userSentence}"
          </div>
        </div>
        ${feedback.suggestion ? `
          <div class="feedback-section suggestion-section">
            <div class="section-header">
              <span class="section-icon suggestion-icon">💡</span>
              <h4>Nhận xét tổng quan</h4>
            </div>
            <p class="suggestion-text">${feedback.suggestion}</p>
          </div>
        ` : ''}
        ${positivePointsHtml}
        ${improvementAreasHtml}
        ${feedback.grammarCheck ? `
          <div class="feedback-section grammar-section">
            <div class="section-header">
              <span class="section-icon grammar-icon">📚</span>
              <h4>Kiểm tra ngữ pháp</h4>
            </div>
            <p class="grammar-text">${feedback.grammarCheck}</p>
          </div>
        ` : ''}
        ${feedback.vocabularyLevel ? `
          <div class="feedback-section vocabulary-section">
            <div class="section-header">
              <span class="section-icon vocab-icon">📖</span>
              <h4>Mức độ từ vựng</h4>
            </div>
            <div class="vocab-badge-container">
              <span class="vocab-badge modern-badge" style="background: linear-gradient(135deg, ${vocabularyColor}, ${vocabularyColor}dd);">
                ${feedback.vocabularyLevel}
              </span>
            </div>
          </div>
        ` : ''}
      </div>
      <style>
        .modern-feedback-modal {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .modal-header-section {
          background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%);
          margin: -16px -16px 24px -16px;
          padding: 24px;
          border-radius: 16px 16px 0 0;
        }
        .score-display-modern {
          display: flex;
          align-items: center;
          gap: 20px;
          color: #222;
        }
        .score-circle {
          width: 80px;
          height: 80px;
          border: 4px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.7);
          box-shadow: 0 2px 8px rgba(60,60,120,0.08);
        }
        .score-number {
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        .score-denominator {
          font-size: 16px;
          font-weight: 500;
          opacity: 0.7;
        }
        .score-info h3 {
          margin: 0 0 4px 0;
          font-size: 22px;
          font-weight: 600;
        }
        .score-description {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          background: rgba(120,120,255,0.08);
          padding: 4px 12px;
          border-radius: 16px;
          display: inline-block;
        }
        .feedback-section {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border-left: 4px solid #e0e0e0;
          box-shadow: 0 2px 8px rgba(60,60,120,0.06);
        }
        .feedback-section:hover {
          box-shadow: 0 4px 16px rgba(60,60,120,0.10);
          transform: translateY(-1px);
        }
        .user-sentence-section {
          border-left-color: #1890ff;
          background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
        }
        .suggestion-section {
          border-left-color: #722ed1;
          background: linear-gradient(135deg, #f9f0ff 0%, #faf5ff 100%);
        }
        .positive-section {
          border-left-color: #52c41a;
          background: linear-gradient(135deg, #f6ffed 0%, #f9ffed 100%);
        }
        .improvement-section {
          border-left-color: #faad14;
          background: linear-gradient(135deg, #fffbe6 0%, #fffbf0 100%);
        }
        .grammar-section {
          border-left-color: #13c2c2;
          background: linear-gradient(135deg, #e6fffb 0%, #f0ffff 100%);
        }
        .vocabulary-section {
          border-left-color: #eb2f96;
          background: linear-gradient(135deg, #fff0f6 0%, #fff5f7 100%);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .section-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          background: rgba(240,240,255,0.8);
          box-shadow: 0 2px 8px rgba(60,60,120,0.08);
        }
        .section-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
        .sentence-display {
          background: white;
          padding: 16px;
          border-radius: 8px;
          font-style: italic;
          border: 2px solid #e6f7ff;
          font-size: 15px;
          line-height: 1.6;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .suggestion-text, .grammar-text {
          margin: 0;
          line-height: 1.7;
          color: #595959;
          font-size: 14px;
        }
        .feedback-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .feedback-item {
          padding: 8px 12px;
          margin-bottom: 8px;
          background: rgba(240,240,255,0.7);
          border-radius: 6px;
          border-left: 3px solid;
          position: relative;
          font-size: 14px;
          line-height: 1.6;
        }
        .feedback-item:hover {
          background: white;
          box-shadow: 0 2px 8px rgba(60,60,120,0.10);
        }
        .positive-item {
          border-left-color: #52c41a;
        }
        .improvement-item {
          border-left-color: #faad14;
        }
        .vocab-badge-container {
          display: flex;
          align-items: center;
        }
        .modern-badge {
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(60,60,120,0.12);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .feedback-section {
          animation: slideInUp 0.5s ease forwards;
        }
        .feedback-section:nth-child(2) { animation-delay: 0.1s; }
        .feedback-section:nth-child(3) { animation-delay: 0.2s; }
        .feedback-section:nth-child(4) { animation-delay: 0.3s; }
        .feedback-section:nth-child(5) { animation-delay: 0.4s; }
        .feedback-section:nth-child(6) { animation-delay: 0.5s; }
      </style>
    `;
  }

  tryAgain(): void {
    this.userSentence = '';
    this.feedback = null;
    this.showFeedback = false;
    this.hasEvaluated = false;
    this.cdr.detectChanges();
  }

  showExampleSentence(): void {
    console.log('showExampleSentence called');
    console.log('currentCard:', this.currentCard);
    console.log('isLoadingExample:', this.isLoadingExample);
    
    if (!this.currentCard || this.isLoadingExample) {
      console.log('Exiting early - no currentCard or loading');
      return;
    }

    this.isLoadingExample = true;
    console.log('Starting API call...');
    
    const request: ExampleSentenceRequest = {
      word: this.currentCard.frontText,
      meaning: this.currentCard.backText
    };

    console.log('Request payload:', request);

    this.writingPracticeService.getExampleSentence(request).subscribe({
      next: (response: ExampleSentenceResponse) => {
        console.log('API Success response:', response);
        this.exampleSentence = response;
        this.showExample = true;
        this.isLoadingExample = false;
        console.log('State after success:', {
          exampleSentence: this.exampleSentence,
          showExample: this.showExample,
          isLoadingExample: this.isLoadingExample
        });
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('API Error:', error);
        this.isLoadingExample = false;
        this.message.error('Không thể tải câu ví dụ. Vui lòng thử lại sau.');
        
        // Fallback example
        if (this.currentCard) {
          console.log('Creating fallback example...');
          this.exampleSentence = {
            exampleSentence: `I learned the word "${this.currentCard.frontText}" which means "${this.currentCard.backText}".`,
            explanation: 'Đây là một câu ví dụ đơn giản sử dụng từ vựng này.'
          };
          this.showExample = true;
          console.log('Fallback state:', {
            exampleSentence: this.exampleSentence,
            showExample: this.showExample
          });
          this.cdr.detectChanges(); // Force change detection
        }
      }
    });
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.currentCard = this.cards[this.currentIndex];
      this.resetCardState();
    } else {
      this.showCompletionMessage();
    }
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentCard = this.cards[this.currentIndex];
      this.resetCardState();
    }
  }

  private resetCardState(): void {
    this.userSentence = '';
    this.feedback = null;
    this.showFeedback = false;
    this.hasEvaluated = false;
    this.exampleSentence = null;
    this.showExample = false;
    this.isLoadingExample = false;
  }

  private showCompletionMessage(): void {
    this.message.success('Bạn đã hoàn thành tất cả các thẻ!', {
      nzDuration: 3000
    });
    setTimeout(() => {
      this.goBack();
    }, 1500);
  }

  restart(): void {
    this.currentIndex = 0;
    this.cards = this.shuffleArray([...this.cards]);
    this.currentCard = this.cards[0];
    this.score = 0;
    this.totalEvaluated = 0;
    this.resetCardState();
    this.message.info('Đã bắt đầu lại từ đầu');
  }

  goBack(): void {
    this.router.navigate(['/app/deck', this.deckId]);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  trackByIndex(index: number): number {
    return index;
  }

  getFeedbackScoreColor(score: number): string {
    if (score >= 8) return '#52c41a';
    if (score >= 6) return '#faad14';
    return '#ff4d4f';
  }

  getFeedbackScoreText(score: number): string {
    if (score >= 9) return 'Xuất sắc';
    if (score >= 8) return 'Rất tốt';
    if (score >= 6) return 'Tốt';
    if (score >= 4) return 'Khá';
    return 'Cần cải thiện';
  }

  getVocabularyLevelColor(level: string): string {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('advanced') || lowerLevel.includes('cao')) return 'purple';
    if (lowerLevel.includes('intermediate') || lowerLevel.includes('trung')) return 'blue';
    return 'green';
  }
}
