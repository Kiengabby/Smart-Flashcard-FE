## **1\. Đặc tả Use Case "UC-01: Quản lý Tài khoản"**

* **Mã UC:** UC-01  
* **Tên UC:** Quản lý Tài khoản (Account Management)  
* **Tác nhân:** Người học  
* **Mô tả:** Cung cấp cho Người học khả năng xác thực và truy cập vào hệ thống, bao gồm đăng nhập và đăng ký tài khoản mới.  
* **Điều kiện tiên quyết:** Người học có kết nối internet và truy cập vào ứng dụng.  
* **Điều kiện sau khi thực hiện:**  
  * (Nếu Đăng nhập/Đăng ký thành công): Người học được xác thực, hệ thống ghi nhận trạng thái đăng nhập và chuyển hướng đến Bảng điều khiển (Dashboard).  
  * (Nếu thất bại): Người học nhận được thông báo lỗi và vẫn ở màn hình hiện tại.  
* **Luồng sự kiện chính (Main Flow \- Đăng nhập):**  
  * Hệ thống hiển thị màn hình Đăng nhập, yêu cầu thông tin.  
  * **Đầu vào:** Người học nhập email và mật khẩu.  
  * Người học nhấn nút "Đăng nhập".  
  * Hệ thống kiểm tra tính hợp lệ và chính xác của thông tin (email có tồn tại, mật khẩu có khớp).  
  * **Đầu ra (Thành công):** Nếu thông tin chính xác, hệ thống cấp cho Người học một phiên đăng nhập, ghi nhận trạng thái đã xác thực và chuyển hướng Người học đến Bảng điều khiển chính (Dashboard).  
* **Luồng rẽ nhánh (Alternative Flow \- Đăng ký):**  
  * Tại màn hình Đăng nhập, Người học chọn "Đăng ký tài khoản".  
  * Hệ thống hiển thị màn hình Đăng ký.  
  * **Đầu vào:** Người học điền thông tin (tên, email, mật khẩu, xác nhận mật khẩu).  
  * Người học nhấn nút "Đăng ký".  
  * Hệ thống kiểm tra tính hợp lệ của thông tin (email chưa tồn tại, mật khẩu khớp).  
  * **Đầu ra (Thành công):** Hệ thống tạo một tài khoản mới, tự động đăng nhập cho Người học (quay lại bước 5 của Luồng chính) và chuyển đến Bảng điều khiển.  
* **Luồng ngoại lệ (Exceptions):**  
  * (Luồng chính) Nếu thông tin không chính xác (sai email hoặc mật khẩu), hệ thống hiển thị thông báo lỗi "Email hoặc mật khẩu không chính xác".  
  * (Luồng rẽ nhánh) Nếu email đã tồn tại, hệ thống hiển thị thông báo lỗi "Email này đã được sử dụng".

## **2\. Đặc tả Use Case "UC-02: Quản lý Bộ thẻ"**

* **Mã UC:** UC-02  
* **Tên UC:** Quản lý Bộ thẻ  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép Người học tạo, xem, sửa, xóa (CRUD) các bộ thẻ (Decks) và các thẻ (Cards) bên trong. Đây là chức năng cốt lõi để tạo tài liệu học tập.  
* **Điều kiện tiên quyết:** Người học đã đăng nhập (UC-01 thành công).  
* **Điều kiện sau khi thực hiện:** Dữ liệu về bộ thẻ/thẻ được cập nhật trong cơ sở dữ liệu.  
* **Luồng sự kiện chính (Tạo Bộ thẻ \- Deck):**  
  1. Người học đang ở Bảng điều khiển.  
  2. Người học nhấn nút "Tạo bộ thẻ mới".  
  3. Hệ thống hiển thị cửa sổ, yêu cầu thông tin bộ thẻ.  
  4. **Đầu vào:** Người học nhập Tên bộ thẻ và Mô tả.  
  5. Người học nhấn "Lưu".  
  6. **Đầu ra:** Hệ thống tạo một bộ thẻ trống mới, liên kết bộ thẻ này với tài khoản của Người học. Hệ thống đóng cửa sổ và cập nhật lại danh sách bộ thẻ trên Bảng điều khiển.  
