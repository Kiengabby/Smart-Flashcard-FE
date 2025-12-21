import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { ChallengeService } from '../../services/challenge.service';
import { DeckService } from '../../services/deck.service';
import { CreateChallengeRequest } from '../../interfaces/challenge.model';

interface User {
  id: number;
  displayName: string;
  email: string;
  avatar?: string;
}

interface Deck {
  id: number;
  name: string;
  description?: string;
  cardCount: number;
  language?: string;
}

@Component({
  selector: 'app-create-challenge-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzSliderModule,
    NzCardModule,
    NzIconModule,
    NzSpinModule,
    NzAvatarModule,
    NzTagModule,
    NzEmptyModule,
    NzStepsModule
  ],
  templateUrl: './create-challenge-modal.component.html',
  styleUrls: ['./create-challenge-modal.component.scss']
})
export class CreateChallengeModalComponent implements OnInit {
  challengeForm!: FormGroup;
  currentStep = 0;
  isLoading = false;
  isCreating = false;

  // Data
  availableDecks: Deck[] = [];
  friends: User[] = [];
  selectedDeck: Deck | null = null;
  selectedFriend: User | null = null;

  // Configuration options
  difficultyOptions = [
    { label: 'Dễ', value: 'easy', questions: 5, time: 180, color: 'green' },
    { label: 'Trung bình', value: 'medium', questions: 10, time: 300, color: 'orange' },
    { label: 'Khó', value: 'hard', questions: 15, time: 450, color: 'red' },
    { label: 'Tùy chỉnh', value: 'custom', questions: 10, time: 300, color: 'blue' }
  ];

  constructor(
    private fb: FormBuilder,
    public modal: NzModalRef,
    private challengeService: ChallengeService,
    private deckService: DeckService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    @Inject(NZ_MODAL_DATA) public data: { 
      preSelectedDeckId?: number;
      preSelectedOpponent?: User;
    }
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    
    // If opponent is pre-selected, set it and move to step 2
    if (this.data?.preSelectedOpponent) {
      this.selectedFriend = this.data.preSelectedOpponent;
      this.challengeForm.patchValue({
        opponentId: this.selectedFriend.id
      });
      this.currentStep = 2; // Skip to configuration step
    }
  }

  private initForm(): void {
    this.challengeForm = this.fb.group({
      deckId: [this.data?.preSelectedDeckId || null, [Validators.required]],
      opponentId: [null, [Validators.required]],
      difficulty: ['medium'],
      totalQuestions: [10, [Validators.required, Validators.min(3), Validators.max(20)]],
      timeLimit: [300, [Validators.required, Validators.min(60), Validators.max(900)]]
    });

    // Watch difficulty changes
    this.challengeForm.get('difficulty')?.valueChanges.subscribe(difficulty => {
      this.updateDifficultySettings(difficulty);
    });

    // Pre-select deck if provided
    if (this.data?.preSelectedDeckId) {
      this.challengeForm.patchValue({ deckId: this.data.preSelectedDeckId });
    }
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    
    try {
      // Load available decks
      const decks = await this.deckService.getDecks().toPromise() || [];
      this.availableDecks = decks.map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        cardCount: deck.cardCount || 0,
        language: deck.language
      }));
      
      // Load mock friends for now (replace with real friend service)
      this.friends = this.getMockFriends();
      
      // Pre-select deck if specified
      if (this.data?.preSelectedDeckId) {
        this.selectedDeck = this.availableDecks.find(d => d.id === this.data.preSelectedDeckId) || null;
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.message.error('Không thể tải dữ liệu');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Mock friends data (replace with real service)
  private getMockFriends(): User[] {
    return [
      { id: 2, displayName: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
      { id: 3, displayName: 'Trần Thị B', email: 'tranthib@email.com' },
      { id: 4, displayName: 'Lê Văn C', email: 'levanc@email.com' },
      { id: 5, displayName: 'Phạm Thị D', email: 'phamthid@email.com' },
      { id: 6, displayName: 'Hoàng Văn E', email: 'hoangvane@email.com' }
    ];
  }

  nextStep(): void {
    if (this.currentStep === 0) {
      // Validate deck selection
      if (!this.challengeForm.get('deckId')?.value) {
        this.message.warning('Vui lòng chọn bộ thẻ!');
        return;
      }
      this.selectedDeck = this.availableDecks.find(d => d.id === this.challengeForm.get('deckId')?.value) || null;
    } else if (this.currentStep === 1) {
      // Validate friend selection
      if (!this.challengeForm.get('opponentId')?.value) {
        this.message.warning('Vui lòng chọn đối thủ!');
        return;
      }
      this.selectedFriend = this.friends.find(f => f.id === this.challengeForm.get('opponentId')?.value) || null;
    }

    if (this.currentStep < 2) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  selectDeck(deck: Deck): void {
    this.challengeForm.patchValue({ deckId: deck.id });
    this.selectedDeck = deck;
  }

  selectFriend(friend: User): void {
    this.challengeForm.patchValue({ opponentId: friend.id });
    this.selectedFriend = friend;
  }

  updateDifficultySettings(difficulty: string): void {
    const config = this.difficultyOptions.find(opt => opt.value === difficulty);
    if (config && difficulty !== 'custom') {
      this.challengeForm.patchValue({
        totalQuestions: config.questions,
        timeLimit: config.time
      });
    }
  }

  async createChallenge(): Promise<void> {
    if (this.challengeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isCreating = true;

    try {
      const request: CreateChallengeRequest = {
        deckId: this.challengeForm.get('deckId')?.value,
        opponentId: this.challengeForm.get('opponentId')?.value,
        totalQuestions: this.challengeForm.get('totalQuestions')?.value,
        timeLimit: this.challengeForm.get('timeLimit')?.value
      };

      const result = await this.challengeService.createChallenge(request).toPromise();
      
      this.message.success(`Đã gửi thách đấu tới ${this.selectedFriend?.displayName}!`);
      
      // Return success result with challenge ID
      this.modal.close({ 
        success: true, 
        challengeId: (result as any)?.data?.id || result?.id,
        challenge: result 
      });
      
    } catch (error) {
      console.error('Error creating challenge:', error);
      this.message.error('Không thể tạo thách đấu. Vui lòng thử lại!');
    } finally {
      this.isCreating = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.challengeForm.controls).forEach(key => {
      this.challengeForm.get(key)?.markAsTouched();
    });
  }

  getDeckDifficultyColor(cardCount: number): string {
    if (cardCount <= 10) return 'green';
    if (cardCount <= 20) return 'orange';
    return 'red';
  }

  getAvatarColor(name: string): string {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onCancel(): void {
    this.modal.close();
  }
}
