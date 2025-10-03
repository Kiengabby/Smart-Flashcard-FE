import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DeckService } from '../../services/deck.service';
import { CreateDeckRequest } from '../../interfaces/deck.dto';

@Component({
  selector: 'app-create-deck-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './create-deck-modal.component.html',
  styleUrls: ['./create-deck-modal.component.css']
})
export class CreateDeckModalComponent implements OnInit {
  deckForm!: FormGroup;
  isConfirmLoading = false;

  constructor(
    private fb: FormBuilder,
    private deckService: DeckService,
    private modalRef: NzModalRef,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.deckForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Xử lý khi người dùng nhấn OK
   */
  handleOk(): void {
    if (!this.deckForm.valid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isConfirmLoading = true;
    const formData: CreateDeckRequest = this.deckForm.value;
    
    this.deckService.createDeck(formData).subscribe({
      next: (response) => {
        this.message.success('Tạo bộ thẻ thành công!');
        this.modalRef.close(true); // Trả về true để báo hiệu thành công
      },
      error: (error) => {
        console.error('Lỗi khi tạo bộ thẻ:', error);
        this.message.error('Có lỗi xảy ra khi tạo bộ thẻ. Vui lòng thử lại!');
        this.isConfirmLoading = false;
      }
    });
  }

  /**
   * Xử lý khi người dùng nhấn Cancel
   */
  handleCancel(): void {
    this.modalRef.close();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.deckForm.controls).forEach(key => {
      this.deckForm.get(key)?.markAsTouched();
    });
  }
}