* **Luồng sự kiện chính (Tạo Thẻ \- Card):**  
  1. Người học nhấn vào một bộ thẻ cụ thể từ Bảng điều khiển.  
  2. Hệ thống hiển thị trang chi tiết bộ thẻ và danh sách các thẻ hiện có.  
  3. Người học nhấn nút "Thêm thẻ mới".  
  4. Hệ thống hiển thị form tạo thẻ.  
  5. **Đầu vào:** Người học nhập Mặt trước (VD: "Hello") và Mặt sau (VD: "Xin chào").  
  6. Người học nhấn "Lưu".  
  7. **Đầu ra:** Hệ thống tạo một thẻ mới, lưu vào bộ thẻ tương ứng và cập nhật lại danh sách thẻ.  
* **Luồng rẽ nhánh (Gợi ý nội dung bằng AI \- Kế hoạch):**  
  1. Tại bước 4 của luồng "Tạo Thẻ", Người học chỉ nhập Mặt trước. **Ví dụ:** "Resilience".  
  2. Người học nhấn nút "Gợi ý bằng AI".  
  3. **Đầu vào:** Hệ thống lấy từ "Resilience".  
  4. **Đầu ra:** Hệ thống tự động điền vào ô Mặt sau. **Ví dụ:** "Nghĩa: Khả năng phục hồi, sự kiên cường. Ví dụ: She showed great resilience to...".  
  5. Người học xem lại và nhấn "Lưu" (quay lại bước 6 luồng "Tạo Thẻ").  
* **Luồng rẽ nhánh (Sửa/Xóa):** Các luồng này tương tự, cho phép Người học chọn sửa/xóa một bộ thẻ hoặc một thẻ cụ thể.  
* **Ngoại lệ:** Nếu Người học (vì một lý do nào đó) cố gắng truy cập vào bộ thẻ không thuộc sở hữu của mình, hệ thống sẽ từ chối và thông báo "Bạn không có quyền truy cập".

## **3\. Đặc tả Use Case "UC-03: Chinh phục Bộ thẻ mới"**

* **Mã UC:** UC-03  
* **Tên UC:** Chinh phục Bộ thẻ mới (Conquer a New Deck)  
* **Tác nhân:** Người học  
* **Mô tả:** Cung cấp một luồng học tập 4 bước **bắt buộc** có hướng dẫn. Người học phải hoàn thành luồng này cho một bộ thẻ mới trước khi các thẻ đó được đưa vào hệ thống ôn tập SM-2.  
* **Điều kiện tiên quyết:** Đã đăng nhập (UC-01); Người học có một bộ thẻ ở trạng thái "Chưa chinh phục".  
* **Điều kiện sau khi thực hiện:** Bộ thẻ được đánh dấu "Đã chinh phục"; Tất cả các thẻ trong bộ thẻ này được đưa vào hàng đợi ôn tập ban đầu, sẵn sàng cho chức năng "Ôn tập Hàng ngày" (UC-04).  
* **Luồng sự kiện chính (Bắt buộc 4 bước \<\<include\>\>):**  
  1. **Đầu vào:** Người học chọn một bộ thẻ "Chưa chinh phục" và nhấn "Bắt đầu Chinh phục".  
  2. Hệ thống \<\<include\>\> **Bước 1: Gặp gỡ & Làm quen**.  
     * **Mô tả:** Người học xem qua tất cả các thẻ trong bộ để làm quen.  
     * **Ví dụ:** Hệ thống hiển thị flashcard 1/20, Người học lật xem mặt sau, nhấn "Tiếp theo". Lặp lại cho đến khi hết 20 thẻ.  
  3. Sau khi hoàn thành Bước 1, hệ thống tự động \<\<include\>\> **Bước 2: Củng cố Nhận diện**.  
     * **Mô tả:** Bài quiz trắc nghiệm (multiple choice) để kiểm tra khả năng nhận diện nghĩa.  
     * **Ví dụ:** Hiển thị từ "Resilience", Người học phải chọn 1 trong 4 định nghĩa đúng.  
  4. Sau khi hoàn thành Bước 2, hệ thống tự động \<\<include\>\> **Bước 3: Thẩm thấu Âm thanh**.  
     * **Mô tả:** Bài tập nghe để luyện khả năng nhận diện âm thanh.  
     * **Ví dụ:** Hệ thống phát âm thanh "Resilience", Người học phải gõ lại từ hoặc chọn từ đúng.  
  5. Sau khi hoàn thành Bước 3, hệ thống tự động \<\<include\>\> **Bước 4: Thử thách Kích hoạt**.  
     * **Mô tả:** Bài tập vận dụng (có thể dùng AI) để kích hoạt khả năng sử dụng từ.  
     * **Ví dụ:** AI đưa ra tình huống: "Hãy mô tả một người không bao giờ bỏ cuộc bằng tiếng Anh". Người học phải gõ câu trả lời (VD: "That person shows great resilience"). Hệ thống sẽ chấm (hoặc đưa ra câu mẫu).  
  6. **Đầu ra:** Sau khi hoàn thành cả 4 bước, hệ thống hiển thị màn hình chúc mừng "Bạn đã chinh phục bộ thẻ\!". Trạng thái bộ thẻ được cập nhật thành "Đã chinh phục".  
