# User Onboarding Flow - Word Quest

## 📋 Checklist Implementation

### Phase 1: Setup Dependencies
- [ ] Install driver.js: `npm install driver.js`
- [ ] Create onboarding service
- [ ] Add onboarding state management

### Phase 2: First-Time User Detection
- [ ] Check localStorage: `hasCompletedOnboarding`
- [ ] Check user profile: `onboardingCompleted` field
- [ ] Trigger tour on first dashboard visit

### Phase 3: Tour Steps Design

#### Step 1: Welcome Modal (Không dùng spotlight)
```
┌────────────────────────────────────────┐
│   🎉 Chào mừng đến Word Quest!        │
│                                         │
│   Hãy để tôi hướng dẫn bạn cách        │
│   chinh phục từ vựng hiệu quả nhất     │
│   trong 2 phút!                         │
│                                         │
│   [ Bắt đầu Tour ]  [ Bỏ qua ]        │
└────────────────────────────────────────┘
```

#### Step 2: Highlight Stats Cards
```
Target: .quick-stats
Message: "Đây là nơi theo dõi tiến độ học tập của bạn:
         📚 Số bộ thẻ đã chinh phục
         🔥 Chuỗi ngày học liên tiếp
         📖 Tổng từ đã học"
```

#### Step 3: Highlight "Thẻ cần ôn hôm nay"
```
Target: .review-today
Message: "⭐ Chú ý số này! Đây là số thẻ bạn cần ôn tập
         hôm nay theo hệ thống lặp lại ngắt quãng (SRS).
         Ôn đúng lúc = Nhớ lâu!"
```

#### Step 4: Highlight "Tạo bộ thẻ mới" button
```
Target: .create-deck-btn
Message: "🎯 Bước đầu tiên: Hãy tạo bộ thẻ đầu tiên!
         
         💡 Mẹo: Bắt đầu với một chủ đề bạn đang học
         (ví dụ: IELTS Environment, Business Email, ...)"
         
Action: Click để mở modal tạo deck
```

#### Step 5: Explain Deck Card Structure
```
Target: .deck-item (first one)
Message: "Mỗi bộ thẻ có 2 trạng thái:
         
         ✅ Đã chinh phục - Đã hoàn thành 4 bước học
         🚀 Sẵn sàng học - Chờ bạn bắt đầu chinh phục
         
         Cần tối thiểu 5-10 thẻ để bắt đầu!"
```

#### Step 6: Explain 4-Step Conquest Process
```
Target: (Overlay modal in center)
Message: "🎓 Quy trình Chinh phục Bộ thẻ gồm 4 bước:
         
         1️⃣ GẶP GỠ & LÀM QUEN
            👀 Xem qua tất cả flashcard
         
         2️⃣ CỦNG CỐ NHẬN DIỆN  
            📝 Làm quiz trắc nghiệm về nghĩa
         
         3️⃣ THẨM THẤU QUA ÂM THANH
            🎧 Luyện nghe và nhận diện từ
         
         4️⃣ THỬ THÁCH KÍCH HOẠT
            🚀 AI tạo tình huống, bạn dùng từ vừa học
         
         Hoàn thành cả 4 bước = Chinh phục thành công!"
```

#### Step 7: Explain Study Streak
```
Target: .streak-card
Message: "🔥 Chuỗi ngày học liên tiếp
         
         Học mỗi ngày để duy trì ngọn lửa!
         Chuỗi càng dài, bạn càng được thưởng huy hiệu đặc biệt"
```

#### Step 8: Explain Challenges
```
Target: .challenges-card
Message: "⚔️ Thách đấu với bạn bè
         
         Tạo quiz từ bộ thẻ của bạn và gửi cho bạn bè.
         Ai đúng nhiều hơn + nhanh hơn = Thắng!"
```

#### Step 9: Final CTA
```
Target: (Center modal)
Message: "🎉 Tuyệt vời! Bạn đã sẵn sàng!
         
         Hãy bắt đầu bằng cách:
         1. Tạo bộ thẻ đầu tiên (3-5 phút)
         2. Thêm 5-10 thẻ từ vựng (AI sẽ giúp bạn!)
         3. Bắt đầu chinh phục 🚀
         
         [ Tạo bộ thẻ ngay! ]  [ Khám phá thêm ]"
```

