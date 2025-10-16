import { Injectable } from '@angular/core';
import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private driverObj: any;
  private readonly ONBOARDING_KEY = 'hasCompletedOnboarding';

  constructor() {
    this.initializeDriver();
  }

  /**
   * Khởi tạo driver với config
   */
  private initializeDriver(): void {
    const config: Config = {
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Tiếp theo →',
      prevBtnText: '← Quay lại',
      doneBtnText: 'Hoàn thành! 🎉',
      progressText: '{{current}} / {{total}}',
      popoverClass: 'wordquest-onboarding-popover',
      animate: true,
      allowClose: true,
      onDestroyed: () => {
        this.markOnboardingComplete();
      }
    };

    this.driverObj = driver(config);
  }

  /**
   * Kiểm tra xem user đã hoàn thành onboarding chưa
   */
  hasCompletedOnboarding(): boolean {
    return localStorage.getItem(this.ONBOARDING_KEY) === 'true';
  }

  /**
   * Đánh dấu đã hoàn thành onboarding
   */
  markOnboardingComplete(): void {
    localStorage.setItem(this.ONBOARDING_KEY, 'true');
  }

  /**
   * Reset onboarding (cho phép xem lại)
   */
  resetOnboarding(): void {
    localStorage.removeItem(this.ONBOARDING_KEY);
  }

  /**
   * Bắt đầu dashboard onboarding tour
   */
  startDashboardTour(): void {
    const steps: DriveStep[] = [
      // Step 1: Welcome
      {
        popover: {
          title: '🎉 Chào mừng đến Word Quest!',
          description: `
            <div class="onboarding-welcome">
              <p>Hãy để tôi hướng dẫn bạn cách chinh phục từ vựng hiệu quả nhất trong <strong>2 phút</strong>!</p>
              <div class="welcome-features">
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <span>Học theo phương pháp 4 bước</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🤖</span>
                  <span>AI hỗ trợ tạo thẻ tự động</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <span>Hệ thống ôn tập thông minh</span>
                </div>
              </div>
            </div>
          `,
        }
      },

      // Step 2: Stats Overview
      {
        element: '.quick-stats',
        popover: {
          title: '📊 Theo dõi Tiến độ',
          description: `
            <p>Đây là nơi bạn theo dõi thành tích của mình:</p>
            <ul class="onboarding-list">
              <li><strong>Bộ thẻ đã chinh phục:</strong> Số bộ thẻ bạn đã hoàn thành</li>
              <li><strong>Chuỗi ngày học:</strong> Số ngày học liên tiếp (càng cao càng tốt! 🔥)</li>
              <li><strong>Tổng từ đã học:</strong> Tổng số từ vựng bạn đã thêm vào</li>
              <li><strong>Thẻ cần ôn hôm nay:</strong> Số thẻ cần ôn tập theo lịch</li>
            </ul>
          `,
          side: 'bottom',
          align: 'center'
        }
      },

      // Step 3: Review Today - Important!
      {
        element: '.review-today',
        popover: {
          title: '⭐ Thẻ cần Ôn tập Hôm nay',
          description: `
            <p><strong>Đây là con số quan trọng nhất!</strong></p>
            <p>Hệ thống sử dụng thuật toán <strong>Lặp lại Ngắt quãng (SRS)</strong> để tính toán thời điểm ôn tập tối ưu.</p>
            <div class="tip-box">
              <span class="tip-icon">💡</span>
              <span><strong>Mẹo:</strong> Ôn đúng lúc = Nhớ lâu dài!</span>
            </div>
          `,
          side: 'bottom',
          align: 'start'
        }
      },

      // Step 4: Create Deck Button
      {
        element: '.create-deck-btn',
        popover: {
          title: '🎯 Bước Đầu Tiên: Tạo Bộ thẻ',
          description: `
            <p>Hãy bắt đầu bằng cách tạo bộ thẻ đầu tiên!</p>
            <div class="tip-box success">
              <span class="tip-icon">💡</span>
              <div>
                <strong>Gợi ý chủ đề:</strong>
                <ul class="topic-suggestions">
                  <li>IELTS Speaking - Environment</li>
                  <li>Business Email Phrases</li>
                  <li>Travel Essential Vocabulary</li>
                  <li>Hoặc bất kỳ chủ đề nào bạn muốn!</li>
                </ul>
              </div>
            </div>
          `,
          side: 'left',
          align: 'start'
        }
      },

      // Step 5: Deck Structure
      {
        element: '.deck-item',
        popover: {
          title: '📚 Cấu trúc Bộ thẻ',
          description: `
            <p>Mỗi bộ thẻ có <strong>2 trạng thái</strong>:</p>
            <div class="status-cards">
              <div class="status-card ready">
                <span class="status-icon">🚀</span>
                <div>
                  <strong>Sẵn sàng học</strong>
                  <p>Đã có đủ 5-10 thẻ, chờ bạn chinh phục</p>
                </div>
              </div>
              <div class="status-card conquered">
                <span class="status-icon">✅</span>
                <div>
                  <strong>Đã chinh phục</strong>
                  <p>Đã hoàn thành 4 bước học</p>
                </div>
              </div>
            </div>
          `,
          side: 'right',
          align: 'start'
        }
      },

      // Step 6: 4-Step Conquest Process
      {
        popover: {
          title: '🎓 Quy trình Chinh phục 4 Bước',
          description: `
            <div class="conquest-steps">
              <div class="conquest-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <strong>👀 GẶP GỠ & LÀM QUEN</strong>
                  <p>Xem qua tất cả flashcard để làm quen</p>
                </div>
              </div>
              <div class="conquest-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <strong>📝 CỦNG CỐ NHẬN DIỆN</strong>
                  <p>Làm quiz trắc nghiệm về nghĩa của từ</p>
                </div>
              </div>
              <div class="conquest-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <strong>🎧 THẨM THẤU QUA ÂM THANH</strong>
                  <p>Luyện nghe và nhận diện phát âm</p>
                </div>
              </div>
              <div class="conquest-step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <strong>🚀 THỬ THÁCH KÍCH HOẠT</strong>
                  <p>AI tạo tình huống, bạn dùng từ vừa học</p>
                </div>
              </div>
            </div>
            <div class="tip-box success">
              <span class="tip-icon">🎯</span>
              <span>Hoàn thành cả 4 bước = <strong>Chinh phục thành công!</strong></span>
            </div>
          `,
        }
      },

      // Step 7: Study Streak
      {
        element: '.streak-card',
        popover: {
          title: '🔥 Chuỗi Ngày Học Liên tiếp',
          description: `
            <p>Học mỗi ngày để duy trì ngọn lửa!</p>
            <div class="streak-benefits">
              <p><strong>Lợi ích của chuỗi ngày học:</strong></p>
              <ul>
                <li>🏆 Nhận huy hiệu đặc biệt</li>
                <li>⭐ Tăng điểm kinh nghiệm</li>
                <li>💪 Xây dựng thói quen học tập</li>
                <li>🎯 Đạt mục tiêu nhanh hơn</li>
              </ul>
            </div>
          `,
          side: 'left',
          align: 'start'
        }
      },

      // Step 8: Challenges
      {
        element: '.challenges-card',
        popover: {
          title: '⚔️ Thách đấu với Bạn bè',
          description: `
            <p>Học cùng bạn bè vui hơn rất nhiều!</p>
            <div class="challenge-flow">
              <div class="flow-step">
                <span class="flow-number">1</span>
                <span>Chọn bộ thẻ</span>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <span class="flow-number">2</span>
                <span>Chọn bạn bè</span>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <span class="flow-number">3</span>
                <span>Làm quiz trước</span>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <span class="flow-number">4</span>
                <span>Gửi thách đấu</span>
              </div>
            </div>
            <p class="challenge-note">Ai đúng nhiều hơn + nhanh hơn = Thắng! 🏆</p>
          `,
          side: 'left',
          align: 'start'
        }
      },

      // Step 9: Final CTA
      {
        popover: {
          title: '🎉 Bạn đã sẵn sàng!',
          description: `
            <div class="final-cta">
              <p class="cta-message">Tuyệt vời! Bạn đã nắm được cách sử dụng Word Quest.</p>
              
              <div class="next-steps">
                <h4>🎯 Các bước tiếp theo:</h4>
                <ol class="steps-list">
                  <li>Tạo bộ thẻ đầu tiên (3-5 phút)</li>
                  <li>Thêm 5-10 thẻ từ vựng (AI sẽ giúp!)</li>
                  <li>Bắt đầu chinh phục 🚀</li>
                </ol>
              </div>

              <div class="encouragement">
                <p><strong>Hãy bắt đầu ngay để trải nghiệm sức mạnh của phương pháp học này!</strong></p>
              </div>
            </div>
          `,
        }
      }
    ];

    this.driverObj.setSteps(steps);
    this.driverObj.drive();
  }

  /**
   * Highlight một element cụ thể (dùng cho contextual hints)
   */
  highlightElement(element: string, message: string): void {
    this.driverObj.highlight({
      element,
      popover: {
        description: message,
      }
    });
  }

  /**
   * Destroy driver instance
   */
  destroy(): void {
    if (this.driverObj) {
      this.driverObj.destroy();
    }
  }
}
