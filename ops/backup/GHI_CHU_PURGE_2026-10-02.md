# Ghi chú đợt dọn dữ liệu giả lập — 02/10/2026

Mục tiêu: bỏ toàn bộ dữ liệu demo/giả lập khỏi **production (Supabase `viettrek`)** để hệ thống sẵn sàng chạy
thực tế — chỉ giữ lại 6 homestay thật nhập từ file `Mo_ta_Homestay_BA_da_dien.xlsx`.

## Đã xóa (tất cả trong 1 transaction, có COMMIT)

| Nhóm | Số dòng | Chi tiết |
|---|---|---|
| Booking demo + phụ thuộc | 32 booking, 86 đêm, 102 lịch sử trạng thái, 17 giao dịch thanh toán, 2 hoàn tiền, 14 hạn phản hồi, 2 đánh giá đơn | Toàn bộ mã `VJ-D77xxx` |
| Đánh giá (review) | 10 | Gắn với booking demo |
| Homestay demo (place 1–10) | 10 place, 20 loại phòng, 20 liên hệ, 10 profile, 53 dòng tồn kho, 20 giường… | Đồi Mâm Xôi, Chế Cu Nha, Mây, Nậm Khắt, Tây Bắc Trails, Tú Lệ Xanh, Suối Giàng, Khau Phạ, Sơn Thủy, Púng Luông |
| NCC demo | 12 provider (id 1–12, `demo-ncc*`, Chill Hill, Kiểm Thử UX) | |
| Tài khoản demo | 22 account: `demo-admin01-10`, `demo-ncc01-10`, `demo-hoso08`, `testux.ncc` | |
| Khách demo | 11 traveler: `demo-khach01-10`, `testux.kiemthu+demo` | |
| Hồ sơ NCC demo | 13 provider_application (id 1–13) | Giữ 6 hồ sơ thật (14–19) |
| Yêu cầu thay đổi demo | 10 partner_change_request | Giữ 10 của 6 homestay thật (xuất bản + chuẩn hóa) |
| Thông báo + token | 180 notification, 1 password_reset_token | Inbox về trạng thái rỗng |
| Ảnh mồ côi | 1 media_asset | |

Sau đó đã test end-to-end luồng đặt phòng trên hệ thống sạch (đặt 1 phòng → tồn kho 3→2 → hủy → hoàn 3)
rồi **dọn sạch booking kiểm thử** khỏi DB.

## Đã giữ lại

- **6 homestay thật** (place 11–16) + 16 loại phòng + giá + ảnh placeholder + chính sách.
- **7 tài khoản**: `admin@dulichso.vn` (ADMIN thật) + 6 NCC thật đăng nhập bằng SĐT (xem DEPLOY.md 0.3).
- **13 tài khoản khách Google thật** (người dùng đã từng đăng nhập) — không phải dữ liệu giả lập.
- **Dữ liệu danh mục hệ thống**: 19 khu vực, 9 danh mục, 13 tiện nghi, mẫu thông báo, cổng thanh toán,
  audit_log (vết vận hành), Liquibase changelog.

## Backup & khôi phục

- Backup toàn bộ 51 bảng **trước khi xóa**: `ops/backup/supabase-pre-purge-2026-10-02.tar.gz`
  (đã .gitignore vì chứa password hash). Mỗi bảng một file CSV (COPY format).
- Khôi phục một bảng (ví dụ `booking`):
  1. Giải nén: `tar xzf supabase-pre-purge-2026-10-02.tar.gz booking.csv`
  2. Kết nối DB (host/username xem DEPLOY.md mục 6, mật khẩu `SUPABASE_DB_PASSWORD` trong
     `backend-api/.env.deploy.local`) rồi: `TRUNCATE booking;` và `\copy booking FROM 'booking.csv' WITH (FORMAT csv, HEADER true)`

## Kết quả kiểm chứng sau dọn (02/10/2026)

- API công khai: đúng **6 homestay** (Anh Túc, New Highland, Trai Bản, Hoa Sơn Trà, Baan Mali, Hoà Thảo);
  trang `/homestays` hiển thị "6 chỗ nghỉ", không còn homestay demo.
- Home API: 6 homestays; phần điểm đến / đặc sản rỗng (dữ liệu này vốn là demo — sẽ nạp nội dung thật sau).
- Đăng nhập Admin + NCC hoạt động bình thường; đặt phòng trừ/hoàn phòng đúng.
