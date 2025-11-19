import { Component, Inject, OnInit } from '@angular/core';
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

import { DeckService } from '../../services/deck.service';
import { DeckDTO, UpdateDeckRequest } from '../../interfaces/deck.dto';

@Component({
  selector: 'app-edit-deck-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzIconModule,
    NzSelectModule
  ],
  templateUrl: './edit-deck-modal.component.html',
  styleUrls: ['./edit-deck-modal.component.css']
})
export class EditDeckModalComponent implements OnInit {
  editForm!: FormGroup;
  isLoading = false;
  deck: DeckDTO;

  // Language options for the select
  languageOptions = [
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
    private deckService: DeckService,
    private message: NzMessageService,
    @Inject(NZ_MODAL_DATA) public data: { deck: DeckDTO }
  ) {
    this.deck = data.deck;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      name: [this.deck.name, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [this.deck.description, [Validators.maxLength(500)]],
      language: [this.deck.language || 'en', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      
      const updateData: UpdateDeckRequest = {
        name: this.editForm.get('name')?.value?.trim(),
        description: this.editForm.get('description')?.value?.trim(),
        language: this.editForm.get('language')?.value
      };

      this.deckService.updateDeck(this.deck.id.toString(), updateData).subscribe({
        next: (updatedDeck) => {
          this.isLoading = false;
          this.message.success('Đã cập nhật thông tin bộ thẻ thành công!');
          this.modal.close(updatedDeck); // Trả về deck đã cập nhật
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Lỗi khi cập nhật deck:', error);
          this.message.error('Không thể cập nhật thông tin bộ thẻ. Vui lòng thử lại!');
        }
      });
    } else {
      // Đánh dấu tất cả field là dirty để hiển thị lỗi
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        control?.markAsDirty();
        control?.updateValueAndValidity();
      });
    }
  }

  onCancel(): void {
    this.modal.close();
  }

  // Getter methods for form validation
  get nameErrorTip(): string {
    const nameControl = this.editForm.get('name');
    if (nameControl?.hasError('required')) {
      return 'Vui lòng nhập tên bộ thẻ!';
    }
    if (nameControl?.hasError('minlength')) {
      return 'Tên bộ thẻ phải có ít nhất 3 ký tự!';
    }
    if (nameControl?.hasError('maxlength')) {
      return 'Tên bộ thẻ không được vượt quá 100 ký tự!';
    }
    return '';
  }

  get descriptionErrorTip(): string {
    const descControl = this.editForm.get('description');
    if (descControl?.hasError('maxlength')) {
      return 'Mô tả không được vượt quá 500 ký tự!';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
