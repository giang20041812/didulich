# Báo cáo đối chiếu — đợt nhập "DATA CHÍNH THỐNG"

- Nguồn: `Tổng hợp thông tin ĐiMCC.xlsx` (dựng dataset ngày 2026-11-04) + 3 thư mục ảnh `ẢNH HOMESTAY MCC`, `ẢNH HOTEL - KHÁCH SẠN MCC`, `NHÀ HÀNG`.
- Đích: `aws-0-ap-northeast-2.pooler.supabase.com/postgres` — **đã ghi**.
- Quy ước: địa điểm mới có **data_verified = FALSE (chưa xác thực — chỉ là cờ để Admin theo dõi)**, `verification = UNVERIFIED`, hiển thị `PUBLISHED` (khách thấy ngay), không gắn nhà cung cấp.

## 1. Tóm tắt

| Loại | Tạo mới | Đã nhập trước đó | Trùng địa điểm đang có |
|---|---:|---:|---:|
| Lễ hội (bảng festival) | 0 | 0 | 0 |

Ảnh cho địa điểm mới: **0** ảnh khác nhau (từ 0 file; bỏ 0 ảnh trùng nội dung, 0 ảnh vượt giới hạn 30/địa điểm).

## 2. Địa điểm tạo mới

| # | Loại | Tên | Khu vực | Giá tham khảo | Toạ độ | SĐT | Ảnh (file→khác nhau) | Nguồn dòng Excel |
|---:|---|---|---|---|---|---|---|---|

### Bỏ qua (đã có)

- Homestay Anh Túc ↔ #118 "Homestay Anh Túc" — đã nhập ở lần chạy trước
- New Highland Hotel ↔ #119 "New Highland Hotel" — đã nhập ở lần chạy trước
- Homestay Mùa Vàng ↔ #120 "Homestay Mùa Vàng" — đã nhập ở lần chạy trước
- Trai Bản Homestay ↔ #121 "Trai Bản Homestay" — đã nhập ở lần chạy trước
- Hoa Sơn Tra Hotel ↔ #122 "Hoa Sơn Tra Hotel" — đã nhập ở lần chạy trước
- Nhà nghỉ Duy Vũ ↔ #123 "Nhà nghỉ Duy Vũ" — đã nhập ở lần chạy trước
- Baan Mali Homestay ↔ #124 "Baan Mali Homestay" — đã nhập ở lần chạy trước
- Homestay Hoà Thảo ↔ #125 "Homestay Hoà Thảo" — đã nhập ở lần chạy trước
- Homestay Bảo Lan ↔ #126 "Homestay Bảo Lan" — đã nhập ở lần chạy trước
- Cô Gái Thái Homestay ↔ #127 "Cô Gái Thái Homestay" — đã nhập ở lần chạy trước
- Mộc Homestay ↔ #128 "Mộc Homestay" — đã nhập ở lần chạy trước
- Bungalow Xuân Giang ↔ #129 "Bungalow Xuân Giang" — đã nhập ở lần chạy trước
- Hotel Thuật Hòa ↔ #130 "Hotel Thuật Hòa" — đã nhập ở lần chạy trước
- Chelly Hotel ↔ #131 "Chelly Hotel" — đã nhập ở lần chạy trước
- Đồi Đổi Gió ↔ #132 "Đồi Đổi Gió" — đã nhập ở lần chạy trước
- Mù Cang Chải Lu Trế ↔ #133 "Mù Cang Chải Lu Trế" — đã nhập ở lần chạy trước
- Mai Linh Hotel ↔ #134 "Mai Linh Hotel" — đã nhập ở lần chạy trước
- Homestay Hiền Quang ↔ #135 "Homestay Hiền Quang" — đã nhập ở lần chạy trước
- Hotel Moon 2 ↔ #136 "Hotel Moon 2" — đã nhập ở lần chạy trước

## 3. Dòng Excel đã có sẵn trong hệ thống (đối chiếu với DB)

| Sheet | Dòng | Tên trong Excel | Bản ghi trong hệ thống |
|---|---:|---|---|

## 4. Thư mục ảnh → nơi gắn

