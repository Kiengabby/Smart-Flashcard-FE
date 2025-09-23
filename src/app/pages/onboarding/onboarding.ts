import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';

interface OnboardingSlide {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-onboarding',
  imports: [
    CommonModule, 
    RouterLink, 
    NzStepsModule, 
    NzButtonModule, 
    NzIconModule, 
    NzCardModule
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss'
})
export class OnboardingComponent implements OnInit {
  currentIndex = 0;
  
  onboardingSlides: OnboardingSlide[] = [
    {
      image: 'https://storage.googleapis.com/unsum-app-images/undraw_education_f8ms.svg',
      title: 'Học Flashcard Thông Minh',
      description: 'Tạo và học các thẻ ghi nhớ với công nghệ AI hiện đại. Tối ưu hóa quá trình ghi nhớ của bạn.'
    },
    {
      image: 'https://storage.googleapis.com/unsum-app-images/undraw_online_learning_re_qw08.svg', 
      title: 'Theo Dõi Tiến Độ',
      description: 'Xem báo cáo chi tiết về quá trình học tập và tiến độ của bạn qua từng ngày.'
    },
    {
      image: 'https://storage.googleapis.com/unsum-app-images/undraw_mobile_learning_re_9ntt.svg',
      title: 'Học Mọi Lúc Mọi Nơi',
      description: 'Đồng bộ dữ liệu trên nhiều thiết bị. Học bất cứ lúc nào, bất cứ đâu bạn muốn.'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialization logic
  }

  /**
   * Bỏ qua onboarding và điều hướng trực tiếp đến trang đăng ký
   */
  skipOnboarding(): void {
    this.navigateToRegister();
  }

  /**
   * Điều hướng đến step tiếp theo
   */
  goToNextStep(): void {
    if (this.currentIndex < this.onboardingSlides.length - 1) {
      this.currentIndex++;
    }
  }

  /**
   * Quay lại step trước đó
   */
  goToPreviousStep(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  /**
   * Điều hướng đến trang đăng ký
   */
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Điều hướng đến trang đăng nhập
   */
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Chuyển đến slide cụ thể khi nhấn vào dot
   */
  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  /**
   * Kiểm tra xem có phải slide cuối cùng không
   */
  get isLastSlide(): boolean {
    return this.currentIndex === this.onboardingSlides.length - 1;
  }

  /**
   * Lấy slide hiện tại
   */
  get currentSlide(): OnboardingSlide {
    return this.onboardingSlides[this.currentIndex];
  }
}
