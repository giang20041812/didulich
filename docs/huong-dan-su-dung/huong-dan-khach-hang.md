# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG — PHÂN HỆ KHÁCH HÀNG (DU KHÁCH)

> **Hướng dẫn chi tiết kèm hình ảnh thực tế: Tìm & Đặt phòng Homestay, Quét QR Nhận phòng, Lập lịch trình thông minh, Khám phá Văn hóa – Ẩm thực – Combo & Cứu hộ SOS**

---


## TỔNG QUAN PHÂN HỆ KHÁCH HÀNG (DU KHÁCH)

Phân hệ Khách hàng (Du khách — Traveler) của nền tảng Đi Du Lịch (Viettrek) được xây dựng theo kiến trúc ứng dụng web tiến bộ (PWA) tối ưu cho cả máy tính và điện thoại di động, hỗ trợ du khách xuyên suốt 3 giai đoạn của chuyến đi: Trước chuyến đi (Khám phá điểm đến, Lên lịch trình tự động, Đặt phòng Homestay, Đặt gói Combo), Trong chuyến đi (Quét mã QR nhận phòng, Nhận gợi ý dịch vụ quanh vị trí đang đứng, Xem cẩm nang & gửi tín hiệu SOS khẩn cấp khi cần), và Sau chuyến đi (Viết đánh giá, Chia sẻ hành trình đã đi).


### 1. Danh sách Tài khoản Kiểm thử (Test Accounts)