| Thư mục | Ảnh | Khác nhau | Video | Gắn vào | Ghi chú |
|---|---:|---:|---:|---|---|
| ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY ANH TÚC | 2 | 2 | 1 | homestay-anh-tuc | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/Newhightland hotel | 4 | 4 | 0 | new-highland-hotel | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY MÙA VÀNG | 2 | 2 | 0 | homestay-mua-vang | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/🍀ẢNH TRAI BẢN HOMESTAY | 8 | 8 | 2 | trai-ban-homestay | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/Hoa sơn tra | 2 | 2 | 0 | hoa-son-tra-hotel | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/ẢNH BAAN MA LÍ HOMESTAY | 3 | 3 | 0 | baan-mali-homestay | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY HOÀ THẢO | 6 | 6 | 0 | homestay-hoa-thao | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY CƯỜNG TÚ | 1 | 1 | 0 | địa điểm có sẵn "Homestay Cường Tú" | sẽ gắn thêm ảnh (--attach-existing) |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY BẢO LAN | 5 | 5 | 0 | homestay-bao-lan | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/ẢNH PÚ NHU HOUSE | 8 | 8 | 0 | địa điểm có sẵn "Pú Nhu Homestay" | sẽ gắn thêm ảnh (--attach-existing) |
| ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY | 12 | 12 | 8 | co-gai-thai-homestay | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/ẢNH MỘC HOMESTAY | 3 | 3 | 0 | moc-homestay | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/🍀ẢNH BULGALOW XUÂN GIANG | 4 | 4 | 0 | bungalow-xuan-giang | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/Chely Hotel | 1 | 1 | 0 | chelly-hotel | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/🍀Đồi đổi gió homestay | 2 | 2 | 0 | doi-doi-gio | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/Mai Linh Hotel | 3 | 3 | 1 | mai-linh-hotel | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/Homestay Hiền Quang | 2 | 2 | 0 | homestay-hien-quang | đã có / bỏ qua |

### Video chưa nhập (12 file)

Hệ thống chỉ lưu và hiển thị ảnh cho địa điểm (place_media là ảnh), chưa có chỗ chứa video của địa điểm nên các file sau KHÔNG được nhập — cần quyết định hướng xử lý (vd đăng YouTube/TikTok rồi gắn link kênh).

- ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY ANH TÚC/Video tổng quan/Bản sao của DJI_20260924161455_0473_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH TRAI BẢN HOMESTAY/Khuôn viên/1790145748415_1502186757383306822_g901265921353449247.mp4
- ẢNH HOMESTAY MCC/🍀ẢNH TRAI BẢN HOMESTAY/Video/Bản sao của 1790145622005_1502186757383306822_g901265921353449247.mp4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Dọc/DJI_20261015212327_0646_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015205017_0600_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015205748_0615_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015210239_0618_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015210306_0619_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015210343_0621_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015211803_0639_D.MP4
- ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY/Home Cô Gái Thái/Video/Ngang/DJI_20261015212338_0648_D.MP4
- ẢNH HOMESTAY MCC/Mai Linh Hotel/Khuông viên/1790518754826_5111332639817390961_g8927124569245346429.mp4

### Ảnh của địa điểm ĐÃ CÓ trong hệ thống

| Địa điểm có sẵn | Ảnh sẵn có | Ảnh trong thư mục | Khác nhau (còn chỗ) | Trạng thái |
|---|---:|---:|---:|---|
| Homestay Cường Tú (#8) | 1 | 1 | 1 | sẽ gắn |
| Pú Nhu Homestay (#31) | 8 | 8 | 8 | sẽ gắn |

> Lưu ý: ảnh đã có sẵn của các địa điểm này được tải từ trước nên không có mã băm để so trùng; gắn thêm có thể tạo ảnh lặp.

## 5. Mỗi dòng Excel đi đâu (phủ 100% dòng có dữ liệu)

| Sheet | Số dòng | Tạo mới | Gộp | Đã có sẵn | Không có bảng đích |
|---|---:|---:|---:|---:|---:|

Chi tiết từng dòng: `coverage.json`.

## 6. Cảnh báo chất lượng dữ liệu cần người rà soát
