import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { CardService, BulkCreateCardsRequest } from '../../services/card.service';
import { DeckDTO } from '../../interfaces/deck.dto';

interface BulkCreateResponse {
  createdCards: any[];
  failedCards: {
    word: string;
    error: string;
    translation?: string;
  }[];
  totalRequested: number;
  successCount: number;
  failureCount: number;
}

interface TranslationResult {
  frontText: string;
  backText: string;
  originalBackText: string;
  selected: boolean;
  isEdited: boolean;
  hasError: boolean;
  retranslating: boolean;
}

@Component({
  selector: 'app-bulk-create-cards-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzSelectModule,
    NzStepsModule,
    NzAlertModule,
    NzTagModule,
    NzDividerModule,
    NzCheckboxModule
  ],
  templateUrl: './bulk-create-cards-modal.component.html',
  styleUrls: ['./bulk-create-cards-modal.component.css']
})
export class BulkCreateCardsModalComponent implements OnInit {
  bulkForm!: FormGroup;
  isLoading = false;
  currentStep = 0;
  progressWidth = 25; // Separate property for progress bar width to avoid ExpressionChangedAfterItHasBeenCheckedError
  deck: DeckDTO;
  
  // Preview data
  parsedWords: string[] = [];
  previewResults: BulkCreateResponse | null = null;
  
  // New properties for editing
  translationResults: TranslationResult[] = [];
  creationResults: BulkCreateResponse | null = null;

  // Language options
  languageOptions = [
    { label: 'Tự động phát hiện', value: 'auto' },
    { label: 'Tiếng Anh (English)', value: 'en' },
    { label: 'Tiếng Việt (Vietnamese)', value: 'vi' },
    { label: 'Tiếng Nhật (Japanese)', value: 'ja' },
    { label: 'Tiếng Trung (Chinese)', value: 'zh' },
    { label: 'Tiếng Hàn (Korean)', value: 'ko' },
    { label: 'Tiếng Pháp (French)', value: 'fr' },
    { label: 'Tiếng Đức (German)', value: 'de' },
    { label: 'Tiếng Tây Ban Nha (Spanish)', value: 'es' },
    { label: 'Tiếng Ý (Italian)', value: 'it' },
    { label: 'Tiếng Bồ Đào Nha (Portuguese)', value: 'pt' },
    { label: 'Tiếng Nga (Russian)', value: 'ru' },
    { label: 'Tiếng Ả Rập (Arabic)', value: 'ar' },
    { label: 'Tiếng Thái (Thai)', value: 'th' }
  ];

  constructor(
    private fb: FormBuilder,
    public modal: NzModalRef,
    private cardService: CardService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    @Inject(NZ_MODAL_DATA) public data: { deck: DeckDTO }
  ) {
    this.deck = data.deck;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.bulkForm = this.fb.group({
      wordsList: ['', [Validators.required, Validators.minLength(1)]],
      sourceLanguage: [this.deck.language || 'auto', [Validators.required]],
      targetLanguage: ['vi', [Validators.required]],
      context: ['']
    });
  }