### Phase 4: Contextual Hints (Gợi ý trong ngữ cảnh)

#### Empty State trong My Decks
```
┌────────────────────────────────────┐
│   📚 Chưa có bộ thẻ nào            │
│                                     │
│   Tạo bộ thẻ đầu tiên để bắt đầu  │
│   hành trình chinh phục từ vựng!   │
│                                     │
│   [+] Tạo bộ thẻ đầu tiên         │
└────────────────────────────────────┘
```

#### Empty State trong Deck Detail (khi chưa có thẻ)
```
┌────────────────────────────────────┐
│   ✨ Bộ thẻ còn trống              │
│                                     │
│   Hãy thêm ít nhất 5 thẻ để       │
│   bắt đầu chinh phục!              │
│                                     │
│   💡 Mẹo: Chỉ cần gõ từ vựng,     │
│   AI sẽ tự động điền phần còn lại │
│                                     │
│   [+] Thêm thẻ đầu tiên           │
└────────────────────────────────────┘
```

#### Progress Nudge (khi đã có 1-4 thẻ)
```
┌────────────────────────────────────┐
│   🎯 Tiến độ: 4/5 thẻ              │
│   ████████░░ 80%                   │
│                                     │
│   Thêm 1 thẻ nữa là bạn có thể     │
│   bắt đầu chinh phục rồi! 🚀       │
└────────────────────────────────────┘
```

#### Ready to Conquer (khi đã có đủ 5+ thẻ)
```
┌────────────────────────────────────┐
│   ✅ Bộ thẻ đã sẵn sàng!           │
│                                     │
│   Bạn đã có 8 thẻ. Đã đến lúc     │
│   chinh phục chúng!                 │
│                                     │
│   [ Bắt đầu Chinh phục ] →        │
└────────────────────────────────────┘
```

### Phase 5: Progressive Disclosure (Tiết lộ dần dần)

#### First Conquest Completion
```
After user completes 4 steps:

┌────────────────────────────────────┐
│   🎉 Chúc mừng!                    │
│                                     │
│   Bạn đã chinh phục bộ thẻ đầu tiên! │
│                                     │
│   🏆 Huy hiệu mới: "First Conqueror" │
│                                     │
│   💡 Từ giờ, các thẻ này sẽ xuất   │
│   hiện trong "Ôn tập hàng ngày"    │
│   theo lịch thông minh              │
│                                     │
│   [ Tuyệt vời! ]                   │
└────────────────────────────────────┘
```

#### First Daily Review
```
First time seeing "Thẻ cần ôn hôm nay > 0":

┌────────────────────────────────────┐
│   ⏰ Đã đến giờ ôn tập!            │
│                                     │
│   Hệ thống đã lên lịch 7 thẻ cần   │
│   ôn tập hôm nay.                   │
│                                     │
│   Ôn đúng lúc = Nhớ lâu dài! 🧠    │
│                                     │
│   [ Bắt đầu Ôn tập ]              │
└────────────────────────────────────┘
```

### Phase 6: Tooltips for Advanced Features

- Hover "Study Streak": "Học mỗi ngày để duy trì chuỗi và nhận huy hiệu!"
- Hover "Challenge button": "Thách đấu bạn bè để học vui hơn!"
- Hover "Mnemonic Lab": "Xem và chia sẻ mẹo ghi nhớ từ cộng đồng"

---

## 🎨 Design Principles

1. **Non-intrusive**: User có thể bỏ qua bất cứ lúc nào
2. **Contextual**: Hiện đúng lúc, đúng chỗ
3. **Visual**: Dùng icon, emoji, màu sắc để dễ hiểu
4. **Progressive**: Không đổ hết thông tin cùng lúc
5. **Actionable**: Mỗi step đều có CTA rõ ràng

---

## 📊 Success Metrics

- % users hoàn thành tour
- % users tạo deck sau tour
- % users thêm 5+ cards vào deck
- % users hoàn thành first conquest
- Time to first conquest

---

## 🔧 Technical Stack

- **driver.js** - Product tour library
- **localStorage** - Track onboarding state
- **Backend API** - Save onboarding progress
- **Angular Service** - OnboardingService
- **RxJS** - Handle tour flow

---

## 📝 Notes

- Tour có thể replay từ Settings
- A/B test different tour flows
- Collect feedback sau tour
- Localization ready (EN/VI)