* **Luồng ngoại lệ:** Người học thoát giữa chừng. Hệ thống lưu lại tiến trình. **Ví dụ:** Lần sau quay lại, hệ thống thông báo "Bạn đang dang dở ở Bước 3\. Tiếp tục học?".

## **4\. Đặc tả Use Case "UC-04: Ôn tập Hàng ngày (SRS)"**

* **Mã UC:** UC-04  
* **Tên UC:** Ôn tập Hàng ngày (Daily Review \- Spaced Repetition System)  
* **Tác nhân:** Người học, Hệ thống SM-2 (Actor thứ cấp)  
* **Mô tả:** Chức năng **lõi** của ứng dụng. Hàng ngày, hệ thống tự động tính toán và cung cấp danh sách các thẻ đã đến hạn ôn tập dựa trên thuật toán SM-2.  
* **Điều kiện tiên quyết:** Đã đăng nhập (UC-01); Có ít nhất 1 thẻ đã "Chinh phục" (UC-03) và đã đến ngày ôn tập.  
* **Điều kiện sau khi thực hiện:** Các thẻ được ôn tập có lịch ôn tập mới (ngày ôn tập tiếp theo) được cập nhật.  
* **Luồng sự kiện chính:**  
  1. Người học vào Bảng điều khiển. Hệ thống truy vấn để lấy số lượng thẻ cần ôn tập hôm nay.  
  2. **Đầu ra:** Hệ thống hiển thị thông báo, **ví dụ:** "Bạn có 12 thẻ cần ôn tập hôm nay\!".  
  3. **Đầu vào:** Người học nhấn "Bắt đầu Ôn tập".  
  4. Hệ thống \<\<include\>\> Lấy thẻ cần ôn tập: Hệ thống truy xuất danh sách các thẻ đã đến hạn ôn tập.  
  5. Hệ thống (Frontend) hiển thị mặt trước của thẻ đầu tiên.  
  6. Người học suy nghĩ, tự nhớ lại câu trả lời và nhấn "Lật thẻ".  
  7. Hệ thống hiển thị mặt sau và các nút đánh giá chất lượng (quality).  
  8. Hệ thống \<\<include\>\> Nộp kết quả:  
     * **Đầu vào:** Người học tự đánh giá và chọn 1 nút. **Ví dụ:**  
       * "Quên hoàn toàn" (quality \= 0\)  
       * "Nhớ lơ mơ" (quality \= 2\)  
       * "Nhớ (khó khăn)" (quality \= 3\)  
       * "Nhớ tốt" (quality \= 4\)  
       * "Rất dễ" (quality \= 5\)  
  9. Hệ thống \<\<include\>\> Tính toán Lịch ôn tập: Hệ thống SM-2 (Actor thứ cấp) tiếp nhận quality này.  
  10. **Đầu ra (của bước 9):** Hệ thống áp dụng thuật toán SM-2 để tính toán lại độ khó, khoảng thời gian ôn tập mới, và **cập nhật ngày ôn tập tiếp theo** cho thẻ này.  
  11. Lặp lại từ bước 5 cho đến khi hết danh sách thẻ.  
  12. Hệ thống hiển thị màn hình tổng kết phiên ôn tập.  
