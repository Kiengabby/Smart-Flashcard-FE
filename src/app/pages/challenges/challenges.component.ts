import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="challenges-container">
      <h1>Challenges</h1>
      <p>This feature is under development.</p>
    </div>
  `,
  styles: [`
    .challenges-container {
      padding: 20px;
    }
  `]
})
export class ChallengesComponent {}
