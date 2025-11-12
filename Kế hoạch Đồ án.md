# **1.Phân tích yêu cầu**

**1.1 Mô Tả Hiện Trạng và Bài Toán (Problem Statement)**

Trong thời đại hội nhập, việc học ngoại ngữ, đặc biệt là **từ vựng**, đã trở thành một nhu cầu thiết yếu. Tuy nhiên, các phương pháp học từ vựng truyền thống (như ghi chép vào sổ tay, sử dụng flashcard giấy) bộc lộ nhiều nhược điểm lớn:

* **Tốn thời gian và thiếu hiệu quả:** Người học phải tự mình quản lý việc ôn tập một cách thủ công. Điều này dẫn đến việc ôn tập không đúng thời điểm, hoặc ôn quá nhiều từ đã thuộc và bỏ sót những từ sắp quên, gây lãng phí công sức và không tuân theo các nguyên lý khoa học về ghi nhớ.  
* **Tính thụ động cao:** Hầu hết các ứng dụng flashcard hiện tại chỉ tập trung vào việc giúp người học "nhận biết" từ (Passive Vocabulary). Chúng thiếu các cơ chế hiệu quả để thúc đẩy người học "sử dụng" được từ (Active Vocabulary) trong các ngữ cảnh thực tế như viết và nói.  
* **Thiếu động lực và sự gắn kết:** Quá trình học từ vựng thường khô khan, đơn điệu và mang tính cá nhân cao. Người học dễ cảm thấy nhàm chán, mất động lực và nhanh chóng bỏ cuộc khi thiếu một môi trường học tập hấp dẫn và có tính tương tác.

**1.2  Mục Tiêu Của Đồ Án**

Đề tài **"Xây dựng ứng dụng Web Flashcard thông minh hỗ trợ học từ vựng"** được thực hiện nhằm giải quyết trực tiếp các vấn đề nêu trên. Mục tiêu của hệ thống là cung cấp một nền tảng học từ vựng toàn diện, không chỉ thông minh về công nghệ mà còn hiệu quả về phương pháp sư phạm.

**1.3 Giải Pháp Đề Xuất**

Để đạt được mục tiêu, hệ thống sẽ được xây dựng dựa trên 3 trụ cột giải pháp chính:

1. **Ghi nhớ hiệu quả (Giải quyết vấn đề 1):** Tự động hóa quá trình ôn tập bằng cách áp dụng thuật toán Lặp lại Ngắt quãng (Spaced Repetition System \- SRS). Hệ thống sẽ tự tính toán thời điểm "vàng" để nhắc người dùng ôn tập, tối ưu hóa quá trình ghi nhớ dài hạn.  
2. **Kích hoạt từ vựng chủ động (Giải quyết vấn đề 2):** Xây dựng một quy trình học 4 bước độc đáo (Học \- Quiz \- Nghe \- Thử thách), đặc biệt là "Thử thách Kích hoạt" sử dụng AI để tạo ra các tình huống thực tế, buộc người học phải tư duy và "sản xuất" ngôn ngữ.  
3. **Tạo động lực học tập (Giải quyết vấn đề 3):** Tích hợp các yếu tố Gamification Thách đấu và Học tập Cộng đồng để biến việc học thành một hành trình thú vị, có tính cạnh tranh và hợp tác.

# ***2\.*** **Mô tả tổng quan**

## ***2.1 Biểu đồ Use Case Tổng quát***

*![][image1]*

***2.2 Biểu đồ use case Luồng học tập cốt lõi***  
*![][image2]*

***2.2 Biểu đồ use case Quản lý và tương tác Xã hội***  
*![][image3]*

### **Nhóm UC-01: Quản lý Tài khoản**

#### **1\. Đặc tả Use Case "UC-01.1: Đăng nhập"**

* **Mã UC:** UC-01.1  
* **Tên UC:** Đăng nhập  
* **Use Case "cha":** UC-01: Quản lý Tài khoản  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép Người học đã có tài khoản truy cập vào hệ thống bằng thông tin xác thực.  
* **Điều kiện tiên quyết:**  
  * Người học đã truy cập ứng dụng và đang ở màn hình Đăng nhập.  
* **Điều kiện sau khi thực hiện (Post-condition):**  
  * (Thành công) Người học được xác thực, được cấp một phiên làm việc (session/token) và được chuyển hướng đến Bảng điều khiển (Dashboard).  
  * (Thất bại) Người học vẫn ở màn hình Đăng nhập và nhận được thông báo lỗi.  
* **Dữ liệu đầu vào (Inputs):**  
  * Email  
  * Mật khẩu  
* **Dữ liệu đầu ra (Outputs):**  
  * (Thành công) Phiên làm việc (Session/Token).  
  * (Thất bại) Thông báo lỗi (ví dụ: "Email hoặc mật khẩu không chính xác").  
