import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-icon-container" [ngStyle]="iconStyles">
      <div class="card-back"></div>
      <div class="card-front"></div>
    </div>
  `,
  styleUrls: ['./card-icon.component.scss']
})
export class CardIconComponent {
  @Input() color: string = '#2d4a66';
  @Input() size: string = '24px';

  get iconStyles() {
    return {
      '--card-color': this.color,
      '--card-size': this.size,
      'width': this.size,
      'height': this.size
    };
  }
}