  // Chỉ parse từ, không warning, không auto-advance
  parseWords(): void {
    const wordsText = this.bulkForm.get('wordsList')?.value || '';
    this.parsedWords = wordsText
      .split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0);
  }

  // Xử lý Enter trong textarea
  onTextareaKeydown(event: KeyboardEvent): void {
    // Không làm gì cả - để Enter hoạt động bình thường (xuống dòng)
    // Không preventDefault() để user có thể Enter xuống dòng
    
    // Chỉ prevent khi nhấn Ctrl+Enter hoặc Cmd+Enter để submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.validateAndProceed();
    }
  }

  // Prevent form submit khi nhấn Enter
  onFormSubmit(event: Event): void {
    event.preventDefault(); // Prevent default form submission
    // Không làm gì - chỉ ngăn form submit tự động
  }

  // Method riêng cho validation và chuyển step
  validateAndProceed(): void {
    this.parseWords(); // Parse trước
    
    if (this.parsedWords.length === 0) {
      this.message.warning('Vui lòng nhập ít nhất một từ!');
      return;
    }
    
    if (this.parsedWords.length > 50) {
      this.message.warning('Tối đa 50 từ trong một lần tạo!');
      return;
    }

    // Chuyển sang step 1 và bắt đầu dịch
    this.currentStep = 1;
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Gọi API translation ngay lập tức
    this.startTranslation();
  }

  // Method mới để bắt đầu quá trình dịch
  startTranslation(): void {
    const request: BulkCreateCardsRequest = {
      words: this.parsedWords,
      sourceLanguage: this.bulkForm.get('sourceLanguage')?.value,
      targetLanguage: this.bulkForm.get('targetLanguage')?.value,
      context: this.bulkForm.get('context')?.value?.trim(),
      autoDetectLanguage: this.bulkForm.get('sourceLanguage')?.value === 'auto'
    };

    // Gọi API dịch
    this.cardService.getTranslations(request).subscribe({
      next: (translations: any[]) => {
        this.translationResults = translations.map(t => ({
          frontText: t.word,
          backText: t.translation,
          originalBackText: t.translation,
          selected: true,
          isEdited: false,
          hasError: !t.translation,
          retranslating: false
        }));
        
        setTimeout(() => {
          this.isLoading = false;
          this.currentStep = 2; // Chuyển sang step edit để user có thể chỉnh sửa
          this.cdr.detectChanges();
          this.message.success(`Đã dịch ${translations.length} từ! Hãy kiểm tra và chỉnh sửa nếu cần.`);
        }, 500); // Thêm delay nhỏ để UX mượt hơn
      },
      error: (error: any) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error getting translations:', error);
          this.message.error('Không thể dịch từ. Vui lòng thử lại!');
          // Quay lại step 0 khi có lỗi
          this.currentStep = 0;
        }, 0);
      }
    });
  }

  goBackToInput(): void {
    setTimeout(() => {
      this.currentStep = 0;
      this.cdr.detectChanges();
    }, 0);
  }

  createCards(): void {
    // Lấy những thẻ được chọn và hợp lệ
    const selectedCards = this.translationResults.filter(r => r.selected && !r.hasError);
    
    if (selectedCards.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một thẻ hợp lệ để tạo!');
      return;
    }

    this.isLoading = true;
    this.currentStep = 3; // Go to final step
    this.cdr.detectChanges();
    
    // Tạo request đơn giản với từ đã chọn
    const request: BulkCreateCardsRequest = {
      words: selectedCards.map(card => card.frontText),
      sourceLanguage: this.bulkForm.get('sourceLanguage')?.value,
      targetLanguage: this.bulkForm.get('targetLanguage')?.value,
      context: this.bulkForm.get('context')?.value || '',
      autoDetectLanguage: false
    };

    // Gọi API tạo thẻ với bulk create đã test
    this.cardService.bulkCreateCards(this.deck.id, request).subscribe({
      next: (response: any) => {
        this.creationResults = response;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          this.message.success(`Đã tạo thành công ${response.successCount} thẻ!`);
        }, 500);
      },
      error: (error: any) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error creating cards:', error);
          this.message.error('Không thể tạo thẻ. Vui lòng thử lại!');
          // Quay lại step edit
          this.currentStep = 2;
        }, 0);
      }
    });
  }

  // New methods for editing functionality
  selectAllCards(): void {
    this.translationResults.forEach(result => result.selected = true);
  }

  deselectAllCards(): void {
    this.translationResults.forEach(result => result.selected = false);
  }

  getSelectedCount(): number {
    return this.translationResults.filter(r => r.selected).length;
  }

  getValidCount(): number {
    return this.translationResults.filter(r => !r.hasError).length;
  }

  getSelectedValidCount(): number {
    return this.translationResults.filter(r => r.selected && !r.hasError).length;
  }

  getEditedCount(): number {
    return this.translationResults.filter(r => r.isEdited).length;
  }

  getOriginalCount(): number {
    return this.translationResults.filter(r => !r.isEdited).length;
  }

  onCardSelectionChange(): void {
    // Update UI when selection changes
    this.cdr.detectChanges();
  }

  updateCardSelection(result: TranslationResult, selected: boolean): void {
    result.selected = selected;
    this.onCardSelectionChange();
  }

  onCardEdit(result: TranslationResult): void {
    result.isEdited = result.backText !== result.originalBackText;
    result.hasError = !result.backText?.trim();
  }

  async retranslateCard(result: TranslationResult, index: number): Promise<void> {
    if (result.retranslating) return;

    // Use setTimeout to defer state changes to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      result.retranslating = true;
      this.cdr.detectChanges(); // Force UI update
    });
    
    try {
      const request = {
        words: [result.frontText],
        sourceLanguage: this.bulkForm.get('sourceLanguage')?.value,
        targetLanguage: this.bulkForm.get('targetLanguage')?.value,
        context: this.bulkForm.get('context')?.value?.trim(),
        autoDetectLanguage: this.bulkForm.get('sourceLanguage')?.value === 'auto'
      };

      // Call translation API for single word
      this.cardService.getTranslations(request).subscribe({
        next: (translations) => {
          setTimeout(() => {
            if (translations.length > 0) {
              result.backText = translations[0].translation;
              result.isEdited = result.backText !== result.originalBackText;
              result.hasError = !result.backText;
              this.message.success('Đã dịch lại thành công!');
            }
            result.retranslating = false;
            this.cdr.detectChanges(); // Force UI update
          });
        },
        error: () => {
          setTimeout(() => {
            this.message.error('Không thể dịch lại. Vui lòng thử lại!');
            result.retranslating = false;
            this.cdr.detectChanges(); // Force UI update
          });
        }
      });
    } catch (error) {
      setTimeout(() => {
        result.retranslating = false;
        this.message.error('Có lỗi xảy ra khi dịch lại!');
        this.cdr.detectChanges(); // Force UI update
      });
    }
  }

  resetCard(result: TranslationResult): void {
    result.backText = result.originalBackText;
    result.isEdited = false;
    result.hasError = !result.backText;
  }

  removeCard(index: number): void {
    this.translationResults.splice(index, 1);
    this.message.info('Đã xóa thẻ');
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Proceed to create actual cards
  proceedToCreate(): void {
    const selectedCards = this.translationResults.filter(r => r.selected && !r.hasError);
    
    if (selectedCards.length === 0) {
      this.message.warning('Vui lòng chọn ít nhất một thẻ hợp lệ!');
      return;
    }

    this.isLoading = true;

    const cardsData = selectedCards.map(card => ({
      frontText: card.frontText,
      backText: card.backText
    }));

    this.cardService.createCardsFromTranslations(this.deck.id, cardsData).subscribe({
      next: (response) => {
        this.creationResults = response;
        
        setTimeout(() => {
          this.isLoading = false;
          this.currentStep = 3; // Go to final results
          this.cdr.detectChanges();
          
          if (response.successCount > 0) {
            this.message.success(`Đã tạo thành công ${response.successCount} thẻ!`);
          }
        }, 0);
      },
      error: (error) => {
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error creating cards:', error);
          this.message.error('Không thể tạo thẻ. Vui lòng thử lại!');
        }, 0);
      }
    });
  }

  goBackStep(): void {
    if (this.currentStep > 0) {
      setTimeout(() => {
        this.currentStep = this.currentStep - 1;
        this.cdr.detectChanges();
      }, 0);
    }
  }

  nextStep(): void {
    if (this.currentStep === 0) {
      this.validateAndProceed(); // Gọi method validation đúng
    } else if (this.currentStep === 1) {
      this.createCards();
    } else if (this.currentStep === 2) {
      this.proceedToCreate();
    }
  }

  previousStep(): void {
    this.goBackStep();
  }

  finish(): void {
    // Trả về kết quả với successCount để component cha có thể reload
    let result;
    
    if (this.creationResults && this.creationResults.successCount > 0) {
      // Có kết quả tạo thẻ thành công
      result = this.creationResults;
    } else {
      // Fallback: tính số thẻ được chọn và hợp lệ
      const successCount = this.translationResults ? 
        this.translationResults.filter(r => r.selected && !r.hasError).length : 0;
      
      result = {
        successCount: successCount,
        totalRequested: this.parsedWords.length,
        failureCount: 0,
        createdCards: []
      };
    }
    
    console.log('Modal closing with result:', result); // Debug log
    this.modal.close(result);
  }

  onCancel(): void {
    this.modal.close();
  }

  // Getters for form validation - Tiếng Việt
  get wordsListErrorTip(): string {
    const control = this.bulkForm.get('wordsList');
    if (control?.hasError('required')) {
      return 'Vui lòng nhập danh sách từ vựng!';
    }
    if (control?.hasError('minlength')) {
      return 'Vui lòng nhập ít nhất 2 từ!';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bulkForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getWordCount(): number {
    if (this.parsedWords.length > 0) {
      return this.parsedWords.length;
    }
    
    const wordsText = this.bulkForm.get('wordsList')?.value || '';
    const words = wordsText.split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0);
    
    return words.length;
  }


  getSourceLanguageLabel(): string {
    const sourceValue = this.bulkForm.get('sourceLanguage')?.value;
    const option = this.languageOptions.find(opt => opt.value === sourceValue);
    return option?.label || 'Không xác định';
  }

  getTargetLanguageLabel(): string {
    const targetValue = this.bulkForm.get('targetLanguage')?.value;
    const option = this.languageOptions.find(opt => opt.value === targetValue);
    return option?.label || 'Không xác định';
  }
}