* **Luồng sự kiện chính (Main Success Scenario):**  
  * Hệ thống hiển thị biểu mẫu Đăng nhập, yêu cầu Người học cung cấp thông tin xác thực.  
  * Người học nhập **Email** và **Mật khẩu**.  
  * Người học yêu cầu đăng nhập (nhấn nút "Đăng nhập").  
  * Hệ thống kiểm tra sự tồn tại của tài khoản dựa trên **Email**.  
  * Nếu tìm thấy, hệ thống so sánh **Mật khẩu** (đã mã hóa) mà Người học cung cấp với mật khẩu đã lưu.  
  * Hệ thống xác thực thông tin thành công, tạo **Phiên làm việc** và chuyển hướng Người học đến Bảng điều khiển.  
* **Luồng ngoại lệ (Exceptions):**  
  * **5a. Thông tin không chính xác:**  
    1. Tại bước 4 hoặc 5, nếu Email không tồn tại hoặc Mật khẩu không khớp.  
    2. Hệ thống hiển thị **Thông báo lỗi**.  
    3. Use case kết thúc (Người học vẫn ở màn hình Đăng nhập).

---

#### **2\. Đặc tả Use Case "UC-01.2: Đăng ký"**

* **Mã UC:** UC-01.2  
* **Tên UC:** Đăng ký  
* **Use Case "cha":** UC-01: Quản lý Tài khoản  
* **Tác nhân:** Người học (mới)  
* **Mô tả:** Cho phép Người học mới tạo một tài khoản để truy cập hệ thống.  
* **Điều kiện tiên quyết:**  
  * Người học đang ở màn hình Đăng ký.  
* **Điều kiện sau khi thực hiện:**  
  * (Thành công) Một tài khoản Người học mới được tạo, Người học được tự động đăng nhập và chuyển hướng đến Bảng điều khiển.  
  * (Thất bại) Người học vẫn ở màn hình Đăng ký và nhận được thông báo lỗi.  
* **Dữ liệu đầu vào (Inputs):**  
  * Họ và tên  
  * Email  
  * Mật khẩu  
  * Xác nhận mật khẩu  
* **Dữ liệu đầu ra (Outputs):**  
  * (Thành công) Tài khoản Người học mới (được lưu trong CSDL), Phiên làm việc.  
  * (Thất bại) Thông báo lỗi (ví dụ: "Email này đã được sử dụng").  
* **Luồng sự kiện chính:**  
  * Hệ thống hiển thị biểu mẫu Đăng ký.  
  * Người học nhập **Họ và tên**, **Email**, **Mật khẩu**, và **Xác nhận mật khẩu**.  
  * Người học yêu cầu "Đăng ký".  
  * Hệ thống kiểm tra tính hợp lệ của dữ liệu (email đúng định dạng, mật khẩu khớp, mật khẩu đủ mạnh).  
  * Hệ thống kiểm tra tính duy nhất của **Email** trong cơ sở dữ liệu.  
  * Hệ thống mã hóa Mật khẩu và lưu **Tài khoản Người học mới** vào cơ sở dữ liệu.  
  * Hệ thống tự động kích hoạt UC-01.1 (Đăng nhập) với thông tin vừa tạo, cấp **Phiên làm việc** và chuyển hướng đến Bảng điều khiển.  
* **Luồng ngoại lệ:**  
  * **4a. Mật khẩu không khớp:**  
    1. Tại bước 4, nếu **Mật khẩu** và **Xác nhận mật khẩu** không khớp.  
    2. Hệ thống hiển thị **Thông báo lỗi** "Mật khẩu xác nhận không khớp".  
    3. Use case kết thúc.  
  * **5a. Email đã tồn tại:**  
    1. Tại bước 5, nếu **Email** đã tồn tại.  
    2. Hệ thống hiển thị **Thông báo lỗi** "Email này đã được sử dụng".  
    3. Use case kết thúc.

---

### **Nhóm UC-02: Quản lý Bộ thẻ**

#### **3\. Đặc tả Use Case "UC-02.1: Tạo Bộ thẻ"**

* **Mã UC:** UC-02.1  
* **Tên UC:** Tạo Bộ thẻ (Deck)  
* **Use Case "cha":** UC-02: Quản lý Bộ thẻ  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép Người học tạo một bộ thẻ (Deck) mới để chứa các thẻ từ vựng.  
* **Điều kiện tiên quyết:**  
  1. Người học đã đăng nhập (UC-01.1 thành công).  
  2. Người học đang ở Bảng điều khiển.  
* **Điều kiện sau khi thực hiện:**  
  1. Một bộ thẻ trống mới được tạo và lưu trong cơ sở dữ liệu, liên kết với tài khoản Người học.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Tên bộ thẻ  
  2. Mô tả (tùy chọn)  
* **Dữ liệu đầu ra (Outputs):**  
  1. (Thành công) Bộ thẻ mới (đối tượng Deck).  
* **Luồng sự kiện chính:**  
  1. Người học yêu cầu "Tạo bộ thẻ mới".  
  2. Hệ thống hiển thị cửa sổ (modal/popup) nhập thông tin.  
  3. Người học nhập **Tên bộ thẻ** và **Mô tả**.  
  4. Người học yêu cầu "Lưu".  
  5. Hệ thống tạo **Bộ thẻ mới** (trống), liên kết với tài khoản Người học và lưu vào CSDL.  
  6. Hệ thống đóng cửa sổ và cập nhật lại danh sách bộ thẻ trên Bảng điều khiển.

---