| Vai trò | Tài khoản đăng nhập (Email / SĐT) | Mật khẩu | Ghi chú sử dụng |
| --- | --- | --- | --- |
| Khách du lịch (Đã đăng ký kiểm thử) | khachhang.test@dulichso.vn hoặc SĐT: 0988123456 | Password123! | Tài khoản khách du lịch mẫu (Nguyễn Minh Anh). Bạn cũng có thể tự đăng ký tài khoản mới bất kỳ tại trang /register hoặc đăng nhập nhanh bằng Google. |
| Nhà cung cấp (NCC 1 — Mùa Vàng) | 0964599613 | 12345678 | Hộ kinh doanh homestay Mùa Vàng (test luồng khởi tạo cơ sở mới). |
| Nhà cung cấp (NCC 2 — Anh Túc) | 0963000708 | 12345678 | Homestay Anh Túc (Place ID #11) — nơi nhận đơn đặt phòng của khách hàng. |
| Quản trị viên (Admin) | admin@dulichso.vn | 12345678 | Quản trị viên Cấp 1 — Quản lý toàn bộ hệ thống tại /admin. |


## ĐĂNG KÝ TÀI KHOẢN, ĐĂNG NHẬP & QUẢN LÝ HỒ SƠ CÁ NHÂN


### 1. Tự đăng ký tài khoản Du khách mới (/register — TV-01)

Du khách có thể xem tất cả thông tin điểm đến, homestay và tạo thử lịch trình mà không cần đăng nhập. Tuy nhiên, để Đặt phòng, Lưu lịch trình hoặc Quét QR nhận phòng, du khách cần tạo tài khoản tại đường dẫn /register:

1. **Chọn phương thức đăng ký: **Tại trang /register, bạn có thể bấm nút "Tiếp tục với Google" để đăng ký 1 chạm bằng tài khoản Google (nếu lần đầu đăng nhập bằng Google, hệ thống sẽ hiện hộp thoại yêu cầu bổ sung Số điện thoại di động để chủ nhà liên hệ khi đặt phòng), hoặc điền biểu mẫu đăng ký trực tiếp.
2. **Điền thông tin cá nhân: **Nhập Họ và tên đầy đủ, Địa chỉ Email và Số điện thoại di động Việt Nam (10 số bắt đầu bằng 03, 05, 07, 08, 09). Hệ thống tự động kiểm tra định dạng và báo lỗi ngay nếu Email/SĐT đã được đăng ký trước đó.
3. **Tạo mật khẩu an toàn: **Nhập mật khẩu tối thiểu 8 ký tự (thanh đo độ mạnh mật khẩu sẽ chuyển sang màu xanh khi kết hợp chữ hoa, chữ số và ký tự đặc biệt) và nhập lại mật khẩu xác nhận.
4. **Hoàn tất: **Bấm "Tạo tài khoản". Hệ thống tự động đăng nhập và chuyển bạn về trang trước đó.

![Hình 1: Giao diện Tự đăng ký tài khoản Khách du lịch (/register) với thanh đánh giá độ mạnh mật khẩu](./images/khach-hang/01_customer_register.png)
*Hình 1: Giao diện Tự đăng ký tài khoản Khách du lịch (/register) với thanh đánh giá độ mạnh mật khẩu*


### 2. Đăng nhập & Khôi phục mật khẩu qua OTP Email (/login — TV-02, TV-03)

1. **Đăng nhập hợp nhất: **Truy cập /login, nhập Email hoặc Số điện thoại (VD: khachhang.test@dulichso.vn hoặc 0988123456) và mật khẩu, sau đó bấm "Đăng nhập".
2. **Khôi phục mật khẩu (Quên mật khẩu): **Nếu quên mật khẩu, bấm liên kết "Quên mật khẩu?" ngay trên ô nhập mật khẩu. Nhập Email hoặc Số điện thoại của bạn để nhận mã OTP 6 chữ số gửi về hộp thư điện tử (hiệu lực trong 10 phút), sau đó nhập mã OTP kèm mật khẩu mới để hoàn tất đặt lại.

![Hình 2: Giao diện Đăng nhập dành cho Du khách (/login)](./images/khach-hang/02_customer_login.png)
*Hình 2: Giao diện Đăng nhập dành cho Du khách (/login)*

![Hình 3: Hộp thoại Quên mật khẩu — Gửi mã xác thực OTP qua Email để đặt lại mật khẩu](./images/khach-hang/02b_customer_forgot_password_modal.png)
*Hình 3: Hộp thoại Quên mật khẩu — Gửi mã xác thực OTP qua Email để đặt lại mật khẩu*


### 3. Quản lý Thông tin cá nhân & Đổi mật khẩu (/profile — TV-04)

Sau khi đăng nhập, bấm vào biểu tượng chữ cái tên bạn ở góc trên bên phải (hoặc mở menu ngăn kéo ☰ bên trái -> bấm "Thông tin cá nhân") để vào trang Hồ sơ cá nhân (/profile). Tại đây bạn có thể cập nhật Họ tên, Số điện thoại liên hệ và Đổi mật khẩu.

![Hình 4: Trang Quản lý Thông tin cá nhân và Đổi mật khẩu của Du khách (/profile)](./images/khach-hang/22_customer_profile.png)
*Hình 4: Trang Quản lý Thông tin cá nhân và Đổi mật khẩu của Du khách (/profile)*


## TRANG CHỦ, ĐIỀU HƯỚNG & TÌM KIẾM HOMESTAY


### 1. Trang chủ & Thanh tìm kiếm thông minh (/ — PUB-01)

Trang chủ cung cấp cái nhìn toàn cảnh về vẻ đẹp ruộng bậc thang, văn hóa bản địa và các dịch vụ nổi bật:

- **Thanh điều hướng cố định trên đỉnh (Header): **Chuyển nhanh giữa 9 chuyên mục: Trang chủ, Lưu trú, Lịch trình, Du lịch (Điểm đến), Đặc sản, Di chuyển, Văn hóa (Lễ hội & Trải nghiệm), Nhà hàng, Dịch vụ & Tiện ích. Bên phải có Chuông thông báo đơn đặt phòng và Menu tài khoản.
- **Khung tìm kiếm Homestay trung tâm: **Chọn Điểm đến, Ngày nhận phòng – Ngày trả phòng (tự tính số đêm lưu trú) và Số lượng khách, sau đó bấm "Tìm homestay" hoặc bấm nút phụ "Hoặc lên lịch trình trước →".
- **Menu ngăn kéo (Drawer Menu ☰): **Khi bấm biểu tượng 3 gạch ngang ở góc trái trên cùng, menu mở ra các lối tắt cá nhân: Lịch trình của tôi, Đơn đặt phòng, Chỗ nghỉ đã lưu, Cẩm nang du khách, Cài đặt ứng dụng và công tắc bật/tắt "Gợi ý quanh đây".

![Hình 5: Trang chủ Đi Du Lịch (/) với khung tìm kiếm Homestay theo ngày và số khách](./images/khach-hang/03_home_hero_and_search.png)
*Hình 5: Trang chủ Đi Du Lịch (/) với khung tìm kiếm Homestay theo ngày và số khách*

![Hình 6: Các chuyên mục khám phá điểm đến, trải nghiệm văn hóa và chỗ nghỉ nổi bật trên Trang chủ](./images/khach-hang/03b_home_sections.png)
*Hình 6: Các chuyên mục khám phá điểm đến, trải nghiệm văn hóa và chỗ nghỉ nổi bật trên Trang chủ*

![Hình 7: Menu ngăn kéo bên trái (☰) với nhóm mục 'Của tôi' và lối tắt tới Kênh Đối tác](./images/khach-hang/04_customer_sidebar_drawer.png)
*Hình 7: Menu ngăn kéo bên trái (☰) với nhóm mục 'Của tôi' và lối tắt tới Kênh Đối tác*


### 2. Danh sách Homestay, Bộ lọc nâng cao & Bản đồ toàn màn hình (/homestays, /map — PUB-02, PUB-03)

Tại chuyên mục "Lưu trú" (/homestays), du khách dễ dàng tìm kiếm và so sánh các homestay bản địa:

1. **Lọc & Tìm kiếm: **Tìm theo từ khóa tên homestay, lọc theo khoảng giá mỗi đêm, số lượng khách, tiện nghi (Wi-Fi, nước nóng, ăn sáng, view ruộng bậc thang...) hoặc bấm lọc các "Chỗ nghỉ đã lưu" (biểu tượng trái tim).
2. **Chuyển sang Bản đồ tương tác (/map): **Bấm nút xem Bản đồ để mở giao diện bản đồ toàn màn hình. Trên bản đồ hiển thị trực tiếp các nhãn giá tiền tại đúng vị trí GPS của từng homestay; bấm vào nhãn giá để xem thẻ tóm tắt và chỉ đường.

![Hình 8: Trang Danh sách Homestay (/homestays) với bộ lọc khoảng giá, tiện nghi và sắp xếp](./images/khach-hang/05_homestay_list_filter.png)
*Hình 8: Trang Danh sách Homestay (/homestays) với bộ lọc khoảng giá, tiện nghi và sắp xếp*

![Hình 9: Giao diện Bản đồ tương tác toàn màn hình (/map) hiển thị vị trí các Homestay và điểm tham quan](./images/khach-hang/06_fullscreen_map.png)
*Hình 9: Giao diện Bản đồ tương tác toàn màn hình (/map) hiển thị vị trí các Homestay và điểm tham quan*


### 3. Xem Chi tiết Homestay, Khám phá quanh Homestay & Đánh giá (/homestays/:id — PUB-04)

Khi bấm vào một Homestay (ví dụ: Homestay Anh Túc — /homestays/11), trang chi tiết cung cấp đầy đủ thông tin minh bạch để du khách ra quyết định:

- **Thư viện ảnh & Thông tin chung: **Xem bộ ảnh thực tế của cơ sở, địa chỉ cụ thể, khoảng cách tới trung tâm, nút "Chia sẻ" và nút "Lưu" vào danh sách yêu thích.
- **Danh sách Hạng phòng & Giá theo ngày: **Hiển thị từng loại phòng (Phòng đơn, Phòng đôi, Nhà sàn tập thể...), sức chứa tối đa, giá ngày thường và giá cuối tuần, giờ nhận/trả phòng và số phòng còn trống.
- **Khám phá quanh Homestay (Explore Around Homestay): **Tự động liệt kê các địa điểm ăn uống, điểm check-in, thác nước, đồi chè nằm trong bán kính quanh homestay kèm khoảng cách km chính xác.
- **Chính sách lưu trú & Đánh giá thực tế: **Xem rõ quy định hủy phòng, quy định trẻ em/vật nuôi và đọc các đánh giá có gắn nhãn "Đã lưu trú" của khách trước cùng phản hồi từ chủ nhà.

![Hình 10: Trang Chi tiết Homestay (/homestays/11) — Ảnh bìa, địa chỉ và khu vực Chọn phòng & Xem giá](./images/khach-hang/07_homestay_detail_top.png)
*Hình 10: Trang Chi tiết Homestay (/homestays/11) — Ảnh bìa, địa chỉ và khu vực Chọn phòng & Xem giá*

![Hình 11: Chi tiết các hạng phòng, tiện nghi và bản đồ vị trí trên trang Chi tiết Homestay](./images/khach-hang/07b_homestay_detail_rooms_and_explore.png)
*Hình 11: Chi tiết các hạng phòng, tiện nghi và bản đồ vị trí trên trang Chi tiết Homestay*

![Hình 12: Khu vực Chính sách lưu trú và Đánh giá thực tế từ du khách tại Homestay](./images/khach-hang/07c_homestay_detail_reviews_and_policies.png)
*Hình 12: Khu vực Chính sách lưu trú và Đánh giá thực tế từ du khách tại Homestay*


## ĐẶT PHÒNG, QUẢN LÝ ĐƠN, QUÉT QR NHẬN PHÒNG & VIẾT ĐÁNH GIÁ


### 1. Quy trình Đặt phòng Homestay (/booking — TV-05)

Sau khi chọn hạng phòng tại trang chi tiết Homestay và bấm "Chọn phòng", du khách được chuyển tới trang Đặt chỗ độc lập (/booking):

1. **Điền thông tin Liên hệ đặt chỗ: **Hệ thống tự động điền sẵn Họ tên, Số điện thoại và Email từ tài khoản đang đăng nhập của bạn. Bạn có thể sửa lại tên khách lưu trú thực tế nếu đặt hộ người thân.
2. **Chọn ngày Nhận phòng – Trả phòng & Số lượng phòng: **Chọn trực tiếp trên lịch trực quan (các ngày còn phòng hiện chữ "Trống" màu xanh, ngày hết phòng bị gạch chéo). Chọn số lượng phòng muốn đặt và số lượng khách.
3. **Gắn Lịch trình chuyến đi (Tùy chọn): **Nếu bạn đã tạo lịch trình trên hệ thống, bạn có thể đính kèm lịch trình đó vào đơn đặt phòng để chủ Homestay nắm được giờ đến và hỗ trợ đón tiếp chu đáo hơn.
4. **Kiểm tra Chi tiết giá & Gửi yêu cầu đặt phòng: **Cột bên phải hiển thị bảng tính giá minh bạch theo từng đêm (tự động tách giá ngày thường, cuối tuần hoặc ngày lễ). Du khách chưa cần thanh toán ngay lúc gửi đơn — sau khi chủ nhà xác nhận còn phòng, bạn sẽ nhận được thông báo để tiến hành thanh toán.

![Hình 13: Trang Đặt phòng (/booking) với lịch kiểm tra phòng trống trực tiếp và bảng tính giá minh bạch](./images/khach-hang/08_booking_checkout_page.png)
*Hình 13: Trang Đặt phòng (/booking) với lịch kiểm tra phòng trống trực tiếp và bảng tính giá minh bạch*


### 2. Quản lý Đơn đặt phòng của tôi, Thanh toán & Hủy đơn (/bookings — TV-06, TV-07, TV-08)

Truy cập mục "Đơn đặt phòng" (/bookings) để theo dõi trạng thái xử lý theo thời gian thực (trang tự động cập nhật ngay khi chủ nhà hoặc Admin duyệt đơn mà không cần tải lại trang):

| Tab trạng thái | Ý nghĩa | Thao tác của Du khách |
| --- | --- | --- |
| 1. Chờ xác nhận (PENDING) | Đơn vừa gửi, đang chờ chủ Homestay kiểm tra và xác nhận giữ phòng. | Có thể xem chi tiết đơn hoặc bấm "Hủy đơn" nếu đổi kế hoạch. |
| 2. Chờ thanh toán (CONFIRMED) | Chủ Homestay đã xác nhận giữ phòng cho bạn. | Xem hướng dẫn chuyển khoản/thanh toán qua Zalo hoặc tại quầy; bấm xác nhận khi đã thanh toán. |
| 3. Đã thanh toán (PAID) | Đơn đã hoàn tất thanh toán, sẵn sàng nhận phòng. | • Khi tới homestay: Quét mã QR hoặc nhập mã 8 ký tự để Nhận phòng (Check-in). • Sau chuyến đi: Bấm nút "Viết đánh giá" để chấm sao và chia sẻ cảm nhận. |
| 4. Đã hủy (CANCELLED) | Đơn đã bị hủy bởi khách hoặc bị từ chối bởi chủ nhà (kèm lý do). | Có thể bấm "Đặt lại" để tạo đơn mới. |

![Hình 14: Trang Quản lý Đơn đặt phòng của tôi (/bookings) với 5 tab trạng thái và bộ lọc ngày](./images/khach-hang/09_my_bookings_list.png)
*Hình 14: Trang Quản lý Đơn đặt phòng của tôi (/bookings) với 5 tab trạng thái và bộ lọc ngày*


### 3. Quét mã QR Nhận phòng 1 chạm tại Homestay (/qr/:code — TV-09)

Khi đến Homestay vào ngày nhận phòng, thay vì phải làm thủ tục giấy tờ lâu, du khách chỉ cần:

1. **Quét mã QR tại bàn lễ tân: **Mở camera điện thoại quét tấm Poster QR khổ A5 đặt tại quầy lễ tân (hoặc truy cập đường dẫn /qr/MÃ-8-KÝ-TỰ in dưới mã QR, ví dụ: /qr/9W8746JX của Homestay Anh Túc).
2. **Xem thông tin đơn tại Homestay: **Trang nhận phòng hiển thị ảnh bìa, tên Homestay, địa chỉ và đơn đặt phòng hợp lệ của bạn tại cơ sở đó.
3. **Bấm nút "Nhận phòng": **Chỉ với 1 chạm, hệ thống ghi nhận bạn đã Check-in thành công. Khi hết giờ trả phòng vào ngày cuối, hệ thống sẽ tự động chuyển trạng thái hoàn tất chuyến ở.

![Hình 15: Giao diện Quét mã QR Nhận phòng tại Homestay Anh Túc (/qr/9W8746JX)](./images/khach-hang/10_qr_checkin_page.png)
*Hình 15: Giao diện Quét mã QR Nhận phòng tại Homestay Anh Túc (/qr/9W8746JX)*


## LÊN LỊCH TRÌNH CHUYẾN ĐI, KHÁM PHÁ VĂN HÓA, ẨM THỰC & COMBO


### 1. Trung tâm Lịch trình & Công cụ Lập lịch trình theo giờ (/lich-trinh, /lich-trinh/tao — TV-11..TV-17)

Tính năng "Lịch trình" giúp du khách tự thiết kế lộ trình đi chơi chi tiết theo từng khung giờ hoặc sao chép lịch trình thực tế từ những du khách đã đi trước:

1. **Khám phá lịch trình cộng đồng (/lich-trinh): **Tại tab "Khám phá", bạn xem được các lịch trình công khai có gắn nhãn "Đã đi" của du khách khác. Bấm vào bất kỳ lịch trình nào để xem chi tiết từng ngày và bấm "Áp dụng cho chuyến của tôi".
2. **Tự tạo lịch trình mới (/lich-trinh/tao): **Bấm nút "+ Tạo lịch trình", chọn thời lượng chuyến đi (VD: 2N1Đ hoặc 3N2Đ). Hệ thống lập tức gợi ý lộ trình mẫu theo từng buổi (Sáng, Trưa, Chiều, Tối). Bạn có thể thêm/bớt điểm tham quan, đổi giờ, ghi chú chi phí dự kiến rồi bấm "Lưu lịch trình".
3. **Quản lý Lịch trình của tôi & Check-in điểm đến (/lich-trinh?tab=cua-toi): **Tại tab "Của tôi", bạn quản lý các lịch trình Sắp đi / Đang đi / Đã đi, tạo liên kết chia sẻ công khai (/j/:token) cho bạn bè cùng đoàn, và bấm Check-in kèm ảnh/lưu bút tại từng địa điểm bạn đặt chân tới.

![Hình 16: Trung tâm Lịch trình (/lich-trinh) — Tab Khám phá các lịch trình thực tế do du khách chia sẻ](./images/khach-hang/11_trips_hub_explore.png)
*Hình 16: Trung tâm Lịch trình (/lich-trinh) — Tab Khám phá các lịch trình thực tế do du khách chia sẻ*

![Hình 17: Trung tâm Lịch trình (/lich-trinh?tab=cua-toi) — Tab quản lý Lịch trình của tôi và các nơi đã Check-in](./images/khach-hang/11b_trips_hub_mine.png)
*Hình 17: Trung tâm Lịch trình (/lich-trinh?tab=cua-toi) — Tab quản lý Lịch trình của tôi và các nơi đã Check-in*

![Hình 18: Công cụ Tạo lịch trình thông minh (/lich-trinh/tao) tự động gợi ý lộ trình theo khung giờ 2N1Đ / 3N2Đ](./images/khach-hang/12_trip_planner_builder.png)
*Hình 18: Công cụ Tạo lịch trình thông minh (/lich-trinh/tao) tự động gợi ý lộ trình theo khung giờ 2N1Đ / 3N2Đ*


### 2. Khám phá Điểm đến, Văn hóa – Lễ hội, Nhà hàng & Đặc sản (PUB-05..PUB-09)

Hệ thống cung cấp kho dữ liệu bản địa phong phú, được biên tập và xác minh tọa độ kỹ lưỡng:

- **Du lịch / Điểm đến (/destinations): **Danh sách các danh thắng, đồi mâm xôi, thác nước, bản làng kèm bộ lọc theo khu vực và mùa đẹp nhất trong năm.
- **Văn hóa & Trải nghiệm (/experiences): **Giới thiệu các lễ hội truyền thống, chợ phiên vùng cao và các hoạt động trải nghiệm bản địa do người dân địa phương tổ chức.
- **Nhà hàng & Quán ăn (/restaurants): **Tra cứu các nhà hàng, quán ăn bản địa kèm giờ mở cửa, số điện thoại liên hệ và chỉ đường GPS.
- **Đặc sản vùng cao (/specialties): **Cẩm nang các món ăn đặc sản (cơm lam, xôi ngũ sắc, cá tầm, thịt trâu gác bếp, trà Shan tuyết...) kèm gợi ý nơi thưởng thức hoặc mua làm quà.

![Hình 19: Chuyên mục Điểm đến du lịch (/destinations)](./images/khach-hang/14_destinations_list.png)
*Hình 19: Chuyên mục Điểm đến du lịch (/destinations)*

![Hình 20: Chuyên mục Văn hóa, Lễ hội & Trải nghiệm bản địa (/experiences)](./images/khach-hang/13_culture_and_experiences.png)
*Hình 20: Chuyên mục Văn hóa, Lễ hội & Trải nghiệm bản địa (/experiences)*

![Hình 21: Chuyên mục Nhà hàng & Ẩm thực địa phương (/restaurants)](./images/khach-hang/15_restaurants_food.png)
*Hình 21: Chuyên mục Nhà hàng & Ẩm thực địa phương (/restaurants)*

![Hình 22: Chuyên mục Đặc sản vùng cao (/specialties)](./images/khach-hang/16_specialties_dishes.png)
*Hình 22: Chuyên mục Đặc sản vùng cao (/specialties)*


### 3. Đặt Gói Combo trọn gói, Tra cứu Xe di chuyển & Tiện ích (/combo, /transport, /services — PUB-10, TV-18)

- **Gói Combo tiết kiệm (/combo): **Tổng hợp các gói kết hợp Lưu trú + Xe đưa đón + Trải nghiệm bản địa. Du khách chọn gói Combo phù hợp, xem lịch trình chi tiết và điền biểu mẫu "Gửi yêu cầu đặt Combo" (Họ tên, SĐT, Ngày đi dự kiến, Số khách) để Nhà cung cấp liên hệ tư vấn trực tiếp.
- **Di chuyển (/transport): **Tra cứu thông tin các tuyến xe khách giường nằm, xe Limousine, xe ôm bản địa và điểm thuê xe máy tự lái.
- **Dịch vụ & Tiện ích (/services): **Tra cứu nhanh vị trí cây xăng, hiệu thuốc, trạm y tế, điểm rút tiền ATM, tiệm sửa xe và dịch vụ chụp ảnh.

![Hình 23: Trang Danh sách Gói Combo du lịch trọn gói (/combo)](./images/khach-hang/17_combos_list.png)
*Hình 23: Trang Danh sách Gói Combo du lịch trọn gói (/combo)*

![Hình 24: Chuyên mục Di chuyển — Tra cứu xe khách, Limousine, xe ôm bản địa và thuê xe máy (/transport)](./images/khach-hang/18_transport_services.png)
*Hình 24: Chuyên mục Di chuyển — Tra cứu xe khách, Limousine, xe ôm bản địa và thuê xe máy (/transport)*

![Hình 25: Chuyên mục Dịch vụ & Tiện ích thiết yếu cho du khách (/services)](./images/khach-hang/19_utility_services.png)
*Hình 25: Chuyên mục Dịch vụ & Tiện ích thiết yếu cho du khách (/services)*


## CẨM NANG AN TOÀN, HỖ TRỢ KHẨN CẤP SOS & CÀI ĐẶT ỨNG DỤNG PWA


### 1. Cẩm nang du khách & Gửi yêu cầu Hỗ trợ Khẩn cấp SOS (/cam-nang — PUB-11, TV-20)

Tại trang "Cẩm nang du khách" (/cam-nang), bên cạnh các kinh nghiệm lựa chọn thời điểm đi, chuẩn bị trang phục và dự toán chi phí, hệ thống tích hợp nút màu đỏ nổi bật "Cần hỗ trợ khẩn cấp" ở góc phải:

1. **Bấm nút "Cần hỗ trợ khẩn cấp": **Mở hộp thoại Hỗ trợ khẩn cấp (SOS) ngay lập tức.
2. **Gọi nhanh đường dây nóng: **Hiển thị danh bạ khẩn cấp (Công an 113, Cứu hỏa 114, Cấp cứu y tế 115 và Ban quản lý du lịch địa phương) để bấm gọi trực tiếp trên điện thoại.
3. **Gửi tín hiệu SOS kèm định vị GPS: **Chọn loại sự cố (Tai nạn/Y tế, Lạc đường, Hỏng xe giữa đèo, Mất tài sản...), nhập Số điện thoại của bạn, bấm "Lấy vị trí hiện tại" để đính kèm tọa độ GPS chính xác và bấm "Gửi yêu cầu khẩn cấp". Tín hiệu sẽ lập tức phát cảnh báo đỏ và rung trên màn hình trực ban của Quản trị viên hệ thống.

![Hình 26: Trang Cẩm nang du lịch (/cam-nang) kèm nút đỏ 'Cần hỗ trợ khẩn cấp'](./images/khach-hang/20_travel_guide_and_sos.png)
*Hình 26: Trang Cẩm nang du lịch (/cam-nang) kèm nút đỏ 'Cần hỗ trợ khẩn cấp'*

![Hình 27: Hộp thoại Gửi tín hiệu Hỗ trợ Khẩn cấp (SOS) kèm tọa độ GPS và danh bạ khẩn cấp 1 chạm](./images/khach-hang/20b_sos_emergency_modal.png)
*Hình 27: Hộp thoại Gửi tín hiệu Hỗ trợ Khẩn cấp (SOS) kèm tọa độ GPS và danh bạ khẩn cấp 1 chạm*


### 2. Cài đặt Ứng dụng lên Màn hình chính Điện thoại & Sử dụng Ngoại tuyến (/download)

Đi Du Lịch hỗ trợ chuẩn Progressive Web App (PWA). Du khách truy cập /download (hoặc bấm thanh gợi ý cuối màn hình điện thoại) để cài đặt biểu tượng ứng dụng ra màn hình chính trên cả Android và iOS mà không cần qua kho ứng dụng. Khi đi vào vùng núi sóng yếu hoặc mất mạng, ứng dụng vẫn hiển thị thông báo chế độ Offline và cho phép xem lại lịch trình, mã đơn đặt phòng và số điện thoại chủ nhà đã lưu.

![Hình 28: Trang Hướng dẫn Cài đặt Ứng dụng Đi Du Lịch (PWA) lên điện thoại (/download)](./images/khach-hang/21_download_pwa_app.png)
*Hình 28: Trang Hướng dẫn Cài đặt Ứng dụng Đi Du Lịch (PWA) lên điện thoại (/download)*
