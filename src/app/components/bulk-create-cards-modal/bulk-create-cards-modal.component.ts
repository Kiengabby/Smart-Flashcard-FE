import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

import { CardService } from '../../services/card.service';
import { DeckDTO } from '../../interfaces/deck.dto';

interface BulkCreateRequest {
  words: string[];
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  autoDetectLanguage: boolean;
}

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

@Component({
  selector: 'app-bulk-create-cards-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzSelectModule,
    NzStepsModule,
    NzAlertModule,
    NzTagModule,
    NzDividerModule
  ],
  templateUrl: './bulk-create-cards-modal.component.html',
  styleUrls: ['./bulk-create-cards-modal.component.css']
})
export class BulkCreateCardsModalComponent implements OnInit {
  bulkForm!: FormGroup;
  isLoading = false;
  currentStep = 0;
  deck: DeckDTO;
  
  // Preview data
  parsedWords: string[] = [];
  previewResults: BulkCreateResponse | null = null;

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
    private modal: NzModalRef,
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

  parseWords(): void {
    const wordsText = this.bulkForm.get('wordsList')?.value || '';
    this.parsedWords = wordsText
      .split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0);
    
    if (this.parsedWords.length === 0) {
      this.message.warning('Vui lòng nhập ít nhất một từ!');
      return;
    }
    
    if (this.parsedWords.length > 50) {
      this.message.warning('Tối đa 50 từ trong một lần tạo!');
      return;
    }

    setTimeout(() => {
      this.currentStep = 1;
      this.cdr.detectChanges();
    }, 0);
  }

  goBackToInput(): void {
    setTimeout(() => {
      this.currentStep = 0;
      this.cdr.detectChanges();
    }, 0);
  }

  createCards(): void {
    if (this.parsedWords.length === 0) {
      this.message.warning('Không có từ nào để tạo!');
      return;
    }

    this.isLoading = true;
    
    const request: BulkCreateRequest = {
      words: this.parsedWords,
      sourceLanguage: this.bulkForm.get('sourceLanguage')?.value,
      targetLanguage: this.bulkForm.get('targetLanguage')?.value,
      context: this.bulkForm.get('context')?.value?.trim(),
      autoDetectLanguage: this.bulkForm.get('sourceLanguage')?.value === 'auto'
    };

    this.cardService.bulkCreateCards(this.deck.id, request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.previewResults = response;
        
        setTimeout(() => {
          this.currentStep = 2;
          this.cdr.detectChanges();
          
          if (response.successCount > 0) {
            this.message.success(`Đã tạo thành công ${response.successCount} thẻ!`);
          }
          
          if (response.failureCount > 0) {
            this.message.warning(`${response.failureCount} từ không thể tạo thẻ.`);
          }
        }, 0);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating cards:', error);
        this.message.error('Không thể tạo thẻ. Vui lòng thử lại!');
      }
    });
  }

  finish(): void {
    this.modal.close(this.previewResults);
  }

  onCancel(): void {
    this.modal.close();
  }

  // Getters for form validation
  get wordsListErrorTip(): string {
    const control = this.bulkForm.get('wordsList');
    if (control?.hasError('required')) {
      return 'Vui lòng nhập danh sách từ!';
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