#### **4\. Đặc tả Use Case "UC-02.2: Tạo Thẻ (Thủ công)"**

* **Mã UC:** UC-02.2  
* **Tên UC:** Tạo Thẻ (Thủ công)  
* **Use Case "cha":** UC-02: Quản lý Bộ thẻ  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép Người học tự nhập nội dung cho mặt trước và mặt sau của một thẻ mới.  
* **Điều kiện tiên quyết:**  
  1. Người học đã đăng nhập (UC-01.1 thành công).  
  2. Người học đang ở trang chi tiết của một Bộ thẻ do mình sở hữu.  
* **Điều kiện sau khi thực hiện:**  
  1. Một thẻ mới được tạo, lưu vào CSDL và liên kết với bộ thẻ hiện tại.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Nội dung Mặt trước  
  2. Nội dung Mặt sau  
* **Dữ liệu đầu ra (Outputs):**  
  1. (Thành công) Thẻ mới (đối tượng Card).  
* **Luồng sự kiện chính:**  
  1. Người học yêu cầu "Thêm thẻ mới".  
  2. Hệ thống hiển thị biểu mẫu tạo thẻ.  
  3. Người học nhập **Nội dung Mặt trước** và **Nội dung Mặt sau**.  
  4. Người học yêu cầu "Lưu".  
  5. Hệ thống kiểm tra tính hợp lệ (cả hai trường đã được điền).  
  6. Hệ thống lưu **Thẻ mới** vào CSDL, liên kết với bộ thẻ hiện tại.  
  7. Hệ thống cập nhật danh sách thẻ và xóa trống biểu mẫu.

---

#### **5\. Đặc tả Use Case "UC-02.3: Gợi ý nội dung AI"**

* **Mã UC:** UC-02.3  
* **Tên UC:** Gợi ý nội dung AI  
* **Use Case "cha":** UC-02: Quản lý Bộ thẻ (Mở rộng từ UC-02.2)  
* **Tác nhân:** Người học (Chính), Hệ thống AI (Phụ)  
* **Mô tả:** Khi tạo thẻ mới (UC-02.2), cho phép Người học chỉ cần nhập từ vựng (Mặt trước) và AI sẽ tự động điền (Mặt sau).  
* **Điều kiện tiên quyết:**  
  * Người học đang trong luồng UC-02.2 (biểu mẫu Tạo Thẻ đang mở).  
  * Người học đã nhập nội dung cho Mặt trước.  
* **Điều kiện sau khi thực hiện:**  
  * Ô nội dung Mặt sau được điền tự động với nội dung do AI tạo ra.  
* **Dữ liệu đầu vào (Inputs):**  
  * Nội dung Mặt trước (ví dụ: "Ephemeral")  
* **Dữ liệu đầu ra (Outputs):**  
  * (Thành công) Nội dung Mặt sau (định nghĩa, loại từ, câu ví dụ)  
  * (Thất bại) Thông báo lỗi  
* **Luồng sự kiện chính (\<\<extend\>\>):**  
  * Trong khi thực hiện UC-02.2, Người học yêu cầu "Gợi ý bằng AI" (sau khi đã nhập Mặt trước).  
  * Hệ thống (Actor: Hệ thống AI) tiếp nhận **Nội dung Mặt trước** làm đầu vào.  
  * Hệ thống AI xử lý và tạo ra nội dung (định nghĩa, ví dụ).  
  * Hệ thống tự động điền **Nội dung Mặt sau** (Dữ liệu đầu ra) vào biểu mẫu.  
  * Người học xem lại, (tùy chọn) chỉnh sửa nội dung AI gợi ý.  
  * Use case quay trở lại luồng UC-02.2 (chờ Người học nhấn "Lưu").  
* **Luồng ngoại lệ:**  
  * **3a. AI không thể tạo nội dung:**  
    1. Tại bước 3, nếu Hệ thống AI gặp lỗi (kết nối, từ không hợp lệ).  
    2. Hệ thống hiển thị **Thông báo lỗi** (ví dụ: "Không thể tạo gợi ý. Vui lòng thử lại.").  
    3. Use case kết thúc.

---

### **Nhóm UC-03: Chinh phục Bộ thẻ mới**

#### **6\. Đặc tả Use Case "UC-03: Chinh phục Bộ thẻ mới"**

* **Mã UC:** UC-03  
* **Tên UC:** Chinh phục Bộ thẻ mới (Conquer a New Deck)  
* **Tác nhân:** Người học  
* **Mô tả:** Cung cấp luồng học 4 bước có hướng dẫn. Người học phải hoàn thành luồng này cho bộ thẻ mới trước khi các thẻ được đưa vào hệ thống ôn tập SM-2.  
* **Điều kiện tiên quyết:**  
  * Đã đăng nhập (UC-01.1 thành công).  
  * Người học có một bộ thẻ ở trạng thái "Chưa chinh phục".  
* **Điều kiện sau khi thực hiện:**  
  * Bộ thẻ được đánh dấu "Đã chinh phục".  
  * Tất cả các thẻ trong bộ được đưa vào hàng đợi ôn tập ban đầu (sẵn sàng cho UC-04).  
