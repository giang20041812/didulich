# Báo cáo đối chiếu — đợt nhập "DATA CHÍNH THỐNG"

- Nguồn: `DATA CHÍNH THỐNG.xlsx` (dựng dataset ngày 2026-10-23) + 3 thư mục ảnh `ẢNH HOMESTAY MCC`, `ẢNH HOTEL - KHÁCH SẠN MCC`, `NHÀ HÀNG`.
- Đích: `aws-0-ap-northeast-2.pooler.supabase.com/postgres` — **đã ghi**.
- Quy ước: địa điểm mới có **data_verified = FALSE (chưa xác thực — chỉ là cờ để Admin theo dõi)**, `verification = UNVERIFIED`, hiển thị `PUBLISHED` (khách thấy ngay), không gắn nhà cung cấp.
- **8 mục giữ ở DRAFT** (chưa cho khách thấy) vì chưa đủ thông tin / còn nghi vấn; Admin bấm *Công khai* khi sẵn sàng, hoặc chạy với `--publish-held`:
  - Chiba Ecolodge: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Hà Châu 2 Homestay: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Hạnh Phúc Creek: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Nhà Nghỉ Ngủ: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Nhất Phượng Homestay: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Nắng Hotel: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Sky Motel: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai
  - Thuật Hà Homestay: Chỉ có tên + ảnh, chưa có địa chỉ / giá / liên hệ — bổ sung thông tin rồi mới công khai

## 1. Tóm tắt

| Loại | Tạo mới | Đã nhập trước đó | Trùng địa điểm đang có |
|---|---:|---:|---:|
| Homestay / khách sạn | 9 | 35 | 0 |
| Nhà hàng / quán | 4 | 13 | 0 |
| Lễ hội (bảng festival) | 0 | 5 | 0 |

Ảnh cho địa điểm mới: **136** ảnh khác nhau (từ 136 file; bỏ 0 ảnh trùng nội dung, 0 ảnh vượt giới hạn 30/địa điểm).

## 2. Địa điểm tạo mới

| # | Loại | Tên | Khu vực | Giá tham khảo | Toạ độ | SĐT | Ảnh (file→khác nhau) | Nguồn dòng Excel |
|---:|---|---|---|---|---|---|---|---|
| 1 | Homestay / khách sạn | Wind's Homestay | La Pán Tẩn | 300.000–800.000 phòng/đêm | có | 0339817462 | 20→20 | Homestay reviewer #7 |
| 2 | Nhà hàng / quán | Nhà hàng Quyền Hường | Thị trấn Mù Cang Chải | 100.000–200.000 người | có | 0942447103 | 20→20 | Nhà hàng #2 + Nhà hàng reviewer #12 |
| 3 | Nhà hàng / quán | Nhà hàng Tuấn Thúy | Thị trấn Mù Cang Chải |  | — | 0977279165 | 9→9 | Nhà hàng #4 + Nhà hàng #13 |
| 4 | Nhà hàng / quán | Nhà hàng Vườn Đào | Thị trấn Mù Cang Chải |  | — | 0866077628 | 3→3 | Nhà hàng #9 |
| 5 | Nhà hàng / quán | Nhà hàng Thành Oanh | Thị trấn Mù Cang Chải | 40.000–1.500.000  | có | 0888236679, 0966765528 | 4→4 | Nhà hàng #10 + Nhà hàng reviewer #14 |
| 6 | Homestay / khách sạn | Chiba Ecolodge | Mù Cang Chải |  | — | — | 17→17 | (chỉ thư mục ảnh) |
| 7 | Homestay / khách sạn | Hà Châu 2 Homestay | Mù Cang Chải |  | — | — | 30→30 | (chỉ thư mục ảnh) |
| 8 | Homestay / khách sạn | Hạnh Phúc Creek | Mù Cang Chải |  | — | — | 7→7 | (chỉ thư mục ảnh) |
| 9 | Homestay / khách sạn | Nhà Nghỉ Ngủ | Mù Cang Chải |  | — | — | 10→10 | (chỉ thư mục ảnh) |
| 10 | Homestay / khách sạn | Nhất Phượng Homestay | Mù Cang Chải |  | — | — | 1→1 | (chỉ thư mục ảnh) |
| 11 | Homestay / khách sạn | Nắng Hotel | Mù Cang Chải |  | — | — | 7→7 | (chỉ thư mục ảnh) |
| 12 | Homestay / khách sạn | Sky Motel | Mù Cang Chải |  | — | — | 6→6 | (chỉ thư mục ảnh) |
| 13 | Homestay / khách sạn | Thuật Hà Homestay | Mù Cang Chải |  | — | — | 2→2 | (chỉ thư mục ảnh) |

