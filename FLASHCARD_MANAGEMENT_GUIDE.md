# 📚 Hướng dẫn Test Flashcard Management

## ✅ Tính năng đã hoàn thiện

### 1. **Card Management (CRUD)**
- ✅ Thêm flashcard mới vào deck
- ✅ Chỉnh sửa flashcard
- ✅ Xóa flashcard
- ✅ Xem danh sách flashcard trong deck

### 2. **Deck Detail Page**
- ✅ Xem thông tin chi tiết deck
- ✅ Hiển thị danh sách cards
- ✅ Empty state khi chưa có card
- ✅ Progress hints (0-4 cards, 5+ cards)
- ✅ Navigate từ Dashboard

### 3. **Auth Guard**
- ✅ Bảo vệ routes yêu cầu đăng nhập
- ✅ Redirect về login nếu chưa đăng nhập

### 4. **Integration với Backend**
- ✅ Card API: `/api/decks/{deckId}/cards`
- ✅ Deck API: `/api/decks/`

---

## 🧪 Hướng dẫn Test

### Bước 1: Khởi động Backend
```bash
cd D:\DATN\Smart-Flashcard-BE
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### Bước 2: Khởi động Frontend
```bash
cd D:\DATN\Smart-Flashcard-FE
npm start
```

Frontend sẽ chạy tại: `http://localhost:4200`

---

## 📋 Test Cases

### Test Case 1: Đăng nhập
1. Truy cập `http://localhost:4200`
2. Nhấn "Bắt đầu" hoặc navigate đến `/auth/login`
3. Đăng nhập bằng tài khoản đã có
4. **Expected**: Redirect về Dashboard sau khi đăng nhập thành công

### Test Case 2: Tạo Deck mới
1. Ở Dashboard, nhấn nút **"Tạo bộ thẻ mới"**
2. Điền thông tin:
   - Tên: "Test Deck"
   - Mô tả: "Đây là bộ thẻ test"
3. Nhấn **"Thêm bộ thẻ"**
4. **Expected**: 
   - Hiển thị toast "Tạo bộ thẻ thành công!"
   - Deck mới xuất hiện trong danh sách

### Test Case 3: Xem chi tiết Deck (Deck Detail Page)
1. Ở Dashboard, click vào một deck card
2. **Expected**: 
   - Navigate đến `/app/deck/{id}`
   - Hiển thị thông tin deck (tên, mô tả, số lượng thẻ)
   - Hiển thị danh sách cards (hoặc empty state nếu chưa có)
   - Có nút "Thêm thẻ mới"

### Test Case 4: Thêm Card mới
1. Ở Deck Detail page, nhấn **"Thêm thẻ mới"**
2. Modal mở ra, điền thông tin:
   - **Mặt trước**: "What is Angular?"
   - **Mặt sau**: "Angular is a TypeScript-based web application framework"
3. Nhấn **"Thêm thẻ"**
4. **Expected**:
   - Toast "Thêm thẻ mới thành công!"
   - Card mới xuất hiện trong danh sách
   - Số lượng thẻ trong header tăng lên

### Test Case 5: Thêm nhiều Cards
1. Thêm thêm 4 thẻ nữa (tổng cộng 5 thẻ)
2. **Expected**:
   - Sau khi có 5 thẻ, hiển thị hint: "✅ Bộ thẻ đã sẵn sàng!"
   - Nút "Bắt đầu Chinh phục" được enable

### Test Case 6: Chỉnh sửa Card
1. Ở Deck Detail, nhấn icon **Edit** (✏️) trên một card
2. Modal mở ra với thông tin card hiện tại
3. Sửa nội dung mặt trước hoặc mặt sau
4. Nhấn **"Cập nhật"**
5. **Expected**:
   - Toast "Cập nhật thẻ thành công!"
   - Nội dung card được cập nhật

### Test Case 7: Xóa Card
1. Ở Deck Detail, nhấn icon **Delete** (🗑️) trên một card
2. Popup xác nhận xuất hiện
3. Nhấn **OK** để xác nhận xóa
4. **Expected**:
   - Toast "Đã xóa thẻ thành công!"
   - Card biến mất khỏi danh sách
   - Số lượng thẻ giảm đi