* **Dữ liệu đầu vào (Inputs):**  
  * Yêu cầu "Bắt đầu Chinh phục" trên một bộ thẻ cụ thể.  
* **Dữ liệu đầu ra (Outputs):**  
  * (Thành công) Trạng thái bộ thẻ "Đã chinh phục".  
* **Luồng sự kiện chính (Bắt buộc 4 bước):**  
  * Người học chọn một bộ thẻ "Chưa chinh phục" và yêu cầu "Bắt đầu Chinh phục".  
  * **UC-03.1: (Bước 1\) Xem trước Thẻ mới**.  
  * Ngay sau khi UC-03.1 hoàn thành, hệ thống tự động  **UC-03.2: (Bước 2\) Thực hiện Quiz Nhận diện**.  
  * Ngay sau khi UC-03.2 hoàn thành, hệ thống tự động **UC-03.3: (Bước 3\) Luyện tập Nghe-Viết**.  
  * Ngay sau khi UC-03.3 hoàn thành, hệ thống tự động **UC-03.4: (Bước 4\) Luyện tập Vận dụng cùng AI**.  
  * Sau khi cả 4 bước hoàn thành, hệ thống hiển thị màn hình chúc mừng.  
  * Hệ thống cập nhật **Trạng thái bộ thẻ** thành "Đã chinh phục" và đưa các thẻ vào hàng đợi ôn tập.  
* **Luồng ngoại lệ:**  
  * **1a. Người học thoát giữa chừng:**  
    1. Nếu Người học thoát khỏi luồng (tại bất kỳ bước nào).  
    2. Hệ thống lưu lại tiến trình (ví dụ: "Đã hoàn thành Bước 2/4").  
    3. Lần sau khi Người học quay lại (bước 1), hệ thống hiển thị thông báo "Tiếp tục học từ Bước 3?".

---

#### **7\. Đặc tả Use Case "UC-03.1: (Bước 1\) Xem trước Thẻ mới"**

* **Mã UC:** UC-03.1  
* **Tên UC:** Bước 1: Xem trước Thẻ mới  
* **Use Case "cha":** UC-03: Chinh phục Bộ thẻ mới   
* **Tác nhân:** Người học  
* **Mô tả:** Bắt buộc Người học xem lướt qua tất cả các thẻ trong bộ để làm quen.  
* **Điều kiện tiên quyết:**  
  1. Người học vừa bắt đầu UC-03.  
* **Điều kiện sau khi thực hiện:**  
  1. Người học đã xem 100% số thẻ.  
  2. Hệ thống tự động chuyển sang UC-03.2.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Yêu cầu "Lật thẻ"  
  2. Yêu cầu "Tiếp theo"  
  3. Yêu cầu "Hoàn thành" (ở thẻ cuối)  
* **Dữ liệu đầu ra (Outputs):**  
  1. (Không có)  
* **Luồng sự kiện chính:**  
  1. Hệ thống hiển thị thẻ đầu tiên (ví dụ: 1/20), chỉ Mặt trước.  
  2. Người học yêu cầu "Lật thẻ".  
  3. Hệ thống hiển thị Mặt sau.  
  4. Người học yêu cầu "Tiếp theo".  
  5. Hệ thống lặp lại từ bước 1 (hiển thị thẻ 2/20) cho đến khi hết thẻ (20/20).  
  6. Khi Người học yêu cầu "Hoàn thành" ở thẻ cuối, use case kết thúc.

---

#### **8\. Đặc tả Use Case "UC-03.2: (Bước 2\) Thực hiện Quiz Nhận diện"**

* **Mã UC:** UC-03.2  
* **Tên UC:** Bước 2: Thực hiện Quiz Nhận diện  
* **Use Case "cha":** UC-03: Chinh phục Bộ thẻ mới   
* **Tác nhân:** Người học  
* **Mô tả:** Kiểm tra khả năng nhận diện (recognition) qua bài quiz trắc nghiệm.  
* **Điều kiện tiên quyết:**  
  1. Người học đã hoàn thành UC-03.1.  
* **Điều kiện sau khi thực hiện:**  
  1. Người học hoàn thành bài quiz.  
  2. Hệ thống tự động chuyển sang UC-03.3.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Lựa chọn đáp án (1 trong 4\)  
* **Dữ liệu đầu ra (Outputs):**  
  1. Kết quả quiz (ví dụ: "Bạn đúng 17/20 câu")  
* **Luồng sự kiện chính:**  
  1. Hệ thống hiển thị câu hỏi trắc nghiệm đầu tiên (1/N).  
  2. Hệ thống hiển thị một Mặt trước (câu hỏi) và 4 lựa chọn Mặt sau (1 đúng, 3 sai ngẫu nhiên).  
  3. Người học **Lựa chọn đáp án**.  
  4. Hệ thống kiểm tra đáp án:  
     * (Đúng) Hiển thị phản hồi "Đúng" và tự động chuyển sang câu tiếp theo.  
     * (Sai) Hiển thị phản hồi "Sai", chỉ ra đáp án đúng, và yêu cầu Người học nhấn "Tiếp theo".  
  5. Hệ thống lặp lại bước 2-4 cho đến khi hết (N/N) câu.  
  6. Hệ thống hiển thị **Kết quả quiz** và use case kết thúc.

