import { Routes } from '@angular/router';
import { DailyReviewComponent } from './daily-review.component';

export const dailyReviewRoutes: Routes = [
  {
    path: '',
    component: DailyReviewComponent,
    title: 'Ôn tập hàng ngày'
  }
];