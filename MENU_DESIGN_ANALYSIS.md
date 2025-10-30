# THIẾT KẾ MENU MỚI CHO SMART FLASHCARD - THEO KẾ HOẠCH ĐỒ ÁN

## 🎯 **TỔNG QUAN THIẾT KẾ**

Dựa trên phân tích kế hoạch đồ án và yêu cầu của bạn, tôi đã thiết kế lại hệ thống menu để phù hợp với các Use Case đã được định nghĩa trong tài liệu kỹ thuật.

---

## 📋 **CÁC CHỨC NĂNG MENU MỚI - THEO USE CASE**

### 1. **🏠 Bảng điều khiển** 
- **Route**: `/app/dashboard`
- **Icon**: `dashboard`
- **Mô tả**: Xem tổng quan tiến độ học tập và thống kê cá nhân

**🎯 Tại sao cần thiết?**
- Đây là "trung tâm chỉ huy" của ứng dụng
- Hiển thị các metrics quan trọng: chuỗi học liên tiếp, tổng từ đã học, tiến độ hôm nay
- Overview của tất cả các use case khác

**⚡ Khi click vào sẽ:**
- Hiển thị dashboard với các card thống kê
- Danh sách deck và khuyến nghị
- Quick access đến các chức năng chính

---

### 2. **📅 Ôn tập hàng ngày** ⭐ (UC-04 - Core Feature)
- **Route**: `/app/daily-review`
- **Icon**: `calendar`
- **Mô tả**: Ôn tập thẻ đã đến hạn theo thuật toán SM-2
- **Badge động**: Hiển thị số thẻ cần ôn tập

**🎯 Tại sao là chức năng QUAN TRỌNG NHẤT?**
- **UC-04: Ôn tập Hàng ngày (SRS)** - Core feature của ứng dụng
- Thuật toán SM-2 tính toán chính xác thẻ nào cần ôn hôm nay
- Việc ôn tập đều đặn là chìa khóa của việc ghi nhớ lâu dài

**⚡ Khi click vào sẽ:**
- Load danh sách thẻ đã đến hạn ôn tập (nextReviewDate <= hôm nay)
- Bắt đầu session ôn tập với giao diện flashcard
- User đánh giá độ khó (quality 0-5), hệ thống cập nhật SM-2
- Theo dõi tiến độ session và thống kê

---

### 3. **📚 Thư viện thẻ** (UC-02: Quản lý Bộ thẻ)
- **Route**: `/app/deck-library`
- **Icon**: `book`
- **Mô tả**: Quản lý và tạo mới các bộ thẻ học tập

**🎯 Tại sao cần thiết?**
- **UC-02.1: Tạo Bộ thẻ**
- **UC-02.2: Tạo Thẻ (Thủ công)**
- **UC-02.3: Gợi ý nội dung AI**
- **UC-03: Chinh phục Bộ thẻ mới** (4 bước học)

**⚡ Khi click vào sẽ:**
- Hiển thị grid/list các deck hiện có
- Button "Tạo deck mới" và "Tạo thẻ mới"
- Access vào deck detail để chỉnh sửa cards
- Tính năng AI gợi ý nội dung thẻ

---

### 4. **� Cộng đồng** (UC-06, UC-07: Tương tác Cộng đồng)
- **Route**: `/app/community`
- **Icon**: `team`
- **Mô tả**: Tương tác, chia sẻ và thách đấu với cộng đồng

**🎯 Tại sao cần thiết?**
- **UC-06.1: Mời bạn học chung**
- **UC-06.2: Gửi lời thách đấu** 
- **UC-06.3: Đáp trả thách đấu**
- **UC-07.1: Xem và Bầu chọn Mnemonic**
- **UC-07.2: Đóng góp Mnemonic**
- Tăng động lực học tập thông qua gamification

**⚡ Khi click vào sẽ:**
- Feed cộng đồng với các hoạt động
- Danh sách bạn bè và thành viên
- Tính năng thách đấu (quiz battles)
- Chia sẻ và vote mẹo ghi nhớ (mnemonic)
- Bảng xếp hạng và achievements

