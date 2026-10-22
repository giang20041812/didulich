# Kế hoạch ý tưởng nâng cấp

Đây là các ý tưởng tôi đề xuất, **chưa làm**. Mỗi ý có lý do và mức công sức ước lượng: Nhỏ ≈ 1 buổi, Vừa ≈ 1–2 ngày, Lớn ≈ 3–5 ngày. Bạn chọn ý nào thì tôi làm ý đó.

## A. Tính năng cho khách

| # | Ý tưởng | Vì sao | Công sức |
| --- | --- | --- | --- |
| A1 | **Trang chi tiết riêng cho tuyến xe**: giờ chạy dạng lịch, số chỗ, điểm đón trên bản đồ, nút gọi / Zalo nhà xe | Hiện tuyến xe dùng trang địa điểm chung, chưa nổi bật giờ chạy | Vừa |
| A2 | **Theo dõi yêu cầu đặt combo** trong "Của tôi" (đã gửi, đã liên hệ, đã xong) | Khách gửi yêu cầu xong chưa có chỗ xem lại | Nhỏ |
| A3 | **Đặt combo có giữ chỗ và đặt cọc** qua thanh toán sẵn có | Hiện chỉ gửi yêu cầu, phải gọi lại mới chốt | Lớn |
| A4 | **Ghép combo vào "Lịch trình"**: khách chép lịch trình combo sang lịch trình của mình để chỉnh | Tận dụng trang Lịch trình đang có | Vừa |
| A5 | **"Gợi ý quanh đây" nhớ những gì khách đã xem** để lần sau không nhắc lại cùng một chỗ | Bớt làm phiền khi đi nhiều ngày | Nhỏ |
| A6 | **Chế độ ngoại tuyến cho lịch trình combo** (lưu sẵn bản đồ, giờ, số điện thoại) | Vùng núi sóng yếu | Vừa |

## B. Tính năng cho nhà cung cấp

| # | Ý tưởng | Vì sao | Công sức |
| --- | --- | --- | --- |
| B1 | **Lịch chạy xe theo ngày** (chuyến nào còn bao nhiêu chỗ) cho nhà xe | Sau này khách đặt chỗ xe trực tiếp | Lớn |
| B2 | **Thống kê "Gợi ý quanh đây"**: bao nhiêu lần gợi ý được hiện / được bấm (đếm ẩn danh, không lưu vị trí) | Nhà cung cấp biết gợi ý có hiệu quả không | Vừa |
| B3 | **Mẫu combo có sẵn** để nhà cung cấp chép rồi sửa | Đỡ mất công nhập từ đầu | Nhỏ |
| B4 | **Lịch sử thay đổi** của từng dịch vụ / combo (bản nào được duyệt lúc nào) | Minh bạch khi admin từ chối | Vừa |

## C. Cho admin

| # | Ý tưởng | Vì sao | Công sức |
| --- | --- | --- | --- |
| C1 | **Hàng chờ duyệt chung**: hồ sơ NCC, địa điểm, dịch vụ, combo, bản sửa trong một danh sách theo thời gian | Hiện mỗi loại duyệt ở một mục riêng | Vừa |
| C2 | **So sánh bản sửa từng dòng** (tô màu chỗ thay đổi) cho dịch vụ và combo | Duyệt nhanh, ít sót | Vừa |
| C3 | **Đánh dấu "điểm nổi tiếng"** thủ công cho "Gợi ý quanh đây" (hiện lấy tự động mọi điểm tham quan / check-in đã xác minh tọa độ) | Admin chủ động chọn nơi nhắc khách | Nhỏ |

## D. Giao diện và chuyển động

Nguyên tắc: giữ đúng màu, font, logo hiện có. Không thêm hiệu ứng lòe loẹt.

| # | Ý tưởng | Công sức |
| --- | --- | --- |
| D1 | Ảnh 3D cùng bộ Fluent Emoji cho các ô trống ("Chưa có combo nào", "Chưa có dịch vụ") ở các trang còn lại để đồng bộ với hộp chọn loại hình | Nhỏ |
| D2 | Đường lộ trình combo trên bản đồ (nối các điểm dừng theo ngày, bấm điểm thì cuộn tới ngày đó) | Vừa |
| D3 | Chuyển trang mượt giữa danh sách combo và chi tiết (ảnh bìa phóng ra tại chỗ) — chỉ khi máy không bật "giảm chuyển động" | Vừa |
| D4 | Thẻ "Gợi ý quanh đây" trượt nhẹ từ dưới lên và tự thu nhỏ thành nút tròn sau vài giây nếu khách không bấm | Nhỏ |

## E. Kỹ thuật cần làm sớm

| # | Việc | Vì sao |
| --- | --- | --- |
| E1 | Commit các thay đổi hiện tại thành từng phần (loại hình NCC, dịch vụ, gợi ý quanh đây, combo, số điện thoại) | Dễ xem lại và quay lui |
| E2 | Thêm bài kiểm tra giao diện tự động cho luồng đăng ký NCC và đặt combo | Tránh hỏng khi sửa sau này |
| E3 | Đưa ảnh dữ liệu mẫu (đang là ảnh minh họa) sang ảnh thật của địa phương | Trang trông thật hơn |

## Thứ tự tôi đề xuất

E1 → A2 → C1 → A1 → B2 → D2. Đây là những việc nhỏ đến vừa nhưng khách và admin thấy ngay.