---

#### **9\. Đặc tả Use Case "UC-03.3: (Bước 3\) Luyện tập Nghe-Viết"**

* **Mã UC:** UC-03.3  
* **Tên UC:** Bước 3: Luyện tập Nghe-Viết  
* **Use Case "cha":** UC-03: Chinh phục Bộ thẻ mới   
* **Tác nhân:** Người học  
* **Mô tả:** Kiểm tra khả năng nghe và nhận diện từ vựng qua âm thanh (gõ lại từ).  
* **Điều kiện tiên quyết:**  
  1. Người học đã hoàn thành UC-03.2.  
* **Điều kiện sau khi thực hiện:**  
  1. Người học hoàn thành bài tập nghe.  
  2. Hệ thống tự động chuyển sang UC-03.4.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Văn bản (từ) Người học gõ  
* **Dữ liệu đầu ra (Outputs):**  
  1. Kết quả bài tập (ví dụ: "Bạn đúng 15/20 câu")  
* **Luồng sự kiện chính:**  
  1. Hệ thống hiển thị câu hỏi đầu tiên (1/N).  
  2. Hệ thống phát âm thanh (text-to-speech) của Mặt trước.  
  3. Hệ thống hiển thị một ô văn bản trống.  
  4. Người học gõ **Văn bản** (từ) mình nghe được.  
  5. Hệ thống kiểm tra văn bản:  
     * (Đúng) Hiển thị "Chính xác\!" và chuyển câu.  
     * (Sai) Hiển thị "Sai rồi\!", hiển thị đáp án đúng, và chuyển câu.  
  6. Hệ thống lặp lại bước 2-5 cho đến khi hết (N/N) câu.  
  7. Hệ thống hiển thị **Kết quả bài tập** và use case kết thúc.

---

#### **10\. Đặc tả Use Case "UC-03.4: (Bước 4\) Luyện tập Vận dụng cùng AI"**

* **Mã UC:** UC-03.4  
* **Tên UC:** Bước 4: Luyện tập Vận dụng cùng AI  
* **Use Case "cha":** UC-03: Chinh phục Bộ thẻ mới   
* **Tác nhân:** Người học (Chính), Hệ thống AI (Phụ)  
* **Mô tả:** Kiểm tra khả năng vận dụng (activation) từ vựng trong bối cảnh cụ thể (viết câu, dịch).  
* **Điều kiện tiên quyết:**  
  1. Người học đã hoàn thành UC-03.3.  
* **Điều kiện sau khi thực hiện:**  
  1. Người học hoàn thành bài tập vận dụng.  
  2. Kích hoạt điều kiện sau của UC-03 (tổng).  
* **Dữ liệu đầu vào (Inputs):**  
  1. Câu trả lời (văn bản) của Người học  
* **Dữ liệu đầu ra (Outputs):**  
  1. Câu hỏi/Tình huống (từ AI)  
  2. Phản hồi về câu trả lời (từ AI)  
  3. Màn hình chúc mừng  
* **Luồng sự kiện chính:**  
  1. Hệ thống hiển thị thử thách đầu tiên (1/N).  
  2. Hệ thống (Actor: Hệ thống AI) tạo và hiển thị **Câu hỏi/Tình huống** (ví dụ: "Hãy dịch câu... sử dụng 'ephemeral'").  
  3. Người học gõ **Câu trả lời** của mình.  
  4. Người học yêu cầu "Nộp".  
  5. Hệ thống (Actor: Hệ thống AI) nhận câu trả lời, so sánh với đáp án mẫu và tạo phản hồi.  
  6. Hệ thống hiển thị **Phản hồi** (ví dụ: "Chính xác\!").  
  7. Hệ thống lặp lại bước 2-6 cho đến khi hết (N/N) thử thách.  
  8. Hệ thống hiển thị **Màn hình chúc mừng** (hoàn thành UC-03 tổng).  
  9. Use case kết thúc.

---

### **Nhóm UC-04: Ôn tập Hàng ngày**

#### **11\. Đặc tả Use Case "UC-04.1: Ôn tập hàng ngày"**

* **Mã UC:** UC-04.1  
* **Tên UC:** Ôn tập hàng ngày  
* **Use Case "cha":** UC-04: Ôn tập Hàng ngày (SRS)  
* **Tác nhân:** Người học (Chính), Hệ thống SM-2 (Phụ)  
* **Mô tả:** Luồng chính Người học tương tác với hệ thống SM-2 để ôn tập các thẻ đã đến hạn.  
* **Điều kiện tiên quyết:**  
  * Người học đã đăng nhập (UC-01.1 thành công).  
  * Có ít nhất 1 thẻ đã đến hạn ôn tập (nextReviewDate \<= hôm nay).  
* **Điều kiện sau khi thực hiện:**  
  * Tất cả các thẻ đến hạn đều được cập nhật thông số SRS (easeFactor, interval) và được gán `nextReviewDate` (ngày ôn tập tiếp theo) mới.  
* **Dữ liệu đầu vào (Inputs):**  
  * Yêu cầu "Bắt đầu Ôn tập"  
  * Yêu cầu "Lật thẻ"  
  * Lựa chọn Mức độ Ghi nhớ (Quality) (ví dụ: 0, 2, 3, 4, 5\)  