---

### 5. **� Thông tin tài khoản** (UC-01: Quản lý Tài khoản)
- **Route**: `/app/profile`
- **Icon**: `user`
- **Mô tả**: Quản lý thông tin cá nhân và cài đặt

**🎯 Tại sao cần thiết?**
- **UC-01.1: Đăng nhập**
- **UC-01.2: Đăng ký**
- Quản lý profile và preferences
- Settings cho notification, themes, etc.

**⚡ Khi click vào sẽ:**
- Form cập nhật thông tin cá nhân
- Đổi mật khẩu và security settings
- Cài đặt notification
- Preferences học tập
- Thống kê cá nhân chi tiết

---

## 🧠 **PHÂN TÍCH DESIGN DECISIONS**

### **Tại sao loại bỏ "Phân tích tiến độ" và "Lịch sử học tập"?**
1. **Theo feedback của bạn**: "phân tích tiến độ tôi nghĩ là cũng không cần, lịch sử học tập cũng thế"
2. **Simplicity**: Tập trung vào core features thay vì overwhelm user
3. **Integration**: Các analytics có thể integrate vào Dashboard và Profile

### **Tại sao thêm "Cộng đồng"?**
1. **Theo yêu cầu**: "tương tác cộng đồng tôi thầy cũng khá hay nên đưa vào"
2. **Use Case Coverage**: UC-06 và UC-07 đều liên quan đến social features
3. **Motivation**: Gamification và social learning tăng retention

### **Tại sao thêm "Thông tin tài khoản"?**
1. **Theo yêu cầu**: "tôi nghĩ là nên có một phần thông tin tài khoản"
2. **User Management**: Essential cho bất kỳ app nào
3. **UC-01 Coverage**: Quản lý tài khoản là fundamental requirement

---

## 📱 **WORKFLOW & USER JOURNEY**

### **Daily Learning Flow:**
1. **Dashboard** → Xem overview và số thẻ cần ôn
2. **Ôn tập hàng ngày** → Complete daily SRS session  
3. **Thư viện thẻ** → Manage content khi cần
4. **Cộng đồng** → Social interaction để motivation
5. **Profile** → Cập nhật settings và xem achievements

### **Content Creation Flow:**
1. **Thư viện thẻ** → Tạo deck mới
2. **AI Assistant** → Gợi ý nội dung thẻ
3. **UC-03 Flow** → Chinh phục deck mới (4 bước)
4. **Share to Community** → Chia sẻ với bạn bè

---

## 🎨 **TECHNICAL IMPLEMENTATION**

### **Menu Structure Update:**
```typescript
menuItems = [
  { title: 'Bảng điều khiển', icon: 'dashboard', route: '/app/dashboard' },
  { title: 'Ôn tập hàng ngày', icon: 'calendar', route: '/app/daily-review', isHighPriority: true, badge: dynamic },
  { title: 'Thư viện thẻ', icon: 'book', route: '/app/deck-library' },
  { title: 'Cộng đồng', icon: 'team', route: '/app/community' },
  { title: 'Thông tin tài khoản', icon: 'user', route: '/app/profile' }
]
```

### **Route Mapping:**
- Aligned với Angular routing structure
- Consistent naming convention
- Proper lazy loading for performance

---

## ✅ **KẾT LUẬN**

Thiết kế menu mới này:

1. **✅ Tuân thủ kế hoạch đồ án**: Cover tất cả Use Cases quan trọng
2. **✅ Theo feedback**: Loại bỏ features không cần, thêm features mong muốn  
3. **✅ User-centric**: Focus vào daily workflow và motivation
4. **✅ Scalable**: Architecture dễ extend thêm features

**Menu này cung cấp perfect balance giữa functionality và simplicity, đảm bảo user có thể access tất cả core features một cách intuitive mà không bị overwhelmed.**