* **Luồng ngoại lệ:** Nếu Người học chọn một mức quality không hợp lệ, hệ thống sẽ yêu cầu chọn lại.

## **5\. Đặc tả Use Case "UC-05: Luyện tập Chuyên sâu"**

* **Mã UC:** UC-05  
* **Tên UC:** Luyện tập Chuyên sâu (Intensive Practice)  
* **Tác nhân:** Người học  
* **Mô tả:** Cung cấp các chế độ luyện tập **tùy chọn** (dựa trên 4 bước của UC-03) cho các bộ thẻ đã được "Chinh phục". Giúp người học ôn tập theo chủ đề mình muốn, thay vì chờ lịch của SM-2.  
* **Điều kiện tiên quyết:** Đã đăng nhập (UC-01); Người học có một bộ thẻ ở trạng thái "Đã chinh phục".  
* **Luồng sự kiện chính (Tùy chọn \<\<extend\>\>):**  
  1. Người học vào Bảng điều khiển, chọn một bộ thẻ "Đã chinh phục".  
  2. Hệ thống hiển thị trang chi tiết bộ thẻ, cùng các tùy chọn luyện tập.  
  3. Người học \<\<extend\>\> **Chọn 1 chế độ luyện tập**.  
     * **Đầu vào (Ví dụ):** Người học nhấn nút "Luyện tập (Trắc nghiệm)" (tương ứng Bước 2 UC-03).  
     * **Đầu vào (Ví dụ khác):** Người học nhấn nút "Luyện tập (Nghe)" (tương ứng Bước 3 UC-03).  
  4. Hệ thống bắt đầu một phiên luyện tập chỉ với chế độ được chọn (tương tự như luồng của bước đó trong UC-03).  
  5. **Đầu ra:** Kết thúc phiên, hệ thống hiển thị điểm số/kết quả (VD: "Bạn đã làm đúng 18/20 câu\!").  
* **Ghi chú:** Phiên luyện tập này (UC-05) không ảnh hưởng đến lịch ôn tập chính của SM-2 (UC-04) để tránh làm nhiễu thuật toán.

## **6\. Đặc tả Use Case "UC-06: Thách đấu"**

* **Mã UC:** UC-06  
* **Tên UC:** Học tập Xã hội (Social Learning \- Challenge)  
* **Tác nhân:** Người học (Chủ thẻ), Người học (Thành viên)  
* **Mô tả:** Cho phép chủ sở hữu bộ thẻ mời người khác học chung. Các thành viên trong bộ thẻ chung có thể thấy tiến độ của nhau và gửi lời thách đấu.  
* **Điều kiện tiên quyết:** Đã đăng nhập (UC-01).  
* **Luồng chính (Mời và tham gia Bộ thẻ chung):**  
  1. Người học (Chủ thẻ A) vào một bộ thẻ (UC-02), chọn tab "Thành viên".  
  2. Nhấn "Mời bạn học chung".  
  3. **Đầu vào:** Nhập email của Người học B.  
  4. **Đầu ra:** Hệ thống gửi một lời mời đến tài khoản của Người học B.  
  5. Người học B nhận thông báo, nhấn "Chấp nhận".  
  6. **Đầu ra:** Người học B bây giờ cũng thấy bộ thẻ này trong danh sách của mình (với tư cách thành viên).  
* **Luồng chính (Gửi lời thách đấu):**  
  1. Người học A vào bộ thẻ chung, tab "Thành viên", thấy danh sách thành viên.  
  2. **Đầu vào:** Nhấn nút "Thách đấu" bên cạnh tên Người học B.  
  3. **Đầu ra:** Hệ thống tự động tạo 1 bài quiz (VD: 10 câu ngẫu nhiên) từ bộ thẻ. Hệ thống tạo một bản ghi "Thách đấu" với trạng thái "Đang chờ" và thời hạn 24 giờ. Một thông báo được gửi cho Người học B.  