* **Dữ liệu đầu ra (Outputs):**  
  * Thông báo số thẻ cần ôn  
  * (Nội bộ) Cập nhật `nextReviewDate` cho thẻ.  
* **Luồng sự kiện chính:**  
  * (Tại Bảng điều khiển) Hệ thống truy vấn và hiển thị **Thông báo số thẻ cần ôn** hôm nay.  
  * Người học yêu cầu "Bắt đầu Ôn tập".  
  * Hệ thống truy vấn và lấy danh sách các thẻ cần ôn (ví dụ: 12 thẻ).  
  * Hệ thống hiển thị thẻ đầu tiên (1/12), chỉ hiển thị Mặt trước.  
  * Người học tự nhớ lại Mặt sau.  
  * Người học yêu cầu "Lật thẻ".  
  * Hệ thống hiển thị Mặt sau và các nút đánh giá (Quality).  
  * Người học tự đánh giá và chọn một **Lựa chọn Mức độ Ghi nhớ** (ví dụ: "Nhớ tốt", quality \= 4).  
  * Hệ thống gửi (cardId, quality) cho Hệ thống SM-2.  
  * Hệ thống (Actor: Hệ thống SM-2) áp dụng thuật toán SM-2, tính toán (easeFactor, interval) và cập nhật `nextReviewDate` mới cho thẻ.  
  * Hệ thống lặp lại từ bước 4 (hiển thị thẻ 2/12) cho đến khi hết 12 thẻ.  
  * Hệ thống hiển thị màn hình "Hoàn thành\! Hẹn gặp lại vào ngày mai\!".  
* **Luồng rẽ nhánh:**  
  * **10a. Thẻ bị "Quên" (Lapse):**  
    1. Tại bước 10, nếu Người học chọn quality \< 3 (ví dụ: "Quên hoàn toàn").  
    2. Hệ thống SM-2 đặt lại repetitions \= 0, interval \= 1 (hoặc theo cấu hình).  
    3. (Tùy chọn) Thẻ này được đưa lại vào cuối hàng đợi của phiên ôn tập hiện tại để học lại ngay.

---

### **Nhóm UC-05: Luyện tập Tùy chọn**

#### **12\. Đặc tả Use Case "UC-05: Luyện tập Chuyên sâu"**

* **Mã UC:** UC-05  
* **Tên UC:** Luyện tập Chuyên sâu (Intensive Practice)  
* **Tác nhân:** Người học  
* **Mô tả:** Cung cấp các chế độ luyện tập tùy chọn (Quiz, Nghe,...) cho các bộ thẻ đã chinh phục, giúp ôn tập theo chủ đề mà không ảnh hưởng đến lịch SM-2.  
* **Điều kiện tiên quyết:**  
  1. Đã đăng nhập (UC-01.1 thành công).  
  2. Người học có ít nhất một bộ thẻ ở trạng thái "Đã chinh phục".  
* **Điều kiện sau khi thực hiện:**  
  1. Kết thúc phiên luyện tập, hệ thống hiển thị điểm số.  
  2. Lịch SM-2 (UC-04) **không** bị ảnh hưởng.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Lựa chọn bộ thẻ (đã chinh phục)  
  2. Lựa chọn chế độ luyện tập (ví dụ: "Luyện tập (Nghe)")  
* **Dữ liệu đầu ra (Outputs):**  
  1. Điểm số kết quả (ví dụ: "Bạn đã làm đúng 18/20 câu\!")  
* **Luồng sự kiện chính (Tùy chọn \<\<extend\>\>):**  
  1. Người học vào Bảng điều khiển, chọn một bộ thẻ "Đã chinh phục".  
  2. Hệ thống hiển thị trang chi tiết bộ thẻ, cùng các tùy chọn luyện tập.  
  3. Người học \<\<extend\>\> chọn một **Lựa chọn chế độ luyện tập** (ví dụ: "Luyện tập (Trắc nghiệm)").  
  4. Hệ thống bắt đầu một phiên luyện tập chỉ với chế độ được chọn (luồng tương tự UC-03.2 hoặc UC-03.3).  
  5. Sau khi hoàn thành, hệ thống hiển thị **Điểm số kết quả**.  
  6. Use case kết thúc.

---

### **Nhóm UC-06: Thách đấu (Học tập Xã hội)**

#### **13\. Đặc tả Use Case "UC-06.1: Mời bạn học chung"**

* **Mã UC:** UC-06.1  
* **Tên UC:** Mời bạn học chung  
* **Use Case "cha":** UC-06: Thách đấu  
* **Tác nhân:** Người học (Chủ thẻ), Người học (Thành viên B)  
* **Mô tả:** Cho phép chủ sở hữu bộ thẻ mời người khác tham gia học chung (chỉ đọc và học).  
* **Điều kiện tiên quyết:**  
  * Người học (Chủ thẻ) đã đăng nhập và đang xem một bộ thẻ mình sở hữu.  
* **Điều kiện sau khi thực hiện:**  
  * (Thành công) Người học (Thành viên B) có quyền truy cập vào bộ thẻ.  
