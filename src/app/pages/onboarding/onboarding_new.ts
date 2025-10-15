import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, 
    NzButtonModule,
    NzIconModule,
    NzProgressModule
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss'
})
export class OnboardingComponent implements OnInit {

  // Features data
  features = [
    {
      icon: 'bulb',
      title: 'Học thông minh với AI',
      description: 'AI tự động tạo flashcard, gợi ý hình ảnh và câu ví dụ giúp bạn học nhanh hơn',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: 'rocket',
      title: 'Phương pháp 4 bước',
      description: 'Chinh phục từ vựng qua 4 bước: Xem, Quiz, Nghe và Thử thách thực tế',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: 'thunderbolt',
      title: 'Ôn tập thông minh',
      description: 'Hệ thống SRS giúp bạn ôn đúng lúc, nhớ lâu hơn với ít thời gian hơn',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: 'trophy',
      title: 'Thách đấu bạn bè',
      description: 'Tạo động lực học tập qua các cuộc thi nhỏ với bạn bè',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      icon: 'team',
      title: 'Cộng đồng học tập',
      description: 'Chia sẻ và học hỏi mẹo ghi nhớ từ hàng nghìn người học khác',
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    },
    {
      icon: 'line-chart',
      title: 'Theo dõi tiến độ',
      description: 'Xem biểu đồ chi tiết về quá trình học tập và đạt được các huy hiệu',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  ];

  // Steps data
  steps = [
    {
      title: 'Gặp gỡ & Làm quen',
      description: 'Xem qua các flashcard để làm quen với từ vựng mới',
      emoji: '👀'
    },
    {
      title: 'Củng cố Nhận diện',
      description: 'Làm quiz trắc nghiệm để kiểm tra hiểu biết về nghĩa của từ',
      emoji: '✍️'
    },
    {
      title: 'Thẩm thấu qua Âm thanh',
      description: 'Luyện nghe và phát âm để ghi nhớ từ vựng tự nhiên',
      emoji: '🎧'
    },
    {
      title: 'Thử thách Kích hoạt',
      description: 'Áp dụng từ vựng vào tình huống thực tế để thành thạo',
      emoji: '🎯'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialization logic
  }

  /**
   * Điều hướng đến trang đăng ký
   */
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
}