### Bỏ qua (đã có)

- Hello Mu Cang Chai Homestay ↔ #1 "Hello Mu Cang Chai Homestay" — đã nhập ở lần chạy trước
- Mu Cang Chai Eco Lodge ↔ #2 "Mu Cang Chai Eco Lodge" — đã nhập ở lần chạy trước
- Dò Gừ Homestay ↔ #3 "Dò Gừ Homestay" — đã nhập ở lần chạy trước
- Mù Cang Homestay ↔ #4 "Mù Cang Homestay" — đã nhập ở lần chạy trước
- Ngọc Thúy Homestay ↔ #5 "Ngọc Thúy Homestay" — đã nhập ở lần chạy trước
- Mong Ngua Homestay ↔ #6 "Mong Ngua Homestay" — đã nhập ở lần chạy trước
- La Pan Tan Homestay ↔ #7 "La Pan Tan Homestay" — đã nhập ở lần chạy trước
- Homestay Cường Tú ↔ #8 "Homestay Cường Tú" — đã nhập ở lần chạy trước
- Nhà nghỉ cộng đồng Lương Văn Bản ↔ #9 "Nhà nghỉ cộng đồng Lương Văn Bản" — đã nhập ở lần chạy trước
- Homestay Tùng Teng ↔ #10 "Homestay Tùng Teng" — đã nhập ở lần chạy trước
- Homestay A De ↔ #11 "Homestay A De" — đã nhập ở lần chạy trước
- Lượng Hường Homestay ↔ #12 "Lượng Hường Homestay" — đã nhập ở lần chạy trước
- Homestay Minh Ngọc ↔ #13 "Homestay Minh Ngọc" — đã nhập ở lần chạy trước
- Suối Kim 2 Homestay ↔ #14 "Suối Kim 2 Homestay" — đã nhập ở lần chạy trước
- Nhà nghỉ cộng đồng Nông Văn Êm ↔ #15 "Nhà nghỉ cộng đồng Nông Văn Êm" — đã nhập ở lần chạy trước
- Homestay Tư Nguyệt ↔ #16 "Homestay Tư Nguyệt" — đã nhập ở lần chạy trước
- Homestay Quyết Đoản ↔ #17 "Homestay Quyết Đoản" — đã nhập ở lần chạy trước
- Hoai Phuong Homestay ↔ #18 "Hoai Phuong Homestay" — đã nhập ở lần chạy trước
- Home Stay Duy Cường ↔ #19 "Home Stay Duy Cường" — đã nhập ở lần chạy trước
- Gà Tre Homestay ↔ #20 "Gà Tre Homestay" — đã nhập ở lần chạy trước
- Mù Cang Chải Village Home ↔ #21 "Mù Cang Chải Village Home" — đã nhập ở lần chạy trước
- Mù Cang Chải Big View Homestay ↔ #22 "Mù Cang Chải Big View Homestay" — đã nhập ở lần chạy trước
- Chải Eco House ↔ #23 "Chải Eco House" — đã nhập ở lần chạy trước
- A Su Homestay ↔ #24 "A Su Homestay" — đã nhập ở lần chạy trước
- Homestay Chù Chỏ ↔ #26 "Homestay Chù Chỏ" — đã nhập ở lần chạy trước
- Bamboo Homestay ↔ #27 "Bamboo Homestay" — đã nhập ở lần chạy trước
- Sùng A Hờ Homestay ↔ #28 "Sùng A Hờ Homestay" — đã nhập ở lần chạy trước
- Suối Kim Homestay ↔ #29 "Suối Kim Homestay" — đã nhập ở lần chạy trước
- Bluehome Homestay (Khau Phạ) ↔ #30 "Bluehome Homestay (Khau Phạ)" — đã nhập ở lần chạy trước
- Pú Nhu Homestay ↔ #31 "Pú Nhu Homestay" — đã nhập ở lần chạy trước
- Dòng Suối Hmong Homestay & Bungalow ↔ #32 "Dòng Suối Hmong Homestay & Bungalow" — đã nhập ở lần chạy trước
- Mù Cang Chải Dream House ↔ #33 "Mù Cang Chải Dream House" — đã nhập ở lần chạy trước
- Súa Su Homestay ↔ #34 "Súa Su Homestay" — đã nhập ở lần chạy trước
- Indigenous Homestay – Trek & Local Life ↔ #35 "Indigenous Homestay – Trek & Local Life" — đã nhập ở lần chạy trước
- GARRYA Mù Cang Chải ↔ #36 "GARRYA Mù Cang Chải" — đã nhập ở lần chạy trước
- Quán Mạnh Thơm ↔ #38 "Quán Mạnh Thơm" — đã nhập ở lần chạy trước
- Nhà hàng Thắng Dung ↔ #40 "Nhà hàng Thắng Dung" — đã nhập ở lần chạy trước
- Nhà hàng Hằng Béo ↔ #41 "Nhà hàng Hằng Béo" — đã nhập ở lần chạy trước
- Nhà hàng A Tân Quán ↔ #42 "Nhà hàng A Tân Quán" — đã nhập ở lần chạy trước
- Nhà hàng Thùy Linh ↔ #43 "Nhà hàng Thùy Linh" — đã nhập ở lần chạy trước
- Nhà hàng Nguyệt Thắng ↔ #46 "Nhà hàng Nguyệt Thắng" — đã nhập ở lần chạy trước
- Quán Thuật Hà ↔ #47 "Quán Thuật Hà" — đã nhập ở lần chạy trước
- Quán con khỉ ↔ #48 "Quán con khỉ" — đã nhập ở lần chạy trước
- Cơm Phở Lục Hường ↔ #49 "Cơm Phở Lục Hường" — đã nhập ở lần chạy trước
- Cafe Mâm Xôi ↔ #50 "Cafe Mâm Xôi" — đã nhập ở lần chạy trước
- Vua Xứ Mù Cafe ↔ #51 "Vua Xứ Mù Cafe" — đã nhập ở lần chạy trước
- View Gió (Gió Quán) ↔ #52 "View Gió (Gió Quán)" — đã nhập ở lần chạy trước
- Nhà hàng Hương Ly ↔ #53 "Nhà hàng Hương Ly" — đã nhập ở lần chạy trước
- Hà Trang (Lai Châu) ↔ #54 "Hà Trang (Lai Châu)" — đã nhập ở lần chạy trước
- Sơn Phương ↔ #55 "Sơn Phương" — đã nhập ở lần chạy trước
- Hưng Thành (Lai Châu) ↔ #56 "Hưng Thành (Lai Châu)" — đã nhập ở lần chạy trước
- Cường Lan ↔ #57 "Cường Lan" — đã nhập ở lần chạy trước
- Anh Khang Authentic ↔ #58 "Anh Khang Authentic" — đã nhập ở lần chạy trước
- Gia Khánh ↔ #59 "Gia Khánh" — đã nhập ở lần chạy trước
- Nam Thắng Limousine ↔ #60 "Nam Thắng Limousine" — đã nhập ở lần chạy trước
- Golden Limousine ↔ #61 "Golden Limousine" — đã nhập ở lần chạy trước
- An Bình Limousine ↔ #62 "An Bình Limousine" — đã nhập ở lần chạy trước
- Xe Ghép Yên Bái ↔ #63 "Xe Ghép Yên Bái" — đã nhập ở lần chạy trước
- Xe ghép Yên Bái – Chế Cu Nha ↔ #64 "Xe ghép Yên Bái – Chế Cu Nha" — đã nhập ở lần chạy trước
- Xe ghép Yên Bái – Chế Tạo ↔ #65 "Xe ghép Yên Bái – Chế Tạo" — đã nhập ở lần chạy trước
- Xe ghép Yên Bái – Nậm Có ↔ #66 "Xe ghép Yên Bái – Nậm Có" — đã nhập ở lần chạy trước
- Xe ôm lên Đồi Móng Ngựa ↔ #67 "Xe ôm lên Đồi Móng Ngựa" — đã nhập ở lần chạy trước
- Xe ôm lên Đồi Mâm Xôi (La Pán Tẩn) ↔ #68 "Xe ôm lên Đồi Mâm Xôi (La Pán Tẩn)" — đã nhập ở lần chạy trước
- Xe ôm đi các điểm ruộng bậc thang qua homestay đặt hộ ↔ #69 "Xe ôm đi các điểm ruộng bậc thang qua homestay đặt hộ" — đã nhập ở lần chạy trước
- Thuê xe máy tự lái (Thị trấn / Ngã Ba Kim) ↔ #70 "Thuê xe máy tự lái (Thị trấn / Ngã Ba Kim)" — đã nhập ở lần chạy trước
- Xe khách giường nằm Hà Nội – Mù Cang Chải (tổng hợp các nhà xe) ↔ #71 "Xe khách giường nằm Hà Nội – Mù Cang Chải (tổng hợp các nhà xe)" — đã nhập ở lần chạy trước
- Xe ôm vào Rừng trúc Nà Háng Tủa ↔ #72 "Xe ôm vào Rừng trúc Nà Háng Tủa" — đã nhập ở lần chạy trước
- Xe trung chuyển Ngã 3 Kim – Ngã 3 Ba Nhà ↔ #73 "Xe trung chuyển Ngã 3 Kim – Ngã 3 Ba Nhà" — đã nhập ở lần chạy trước
- Thuê xe ô tô bán tải / 2 cầu có tài xế ↔ #74 "Thuê xe ô tô bán tải / 2 cầu có tài xế" — đã nhập ở lần chạy trước
- Xe ôm ghép đoàn phượt đường dài ↔ #75 "Xe ôm ghép đoàn phượt đường dài" — đã nhập ở lần chạy trước
- Bay dù lượn "Bay trên mùa vàng" (Đèo Khau Phạ) ↔ #76 "Bay dù lượn "Bay trên mùa vàng" (Đèo Khau Phạ)" — đã nhập ở lần chạy trước
- Thuê thợ chụp ảnh & trang phục dân tộc ↔ #77 "Thuê thợ chụp ảnh & trang phục dân tộc" — đã nhập ở lần chạy trước
- Quay / thuê flycam tại điểm ngắm lúa ↔ #78 "Quay / thuê flycam tại điểm ngắm lúa" — đã nhập ở lần chạy trước
- Ngâm chân lá thuốc thảo mộc ↔ #79 "Ngâm chân lá thuốc thảo mộc" — đã nhập ở lần chạy trước
- Gửi hành lý / xe máy tại chân dốc ↔ #80 "Gửi hành lý / xe máy tại chân dốc" — đã nhập ở lần chạy trước
- Cứu hộ xe máy khẩn cấp trên đèo ↔ #81 "Cứu hộ xe máy khẩn cấp trên đèo" — đã nhập ở lần chạy trước
- Thuê porter / hướng dẫn viên trekking ↔ #82 "Thuê porter / hướng dẫn viên trekking" — đã nhập ở lần chạy trước
- Đặt tiệc / đốt lửa trại & múa xòe ↔ #83 "Đặt tiệc / đốt lửa trại & múa xòe" — đã nhập ở lần chạy trước
- Dịch vụ rửa xe máy sau phượt ↔ #84 "Dịch vụ rửa xe máy sau phượt" — đã nhập ở lần chạy trước
- Thuê ủng đi mưa / áo mưa tại chân dốc ↔ #85 "Thuê ủng đi mưa / áo mưa tại chân dốc" — đã nhập ở lần chạy trước
- Đỉnh Tà Xùa (Trạm Tấu, Yên Bái) ↔ #86 "Đỉnh Tà Xùa (Trạm Tấu, Yên Bái)" — đã nhập ở lần chạy trước
- Bể khoáng nóng Cường Hải ↔ #87 "Bể khoáng nóng Cường Hải" — đã nhập ở lần chạy trước
- Khèn Mông (trải nghiệm văn hóa) ↔ #88 "Khèn Mông (trải nghiệm văn hóa)" — đã nhập ở lần chạy trước
- Thổ cẩm/vẽ sáp ong (trải nghiệm văn hóa) ↔ #89 "Thổ cẩm/vẽ sáp ong (trải nghiệm văn hóa)" — đã nhập ở lần chạy trước
- Ruộng bậc thang (trải nghiệm văn hóa) ↔ #90 "Ruộng bậc thang (trải nghiệm văn hóa)" — đã nhập ở lần chạy trước
- Ẩm thực vùng cao (trải nghiệm văn hóa) ↔ #91 "Ẩm thực vùng cao (trải nghiệm văn hóa)" — đã nhập ở lần chạy trước
- Bản làng & sinh hoạt cộng đồng (trải nghiệm văn hóa) ↔ #92 "Bản làng & sinh hoạt cộng đồng (trải nghiệm văn hóa)" — đã nhập ở lần chạy trước
- Một ngày cùng ruộng bậc thang ↔ #93 "Một ngày cùng ruộng bậc thang" — đã nhập ở lần chạy trước
- Khèn và sắc chàm ↔ #94 "Khèn và sắc chàm" — đã nhập ở lần chạy trước
- Mùa lễ hội bản địa ↔ #95 "Mùa lễ hội bản địa" — đã nhập ở lần chạy trước
- Mù Cang Chải sống chậm ↔ #96 "Mù Cang Chải sống chậm" — đã nhập ở lần chạy trước