* **Dữ liệu đầu vào (Inputs):**  
  * (Chủ thẻ A) Email của Người học B  
  * (Thành viên B) Yêu cầu "Chấp nhận" hoặc "Từ chối"  
* **Dữ liệu đầu ra (Outputs):**  
  * Bản ghi "Lời mời" (trạng thái "Đang chờ")  
  * Thông báo (lỗi hoặc thành công)  
* **Luồng sự kiện chính (Mời và Chấp nhận):**  
  * Người học (Chủ thẻ A) vào trang chi tiết bộ thẻ, chọn tab "Thành viên".  
  * Người học A yêu cầu "Mời bạn".  
  * Người học A nhập **Email của Người học B** và yêu cầu "Gửi lời mời".  
  * Hệ thống tạo **Bản ghi "Lời mời"** (trạng thái "Đang chờ") và gửi thông báo cho Người học B.  
  * (Một lúc sau) Người học B đăng nhập, thấy thông báo lời mời.  
  * Người học B yêu cầu "Chấp nhận".  
  * Hệ thống cập nhật trạng thái lời mời (thành "Đã chấp nhận") và thêm B vào danh sách thành viên của bộ thẻ.  
  * Bộ thẻ này xuất hiện trong danh sách của Người học B.  
* **Luồng ngoại lệ:**  
  * **4a. Email không tồn tại:**  
    1. Tại bước 4, nếu **Email** không tồn tại trong hệ thống.  
    2. Hệ thống hiển thị **Thông báo** "Không tìm thấy người dùng...".  
    3. Use case kết thúc.  
  * **6a. Từ chối lời mời:**  
    1. Tại bước 6, nếu Người học B yêu cầu "Từ chối".  
    2. Hệ thống xóa/cập nhật bản ghi lời mời.  
    3. Use case kết thúc.

---

#### **14\. Đặc tả Use Case "UC-06.2: Gửi lời thách đấu"**

* **Mã UC:** UC-06.2  
* **Tên UC:** Gửi lời thách đấu  
* **Use Case "cha":** UC-06: Thách đấu  
* **Tác nhân:** Người học (Thành viên A)  
* **Mô tả:** Cho phép một thành viên trong bộ thẻ chung gửi lời thách đấu (quiz) một thành viên khác.  
* **Điều kiện tiên quyết:**  
  * Người học (A) là thành viên của một bộ thẻ chung có ít nhất 2 người.  
* **Điều kiện sau khi thực hiện:**  
  * Một bản ghi "Thách đấu" được tạo (trạng thái "Đang chờ", hết hạn 24h) và thông báo được gửi đến đối thủ (B).  
* **Dữ liệu đầu vào (Inputs):**  
  * Lựa chọn đối thủ (Người học B)  
  * Yêu cầu "Thách đấu"  
  * (Đã hoàn thành) Bài quiz của Người học A  
* **Dữ liệu đầu ra (Outputs):**  
  * Bản ghi "Thách đấu" (lưu (A, B, bài\_quiz\_data, điểm\_A, thời\_gian\_A, trạng\_thái, hết\_hạn))  
  * Thông báo cho Người học B  
* **Luồng sự kiện chính:**  
  * Người học A vào bộ thẻ chung, tab "Thành viên".  
  * Hệ thống hiển thị danh sách thành viên.  
  * Người học A yêu cầu "Thách đấu" bên cạnh tên **Người học B**.  
  * Hệ thống yêu cầu xác nhận.  
  * Người học A "Đồng ý".  
  * Hệ thống tự động tạo một bài quiz (ví dụ: 10 câu) từ bộ thẻ.  
  * Hệ thống yêu cầu Người học A hoàn thành bài quiz này ngay lập tức.  
  * Người học A hoàn thành bài quiz.  
  * Hệ thống chấm điểm và lưu (điểm\_số\_A, thời\_gian\_A).  
  * Hệ thống tạo **Bản ghi "Thách đấu"** (lưu (A, B, quiz, điểm\_A, thời\_gian\_A, "Đang chờ", NOW \+ 24h)).  
  * Hệ thống gửi **Thông báo cho Người học B**.  
* **Luồng ngoại lệ:**  
  * **3a. Đã có thách đấu đang chờ:**  
    1. Tại bước 3, nếu đã có thách đấu "Đang chờ" giữa A và B.  
    2. Hệ thống báo lỗi "Bạn không thể thách đấu người này...".

---

#### **15\. Đặc tả Use Case "UC-06.3: Đáp trả thách đấu"**

* **Mã UC:** UC-06.3  
* **Tên UC:** Đáp trả thách đấu  
* **Use Case "cha":** UC-06: Thách đấu  
* **Tác nhân:** Người học (Thành viên B)  
* **Mô tả:** Cho phép Người học bị thách đấu chấp nhận và hoàn thành bài quiz để so sánh kết quả.  
* **Điều kiện tiên quyết:**  
  * Người học (B) đã nhận được lời thách đấu (từ UC-06.2).  
  * Lời thách đấu chưa hết hạn (dưới 24h).  
* **Điều kiện sau khi thực hiện:**  
  * Bản ghi "Thách đấu" được cập nhật (trạng thái "Hoàn thành", người thắng/thua).  
  * Thông báo kết quả được gửi cho cả A và B.  
