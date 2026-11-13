# Báo cáo đối chiếu — đợt nhập "DATA CHÍNH THỐNG"

- Nguồn: `Thư mục ảnh điểm đến` (dựng dataset ngày 2026-11-04) + 3 thư mục ảnh `ẢNH HOMESTAY MCC`, `ẢNH HOTEL - KHÁCH SẠN MCC`, `NHÀ HÀNG`.
- Đích: `aws-0-ap-northeast-2.pooler.supabase.com/postgres` — **đã ghi**.
- Quy ước: địa điểm mới có **data_verified = FALSE (chưa xác thực — chỉ là cờ để Admin theo dõi)**, `verification = UNVERIFIED`, hiển thị `PUBLISHED` (khách thấy ngay), không gắn nhà cung cấp.

## 1. Tóm tắt

| Loại | Tạo mới | Đã nhập trước đó | Trùng địa điểm đang có |
|---|---:|---:|---:|
| Điểm tham quan | 10 | 0 | 0 |
| Lễ hội (bảng festival) | 0 | 0 | 0 |

Ảnh cho địa điểm mới: **82** ảnh khác nhau (từ 85 file; bỏ 3 ảnh trùng nội dung, 0 ảnh vượt giới hạn 30/địa điểm).

## 2. Địa điểm tạo mới

| # | Loại | Tên | Khu vực | Giá tham khảo | Toạ độ | SĐT | Ảnh (file→khác nhau) | Nguồn dòng Excel |
|---:|---|---|---|---|---|---|---|---|
| 1 | Điểm tham quan | Hoa đào rừng La Pán Tẩn | La Pán Tẩn |  | — | — | 6→6 | (chỉ thư mục ảnh) |
| 2 | Điểm tham quan | Hoa đào rừng Móng Ngựa | Mù Cang Chải |  | — | — | 7→7 | (chỉ thư mục ảnh) |
| 3 | Điểm tham quan | Hú Chù Lìn | Mù Cang Chải |  | — | — | 15→15 | (chỉ thư mục ảnh) |
| 4 | Điểm tham quan | Mâm Xôi Lớn | La Pán Tẩn |  | — | — | 14→13 | (chỉ thư mục ảnh) |
| 5 | Điểm tham quan | Nhà Ngô | Mù Cang Chải |  | — | — | 4→4 | (chỉ thư mục ảnh) |
| 6 | Điểm tham quan | Rừng Trúc | Mù Cang Chải |  | — | — | 10→10 | (chỉ thư mục ảnh) |
| 7 | Điểm tham quan | Sống Lưng Khủng Long | Mù Cang Chải |  | — | — | 5→5 | (chỉ thư mục ảnh) |
| 8 | Điểm tham quan | Thác 7 Tầng | Mù Cang Chải |  | — | — | 4→4 | (chỉ thư mục ảnh) |
| 9 | Điểm tham quan | Võng Lúa Lao Chải | Lao Chải |  | — | — | 13→13 | (chỉ thư mục ảnh) |
| 10 | Điểm tham quan | Đèo Khau Phạ | Cao Phạ |  | — | — | 7→5 | (chỉ thư mục ảnh) |

### Ảnh giống hệt nhau giữa các địa điểm mới

Các cặp sau dùng chung ảnh (cùng nội dung file). Có thể là cùng một cơ sở đăng dưới hai tên — cần người xác nhận. Hệ thống lưu mỗi ảnh một lần và dùng lại cho cả hai.

- Hoa đào rừng Móng Ngựa ↔ Nhà Ngô: 2 ảnh

## 3. Dòng Excel đã có sẵn trong hệ thống (đối chiếu với DB)

| Sheet | Dòng | Tên trong Excel | Bản ghi trong hệ thống |
|---|---:|---|---|

## 4. Thư mục ảnh → nơi gắn

| Thư mục | Ảnh | Khác nhau | Video | Gắn vào | Ghi chú |
|---|---:|---:|---:|---|---|
| Hoa Đào Rừng La Pán Tẩn | 6 | 6 | 0 | hoa-dao-rung-la-pan-tan | đã có / bỏ qua |
| Hoa đào rừng Móng Ngựa | 7 | 7 | 0 | hoa-dao-rung-mong-ngua | đã có / bỏ qua |
| Hú Chù Lìn | 15 | 15 | 0 | hu-chu-lin | đã có / bỏ qua |
| Mâm Xôi Lớn | 14 | 13 | 0 | mam-xoi-lon | đã có / bỏ qua |
| Nhà Ngô | 4 | 4 | 6 | nha-ngo | đã có / bỏ qua |
| Rừng Trúc | 10 | 10 | 0 | rung-truc | đã có / bỏ qua |
| Sống Lưng Khủng Long | 5 | 5 | 0 | song-lung-khung-long | đã có / bỏ qua |
| Thác 7 Tầng | 4 | 4 | 0 | thac-7-tang | đã có / bỏ qua |
| Võng Lúa Lao Chải | 13 | 13 | 0 | vong-lua-lao-chai | đã có / bỏ qua |
| Đèo Khau Phạ | 7 | 5 | 0 | deo-khau-pha | đã có / bỏ qua |

### Video chưa nhập (6 file)

Hệ thống chỉ lưu và hiển thị ảnh cho địa điểm (place_media là ảnh), chưa có chỗ chứa video của địa điểm nên các file sau KHÔNG được nhập — cần quyết định hướng xử lý (vd đăng YouTube/TikTok rồi gắn link kênh).

- Nhà Ngô/IMG_1468.MOV
- Nhà Ngô/IMG_1469.MOV
- Nhà Ngô/IMG_1471.MOV
- Nhà Ngô/IMG_1474.MOV
- Nhà Ngô/IMG_1499.MOV
- Nhà Ngô/IMG_1503.MOV

## 5. Mỗi dòng Excel đi đâu (phủ 100% dòng có dữ liệu)

| Sheet | Số dòng | Tạo mới | Gộp | Đã có sẵn | Không có bảng đích |
|---|---:|---:|---:|---:|---:|

Chi tiết từng dòng: `coverage.json`.

## 6. Cảnh báo chất lượng dữ liệu cần người rà soát