## 3. Dòng Excel đã có sẵn trong hệ thống (đối chiếu với DB)

| Sheet | Dòng | Tên trong Excel | Bản ghi trong hệ thống |
|---|---:|---|---|
| Điểm đến | 2 | Đồi Mâm Xôi | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 3 | Đèo Khau Phạ | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 4 | Thung lũng Tú Lệ | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 5 | Thác Pú Nhu | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 6 | Thác Mơ | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 7 | Đồi Móng Ngựa | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 8 | Rừng Trúc | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 9 | Sống Lưng Khủng Long | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 10 | Đồi Kim Nọi - Võng lúa Háng đăng dê | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 11 | Thác Hầu đề | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 12 | Mâm Xôi Nhỏ | **THIẾU — chưa có trong hệ thống** |
| Điểm đến | 13 | Hoa đào rừng ( Hoa Tớ Dầy) La Pán Tẩn | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 2 | Xôi nếp Tú Lệ / xôi ngũ sắc | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 3 | Cá suối nướng | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 4 | Pa pỉnh tộp | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 5 | Thịt lợn bản kẹp cây rừng nướng | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 6 | Gà đen Mù Cang Chải | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 7 | Gà nướng lá mắc mật, nướng mắc khén | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 8 | Cá hồi, cá tầm Khau Phạ | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 9 | Cua suối rang muối | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 10 | Châu chấu rang | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 11 | Nhộng ong rừng, sâu tre | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 12 | Măng đắng, rau rừng/cải mèo | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 13 | Bánh chưng đen | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 14 | Cốm Tú Lệ | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 15 | Táo mèo / sơn tra và rượu táo mèo | **THIẾU — chưa có trong hệ thống** |
| Đặc sản | 16 | Mật ong rừng; lạp xưởng; thịt hun khói/gác bếp; nếp Tú Lệ; măng khô | **THIẾU — chưa có trong hệ thống** |