### Test Case 8: Empty State
1. Xóa tất cả cards trong một deck
2. **Expected**:
   - Hiển thị empty state với message:
     - "✨ Bộ thẻ còn trống"
     - "Hãy thêm ít nhất 5 thẻ để bắt đầu chinh phục!"
   - Nút "Thêm thẻ đầu tiên"

### Test Case 9: Progress Hints
#### Khi có 1-4 thẻ:
- **Expected**: Hiển thị hint xanh dương
  - "🎯 Tiến độ: X/5 thẻ"
  - "Thêm Y thẻ nữa là bạn có thể bắt đầu chinh phục rồi! 🚀"

#### Khi có 5+ thẻ:
- **Expected**: Hiển thị hint xanh lá
  - "✅ Bộ thẻ đã sẵn sàng!"
  - "Bạn đã có X thẻ. Đã đến lúc chinh phục chúng!"

### Test Case 10: Navigation
1. Ở Deck Detail, nhấn **"Quay lại"**
2. **Expected**: Navigate về Dashboard

### Test Case 11: Auth Guard
1. Đăng xuất (nếu có chức năng)
2. Thử truy cập trực tiếp: `http://localhost:4200/app/dashboard`
3. **Expected**: Redirect về `/auth/login`

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Triệu chứng**: Console hiển thị lỗi CORS
**Giải pháp**: 
- Kiểm tra Backend CORS configuration
- Đảm bảo `http://localhost:4200` được allow

### Issue 2: 401 Unauthorized
**Triệu chứng**: API trả về 401
**Giải pháp**:
- Kiểm tra JWT token có được lưu trong localStorage không
- Đăng nhập lại để refresh token

### Issue 3: Deck API không trả về data
**Triệu chứng**: Dashboard hiển thị empty state mặc dù có data
**Giải pháp**:
- Check network tab xem API có được call không
- Kiểm tra response từ backend
- Đảm bảo endpoint là `/api/decks/` (có trailing slash)

### Issue 4: Modal không hiển thị
**Triệu chứng**: Click "Thêm thẻ mới" nhưng modal không mở
**Giải pháp**:
- Check console có lỗi không
- Đảm bảo NzModalService được inject đúng

---

## 📊 API Endpoints Documentation

### 1. Get Decks
```http
GET /api/decks/
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Test Deck",
    "description": "Deck description",
    "cardCount": 5
  }
]
```

### 2. Get Deck by ID
```http
GET /api/decks/{id}
Authorization: Bearer {token}
```

### 3. Create Deck
```http
POST /api/decks/
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Deck",
  "description": "Description"
}
```

### 4. Get Cards by Deck
```http
GET /api/decks/{deckId}/cards
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "frontText": "Question",
    "backText": "Answer",
    "repetitions": 0,
    "easinessFactor": 2.5,
    "interval": 0,
    "nextReviewDate": null
  }
]
```

### 5. Create Card
```http
POST /api/decks/{deckId}/cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "frontText": "Question",
  "backText": "Answer"
}
```

### 6. Update Card
```http
PUT /api/decks/{deckId}/cards/{cardId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "frontText": "Updated Question",
  "backText": "Updated Answer"
}
```

### 7. Delete Card
```http
DELETE /api/decks/{deckId}/cards/{cardId}
Authorization: Bearer {token}
```

---

## ✨ Features Overview

### Components Created:
1. **CardModalComponent** - Modal thêm/sửa card
2. **DeckDetailComponent** - Trang chi tiết deck

### Services Created:
1. **CardService** - CRUD operations cho cards
2. **DeckService** (updated) - CRUD operations cho decks

### Guards Created:
1. **AuthGuard** - Bảo vệ routes

### Interfaces Created:
1. **CardDTO** - Card data structure
2. **CreateCardRequest** - Create card payload
3. **UpdateCardRequest** - Update card payload

---

## 🎯 Next Steps (Phase 2)

Sau khi test xong Phase 1, chúng ta sẽ tiếp tục:

1. **4-Step Conquest Flow**
   - Step 1: Flashcard viewer
   - Step 2: Quiz multiple choice
   - Step 3: Listening practice
   - Step 4: AI scenario challenge

2. **Review System**
   - Daily review page
   - SRS algorithm integration

3. **Statistics & Charts**
   - Study progress charts
   - Performance analytics

---

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Console log (F12)
2. Network tab để xem API calls
3. Backend logs

**Happy Testing! 🚀**