* **Dữ liệu đầu vào (Inputs):**  
  * Yêu cầu "Chấp nhận thách đấu" (hoặc "Từ chối")  
  * (Đã hoàn thành) Bài quiz của Người học B  
* **Dữ liệu đầu ra (Outputs):**  
  * Thông báo kết quả (thắng/thua)  
* **Luồng sự kiện chính:**  
  * Người học B thấy thông báo thách đấu.  
  * Người học B yêu cầu "Chấp nhận thách đấu".  
  * Hệ thống hiển thị bài quiz 10 câu (đã tạo ở UC-06.2).  
  * Người học B hoàn thành bài quiz.  
  * Hệ thống chấm điểm và ghi lại (điểm\_số\_B, thời\_gian\_B).  
  * Hệ thống truy xuất (điểm\_số\_A, thời\_gian\_A) từ bản ghi "Thách đấu".  
  * Hệ thống so sánh kết quả (ưu tiên 1: điểm số, ưu tiên 2: thời gian) để xác định người thắng.  
  * Hệ thống cập nhật trạng thái bản ghi "Thách đấu" thành "Hoàn thành".  
  * Hệ thống gửi **Thông báo kết quả** cho cả A và B.  
* **Luồng ngoại lệ:**  
  * **2a. Thách đấu hết hạn:**  
    1. Tại bước 2, nếu Người học B chấp nhận khi lời thách đấu đã quá 24h.  
    2. Hệ thống báo "Thách đấu đã hết hạn. Bạn đã thua\!".  
    3. Hệ thống cập nhật bản ghi (B thua).  
  * **2b. Từ chối thách đấu:**  
    1. Tại bước 2, nếu Người học B yêu cầu "Từ chối".  
    2. Hệ thống cập nhật trạng thái "Đã từ chối" (B thua).  
    3. Hệ thống thông báo cho A.

---

### **Nhóm UC-07: Tương tác Cộng đồng**

#### **16\. Đặc tả Use Case "UC-07.1: Xem và Bầu chọn Mnemonic"**

* **Mã UC:** UC-07.1  
* **Tên UC:** Xem và Bầu chọn Mnemonic (Mẹo ghi nhớ)  
* **Use Case "cha":** UC-07: Tương tác Cộng đồng  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép xem các mẹo ghi nhớ do cộng đồng tạo cho một thẻ và bỏ phiếu (upvote).  
* **Điều kiện tiên quyết:**  
  1. Người học đang xem chi tiết một thẻ (trong UC-02, 03, 04 hoặc 05).  
* **Điều kiện sau khi thực hiện:**  
  1. Số lượt bầu chọn (vote) cho mẹo ghi nhớ được cập nhật.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Yêu cầu xem "Mẹo ghi nhớ"  
  2. Yêu cầu "Upvote" (hoặc "Downvote")  
* **Dữ liệu đầu ra (Outputs):**  
  1. Danh sách các Mnemonic (sắp xếp theo lượt vote)  
* **Luồng sự kiện chính (\<\<extend\>\>):**  
  1. Khi đang xem một thẻ, Người học \<\<extend\>\> bằng cách yêu cầu xem "Mẹo ghi nhớ".  
  2. Hệ thống truy vấn và hiển thị **Danh sách các Mnemonic** (sắp xếp theo vote).  
  3. Người học yêu cầu "Upvote" cho một mẹo.  
  4. Hệ thống cập nhật tổng số lượt bầu chọn (tăng 1, hoặc gỡ phiếu nếu đã vote).  
  5. Hệ thống sắp xếp lại danh sách.

---

#### **17\. Đặc tả Use Case "UC-07.2: Đóng góp Mnemonic"**

* **Mã UC:** UC-07.2  
* **Tên UC:** Đóng góp Mnemonic (Mẹo ghi nhớ)  
* **Use Case "cha":** UC-07: Tương tác Cộng đồng  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép Người học tự viết và đăng mẹo ghi nhớ của riêng mình cho một thẻ.  
* **Điều kiện tiên quyết:**  
  1. Người học đang ở màn hình "Mẹo ghi nhớ" (đang thực hiện UC-07.1).  
* **Điều kiện sau khi thực hiện:**  
  1. Một mẹo ghi nhớ mới được tạo và liên kết với thẻ, hiển thị trong danh sách.  
* **Dữ liệu đầu vào (Inputs):**  
  1. Nội dung Mnemonic (văn bản)  
* **Dữ liệu đầu ra (Outputs):**  
  1. Mẹo ghi nhớ mới (đối tượng Mnemonic).  
* **Luồng sự kiện chính (\<\<extend\>\>):**  
  1. Trong khi xem danh sách (UC-07.1), Người học yêu cầu "Đóng góp mẹo của bạn".  
  2. Hệ thống hiển thị ô nhập văn bản.  
  3. Người học nhập **Nội dung Mnemonic**.  
  4. Người học yêu cầu "Đăng".  
  5. Hệ thống lưu **Mẹo ghi nhớ mới** (với 0 vote), liên kết nó với thẻ và Người học.  
  6. Hệ thống cập nhật, hiển thị mẹo mới trong danh sách.