## 4. Thư mục ảnh → nơi gắn

| Thư mục | Ảnh | Khác nhau | Video | Gắn vào | Ghi chú |
|---|---:|---:|---:|---|---|
| ẢNH HOMESTAY MCC/Chely Hotel | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOMESTAY MCC/Chiba Ecolodge | 17 | 0 | 0 | Chiba Ecolodge (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Duy Vũ hotel | 6 | 0 | 0 | địa điểm có sẵn "Nhà nghỉ Duy Vũ" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Hoa sơn tra | 11 | 0 | 1 | địa điểm có sẵn "Hoa Sơn Trà Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Hà Châu 2 Homestay | 49 | 0 | 1 | Hà Châu 2 Homestay (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Hạnh Phúc Creek | 7 | 0 | 0 | Hạnh Phúc Creek (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Mai Linh Hotel | 28 | 0 | 4 | địa điểm có sẵn "Mai Linh Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Newhightland hotel | 17 | 0 | 2 | địa điểm có sẵn "New Highland Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Nhà Nghỉ Ngủ | 10 | 0 | 1 | Nhà Nghỉ Ngủ (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Nhất Phượng Homestay | 5 | 0 | 0 | Nhất Phượng Homestay (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Nắng Hotel | 7 | 0 | 0 | Nắng Hotel (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Sky Motel | 6 | 0 | 0 | Sky Motel (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Thuật Hà homestay | 2 | 0 | 1 | Thuật Hà Homestay (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Win Homestay | 20 | 0 | 1 | Wind's Homestay | ⚠ tên gần giống ("Win" ~ "Wind's"), cần người xác nhận |
| ẢNH HOMESTAY MCC/ẢNH BAAN MA LÍ HOMESTAY | 14 | 0 | 0 | địa điểm có sẵn "Baan Mali Homestay" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY BẢO LAN | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY CƯỜNG TÚ | 0 | 0 | 0 | Homestay Cường Tú | đã có / bỏ qua |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY MÙA VÀNG | 16 | 0 | 1 | địa điểm có sẵn "Homestay Mùa Vàng" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/ẢNH MỘC HOMESTAY | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOMESTAY MCC/ẢNH PÚ NHU HOUSE | 0 | 0 | 0 | Pú Nhu Homestay | ⚠ tên gần giống ("Pú Nhu House" ~ "Pú Nhu Homestay") |
| ẢNH HOMESTAY MCC/🍀Đồi đổi gió homestay | 10 | 0 | 3 | địa điểm có sẵn "Đồi Đổi Gió" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH BULGALOW XUÂN GIANG | 17 | 4 | 3 | địa điểm có sẵn "Bulgalow Xuân giang" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY | 35 | 7 | 0 | địa điểm có sẵn "Cô Gái Thái Homestay" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY ANH TÚC | 14 | 2 | 0 | địa điểm có sẵn "Homestay Anh Túc" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY HOÀ THẢO | 24 | 6 | 0 | địa điểm có sẵn "Homestay Hoà Thảo" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH TRAI BẢN HOMESTAY | 15 | 6 | 0 | địa điểm có sẵn "Trai Bản Homestay" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/ẢNH HOTEL CHELLY | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOTEL - KHÁCH SẠN MCC/ẢNH HOTEL THUẬT HÒA | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOTEL - KHÁCH SẠN MCC/ẢNH NHÀ NGHỈ DUY VŨ | 4 | 0 | 0 | địa điểm có sẵn "Nhà nghỉ Duy Vũ" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/🍀MAI LINH HOTEL | 15 | 0 | 0 | địa điểm có sẵn "Mai Linh Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/🍀ẢNH HOA SƠN TRÀ HOTEL | 9 | 0 | 0 | địa điểm có sẵn "Hoa Sơn Trà Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/🍀ẢNH NEWHIGHLAND HOTEL | 15 | 0 | 0 | địa điểm có sẵn "New Highland Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| NHÀ HÀNG/NHÀ HÀNG THUẬT HÒA | 0 | 0 | 0 | Quán Thuật Hà | ⚠ tên gần giống ("Thuật Hòa" ~ "Thuật Hà") |
| NHÀ HÀNG/🍀NHÀ HÀNG QUYỀN HƯỜNG | 20 | 0 | 0 | Nhà hàng Quyền Hường |  |
| NHÀ HÀNG/🍀NHÀ HÀNG THÀNH OANH | 5 | 0 | 0 | Nhà hàng Thành Oanh |  |
| NHÀ HÀNG/🍀NHÀ HÀNG TUẤN TUẤN THÚY | 9 | 0 | 0 | Nhà hàng Tuấn Thúy | ⚠ khớp tên (thư mục viết "Tuấn Tuấn Thúy") |
| NHÀ HÀNG/🍀VƯỜN ĐÀO QUÁN | 5 | 0 | 1 | Nhà hàng Vườn Đào |  |

### Video chưa nhập (19 file)

Hệ thống chỉ lưu và hiển thị ảnh cho địa điểm (place_media là ảnh), chưa có chỗ chứa video của địa điểm nên các file sau KHÔNG được nhập — cần quyết định hướng xử lý (vd đăng YouTube/TikTok rồi gắn link kênh).

- ẢNH HOMESTAY MCC/Hoa sơn tra/1790143172876_3752177215775102092_g3654053810288981291.mp4
- ẢNH HOMESTAY MCC/Hà Châu 2 Homestay/1790861900847_3128440791975572468_g9152300447858200221.mp4
- ẢNH HOMESTAY MCC/Mai Linh Hotel/1790518678992_1561841435112033074_g8927124569245346429.mp4
- ẢNH HOMESTAY MCC/Mai Linh Hotel/1790518754798_5111332639817390961_g8927124569245346429.mp4
- ẢNH HOMESTAY MCC/Mai Linh Hotel/1790518754823_5111332639817390961_g8927124569245346429.mp4
- ẢNH HOMESTAY MCC/Mai Linh Hotel/1790518754826_5111332639817390961_g8927124569245346429.mp4
- ẢNH HOMESTAY MCC/Newhightland hotel/1789998036673_4708393126238020809_g1614094742866789112.mp4
- ẢNH HOMESTAY MCC/Newhightland hotel/1789998036683_4708393126238020809_g1614094742866789112.mp4
- ẢNH HOMESTAY MCC/Nhà Nghỉ Ngủ/1792058557807_1477400917016176158_g7910030443112552792.mp4
- ẢNH HOMESTAY MCC/Thuật Hà homestay/1790339054570_6456496131266228484_g4936714188994032668.mp4
- ẢNH HOMESTAY MCC/Win Homestay/1790343051290_3353328638171993367_g9220135514414184810.mp4
- ẢNH HOMESTAY MCC/ẢNH HOMESTAY MÙA VÀNG/ẢNH PHÒNG/1K36D7K10_3THCH7.mp4
- ẢNH HOMESTAY MCC/🍀Đồi đổi gió homestay/Ảnh phòng/1K3HK9Q8E_3C1TCT.mp4
- ẢNH HOMESTAY MCC/🍀Đồi đổi gió homestay/Ảnh phòng/1K3HK9Q9A_3C1TCT.mp4
- ẢNH HOMESTAY MCC/🍀Đồi đổi gió homestay/Ảnh phòng/1K3HK9Q97_3C1TCT.mp4
- ẢNH HOMESTAY MCC/🍀ẢNH BULGALOW XUÂN GIANG/Ảnh phòng + khuôn viên/Video phòng/1K36C13DQ_3C1TCT.mp4
- ẢNH HOMESTAY MCC/🍀ẢNH BULGALOW XUÂN GIANG/Ảnh phòng + khuôn viên/Video phòng/1K36C13E5_3C1TCT.mp4
- ẢNH HOMESTAY MCC/🍀ẢNH BULGALOW XUÂN GIANG/Ảnh phòng + khuôn viên/Video phòng/8688e1e736ba5c3e7eec37a65cfb6779.mp4
- NHÀ HÀNG/🍀VƯỜN ĐÀO QUÁN/1K3MHMJE2_7D54IQ.mp4

### Ảnh của địa điểm ĐÃ CÓ trong hệ thống

| Địa điểm có sẵn | Ảnh sẵn có | Ảnh trong thư mục | Khác nhau (còn chỗ) | Trạng thái |
|---|---:|---:|---:|---|
| Nhà nghỉ Duy Vũ — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| Hoa Sơn Trà Hotel — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| Mai Linh Hotel — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| New Highland Hotel — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| Baan Mali Homestay — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| Homestay Mùa Vàng — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| Đồi Đổi Gió — **không tìm thấy trong DB** | 0 | 0 | 0 | chưa gắn |
| Bulgalow Xuân giang — **không tìm thấy trong DB** | 0 | 4 | 4 | chưa gắn |
| Cô Gái Thái Homestay — **không tìm thấy trong DB** | 0 | 7 | 7 | chưa gắn |
| Homestay Anh Túc — **không tìm thấy trong DB** | 0 | 2 | 2 | chưa gắn |
| Homestay Hoà Thảo — **không tìm thấy trong DB** | 0 | 6 | 6 | chưa gắn |
| Trai Bản Homestay — **không tìm thấy trong DB** | 0 | 6 | 6 | chưa gắn |

> Lưu ý: ảnh đã có sẵn của các địa điểm này được tải từ trước nên không có mã băm để so trùng; gắn thêm có thể tạo ảnh lặp.

## 5. Mỗi dòng Excel đi đâu (phủ 100% dòng có dữ liệu)

| Sheet | Số dòng | Tạo mới | Gộp | Đã có sẵn | Không có bảng đích |
|---|---:|---:|---:|---:|---:|
| Di chuyển | 14 | 12 | 2 | 0 | 0 |
| Di chuyển reviewer | 9 | 9 | 0 | 0 | 0 |
| Dịch vụ reviewer | 13 | 12 | 1 | 0 | 0 |
| Homestay | 20 | 19 | 1 | 0 | 0 |
| Homestay reviewer | 17 | 16 | 1 | 0 | 0 |
| Nhà hàng | 13 | 6 | 7 | 0 | 0 |
| Nhà hàng reviewer | 10 | 5 | 5 | 0 | 0 |
| Văn hóa | 19 | 14 | 0 | 0 | 5 |
| Điểm đến | 12 | 0 | 0 | 12 | 0 |
| Đặc sản | 15 | 0 | 0 | 15 | 0 |

Chi tiết từng dòng: `coverage.json`.

### Không nhập được (không có bảng đích)

- Văn hóa dòng 18 — Khách văn hóa/di sản: Phân khúc khách hàng (tài liệu marketing) — hệ thống không có bảng tương ứng
- Văn hóa dòng 19 — Khách thiên nhiên/trekking: Phân khúc khách hàng (tài liệu marketing) — hệ thống không có bảng tương ứng
- Văn hóa dòng 20 — Gia đình/giáo dục: Phân khúc khách hàng (tài liệu marketing) — hệ thống không có bảng tương ứng
- Văn hóa dòng 21 — Khách quốc tế: Phân khúc khách hàng (tài liệu marketing) — hệ thống không có bảng tương ứng
- Văn hóa dòng 22 — Khách nghỉ dưỡng/chậm: Phân khúc khách hàng (tài liệu marketing) — hệ thống không có bảng tương ứng

## 6. Cảnh báo chất lượng dữ liệu cần người rà soát

**Wind's Homestay**
- Cột Ưu điểm / Hạn chế / Phù hợp trong file nguồn bị lệch; đã sắp lại theo nội dung
- Thư mục ảnh "ẢNH HOMESTAY MCC/Win Homestay" gắn vào đây — tên gần giống ("Win" ~ "Wind's"), cần người xác nhận

**Nhà hàng Quyền Hường**
- Địa chỉ ở sheet "Nhà hàng": "khu trung tâm, QL32"
- Thư mục ảnh "NHÀ HÀNG/🍀NHÀ HÀNG QUYỀN HƯỜNG" gắn vào đây — khớp tên

**Nhà hàng Tuấn Thúy**
- Tên ở sheet "Nhà hàng": "Quán Ăn Mu Cang Chai"
- Dòng "Quán Ăn Mu Cang Chai" (QL32) được người rà soát ghi chú là "Nhà hàng tuấn thúy" — gộp vào đây
- Thư mục ảnh "NHÀ HÀNG/🍀NHÀ HÀNG TUẤN TUẤN THÚY" gắn vào đây — khớp tên (thư mục viết "Tuấn Tuấn Thúy")

**Nhà hàng Vườn Đào**
- Thư mục ảnh "NHÀ HÀNG/🍀VƯỜN ĐÀO QUÁN" gắn vào đây — khớp tên

**Nhà hàng Thành Oanh**
- Tên ở sheet "Nhà hàng": "Nhà Hàng Thành Oanh Thắng Cố Ngựa"
- Địa chỉ ở sheet "Nhà hàng": "khu Mù Cang Chải"
- Thư mục ảnh "NHÀ HÀNG/🍀NHÀ HÀNG THÀNH OANH" gắn vào đây — khớp tên

**Chiba Ecolodge**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Hà Châu 2 Homestay**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Hạnh Phúc Creek**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Nhà Nghỉ Ngủ**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Nhất Phượng Homestay**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Nắng Hotel**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Sky Motel**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung

**Thuật Hà Homestay**
- Chỉ có thư mục ảnh, chưa có thông tin nào khác (địa chỉ, giá, liên hệ...) — cần bổ sung