* **Luồng chính (Đáp trả thách đấu):**  
  1. Người học B nhận thông báo "A vừa thách đấu bạn\!".  
  2. **Đầu vào:** Người học B nhấn "Chấp nhận" (trong vòng 24h).  
  3. Hệ thống hiển thị bài quiz 10 câu. Người học B hoàn thành bài quiz.  
  4. **Đầu ra:** Hệ thống chấm điểm, so sánh kết quả (điểm số, thời gian) để xác định người thắng. Hệ thống gửi thông báo kết quả cuối cùng cho cả A và B.  
* **Luồng ngoại lệ:** Nếu Người học B không chấp nhận trong 24h. Một quy trình tự động của hệ thống sẽ quét và cập nhật trạng thái thách đấu thành "Hết hạn". Người học A (người thách đấu) được xử thắng.

## **7\. Đặc tả Use Case "UC-07: Tương tác Cộng đồng"**

* **Mã UC:** UC-07  
* **Tên UC:** Tương tác Cộng đồng (Mnemonic Lab)  
* **Tác nhân:** Người học  
* **Mô tả:** Cho phép Người học đóng góp và bầu chọn các mẹo ghi nhớ (mnemonics) cho từng thẻ từ vựng cụ thể.  
* **Điều kiện tiên quyết:** Đã đăng nhập (UC-01).  
* **Luồng chính (Xem và Bầu chọn \<\<extend\>\>):**  
  1. Khi Người học đang xem một thẻ (trong UC-02, UC-03, UC-04, hoặc UC-05), **ví dụ:** thẻ "Garrulous".  
  2. Người học \<\<extend\>\> bằng cách nhấn vào tab "Mẹo ghi nhớ".  
  3. **Đầu ra:** Hệ thống hiển thị danh sách các mẹo do cộng đồng tạo cho từ "Garrulous", sắp xếp theo lượt bầu chọn. **Ví dụ:** "Nhớ: Gà (Ga) mà kêu rù rù (rru) là con gà lắm mồm (lous)".  
  4. **Đầu vào:** Người học thấy mẹo hay, nhấn "Upvote".  
  5. **Đầu ra:** Hệ thống cập nhật tổng số lượt bầu chọn cho mẹo ghi nhớ đó và sắp xếp lại danh sách.  
* **Luồng rẽ nhánh (Đóng góp Mnemonic \<\<extend\>\>):**  
  1. Tại bước 3, Người học nhấn "Đóng góp mẹo của bạn".  
  2. Hệ thống hiển thị một ô văn bản.  
  3. **Đầu vào:** Người học nhập mẹo ghi nhớ của mình \-\> Nhấn "Đăng".  
  4. **Đầu ra:** Hệ thống lưu mẹo ghi nhớ mới, liên kết nó với thẻ từ vựng và người đóng góp, sau đó hiển thị nó trong danh sách chung.

## **8\. Đặc tả Use Case "UC-08: Theo dõi Tiến độ"**

* **Mã UC:** UC-08  
* **Tên UC:** Theo dõi Tiến độ (Progress Tracking)  
* **Tác nhân:** Người học  
* **Mô tả:** Cung cấp cho Người học một Bảng điều khiển cá nhân hóa, hiển thị các số liệu thống kê về quá trình học tập của họ.  
* **Điều kiện tiên quyết:** Đã đăng nhập (UC-01).  
* **Luồng sự kiện chính:**  
  1. **Đầu vào:** Người học truy cập vào trang "Hồ sơ" hoặc "Tiến độ".  
  2. Hệ thống truy vấn cơ sở dữ liệu học tập để tổng hợp các số liệu thống kê.  
  3. **Đầu ra:** Hệ thống hiển thị một trang tổng quan, bao gồm:  
     * **Số thẻ cần ôn hôm nay:** (VD: 12 thẻ).  
     * **Tổng số từ đã học:** (VD: 150 từ).  
     * **Chuỗi ngày học liên tiếp (Study Streak):** (VD: 7 ngày).  
     * **Biểu đồ hoạt động:** Biểu đồ cột hiển thị số thẻ đã ôn tập trong 7 ngày qua.

