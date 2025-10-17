import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CardService } from '../../services/card.service';
import { CardDTO, CreateCardRequest } from '../../interfaces/card.dto';

interface ModalData {
  deckId: number;
  card?: CardDTO;
}

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.css']
})
export class CardModalComponent implements OnInit {
  readonly modalData: ModalData = inject(NZ_MODAL_DATA);
  deckId!: number;
  card?: CardDTO;
  
  cardForm!: FormGroup;
  isConfirmLoading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private cardService: CardService,
    private modalRef: NzModalRef,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Lấy data từ modal
    this.deckId = this.modalData.deckId;
    this.card = this.modalData.card;
    this.isEditMode = !!this.card;
    this.initializeForm();
  }

  private initializeForm(): void {
    this.cardForm = this.fb.group({
      frontText: [
        this.card?.frontText || '', 
        [Validators.required, Validators.minLength(1), Validators.maxLength(500)]
      ],
      backText: [
        this.card?.backText || '', 
        [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]
      ]
    });
  }

  /**
   * Xử lý khi người dùng nhấn OK
   */
  handleOk(): void {
    if (!this.cardForm.valid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isConfirmLoading = true;
    const formData: CreateCardRequest = this.cardForm.value;
    
    if (this.isEditMode && this.card) {
      // Update existing card
      this.cardService.updateCard(this.deckId, this.card.id, formData).subscribe({
        next: (response) => {
          this.message.success('Cập nhật thẻ thành công!');
          this.modalRef.close(response);
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật thẻ:', error);
          this.message.error('Có lỗi xảy ra khi cập nhật thẻ. Vui lòng thử lại!');
          this.isConfirmLoading = false;
        }
      });
    } else {
      // Create new card
      this.cardService.createCard(this.deckId, formData).subscribe({
        next: (response) => {
          this.message.success('Thêm thẻ mới thành công!');
          this.modalRef.close(response);
        },
        error: (error) => {
          console.error('Lỗi khi tạo thẻ:', error);
          this.message.error('Có lỗi xảy ra khi tạo thẻ. Vui lòng thử lại!');
          this.isConfirmLoading = false;
        }
      });
    }
  }

  /**
   * Xử lý khi người dùng nhấn Cancel
   */
  handleCancel(): void {
    this.modalRef.close();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.cardForm.controls).forEach(key => {
      this.cardForm.get(key)?.markAsTouched();
    });
  }
}


