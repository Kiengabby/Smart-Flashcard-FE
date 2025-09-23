import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
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
  createDeckForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.createDeckForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.createDeckForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formData: CreateDeckRequest = this.createDeckForm.value;
    this.modalRef.close(formData);
  }

  onCancel(): void {
    this.modalRef.close(null);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.createDeckForm.controls).forEach(key => {
      this.createDeckForm.get(key)?.markAsTouched();
    });
  }
}
