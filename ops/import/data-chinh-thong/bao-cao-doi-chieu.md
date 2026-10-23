# Báo cáo đối chiếu — đợt nhập "DATA CHÍNH THỐNG"

- Nguồn: `DATA CHÍNH THỐNG.xlsx` (dựng dataset ngày 2026-10-23) + 3 thư mục ảnh `ẢNH HOMESTAY MCC`, `ẢNH HOTEL - KHÁCH SẠN MCC`, `NHÀ HÀNG`.
- Đích: `aws-0-ap-southeast-1.pooler.supabase.com/postgres` — **đã ghi**.
- Quy ước: địa điểm mới có **data_verified = FALSE (chưa xác thực — chỉ là cờ để Admin theo dõi)**, `verification = UNVERIFIED`, hiển thị `PUBLISHED` (khách thấy ngay), không gắn nhà cung cấp.
- **9 mục giữ ở DRAFT** (chưa cho khách thấy) vì chưa đủ thông tin / còn nghi vấn; Admin bấm *Công khai* khi sẵn sàng, hoặc chạy với `--publish-held`:
  - Nhà hàng Hằng Béo: Người rà soát ghi "Không có" — nghi cơ sở không còn / không tồn tại, cần xác minh trước khi cho khách thấy
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
| Homestay / khách sạn | 44 | 0 | 0 |
| Nhà hàng / quán | 17 | 0 | 0 |
| Vận chuyển | 22 | 0 | 0 |
| Trải nghiệm văn hóa | 12 | 0 | 0 |
| Chụp ảnh & trang phục | 2 | 0 | 0 |
| Dịch vụ | 5 | 0 | 0 |
| Điểm tham quan | 2 | 0 | 0 |
| Lễ hội (bảng festival) | 5 | 0 | 0 |

Ảnh cho địa điểm mới: **143** ảnh khác nhau (từ 162 file; bỏ 19 ảnh trùng nội dung, 0 ảnh vượt giới hạn 30/địa điểm).

## 2. Địa điểm tạo mới

| # | Loại | Tên | Khu vực | Giá tham khảo | Toạ độ | SĐT | Ảnh (file→khác nhau) | Nguồn dòng Excel |
|---:|---|---|---|---|---|---|---|---|
| 1 | Homestay / khách sạn | Hello Mu Cang Chai Homestay | La Pán Tẩn | 150.000–1.200.000 đêm (tùy loại phòng) | — | 0379292222 | — | Homestay #2 |
| 2 | Homestay / khách sạn | Mu Cang Chai Eco Lodge | Nậm Khắt | 500.000–1.600.000 đêm | — | 0989090908 | — | Homestay #3 |
| 3 | Homestay / khách sạn | Dò Gừ Homestay | La Pán Tẩn | 300.000–400.000 đêm | có | 0977363345 | — | Homestay #4 |
| 4 | Homestay / khách sạn | Mù Cang Homestay | Thị trấn Mù Cang Chải | 400.000–600.000 đêm | có | 0946052233 | — | Homestay #5 |
| 5 | Homestay / khách sạn | Ngọc Thúy Homestay | Thị trấn Mù Cang Chải | 200.000–400.000 đêm | có | 0971447265 | — | Homestay #6 |
| 6 | Homestay / khách sạn | Mong Ngua Homestay | Mồ Dề | 120.000–750.000 đêm (tùy loại phòng) | — | 0367858988 | — | Homestay #7 |
| 7 | Homestay / khách sạn | La Pan Tan Homestay | La Pán Tẩn | 150.000–850.000 đêm (tùy loại phòng) | — | 0854650589 | — | Homestay #8 |
| 8 | Homestay / khách sạn | Homestay Cường Tú | Kim Nọi | 100.000–350.000 đêm (tùy loại phòng) | có | 0385179642 | — | Homestay #9 |
| 9 | Homestay / khách sạn | Nhà nghỉ cộng đồng Lương Văn Bản | Thị trấn Mù Cang Chải | 100.000–500.000 đêm (tùy loại phòng) | — | 0344443620 | — | Homestay #10 |
| 10 | Homestay / khách sạn | Homestay Tùng Teng | Kim Nọi | 100.000–600.000 đêm (tùy loại phòng) | — | 0961917927 | — | Homestay #11 |
| 11 | Homestay / khách sạn | Homestay A De | La Pán Tẩn | 150.000–1.000.000 đêm (tùy loại phòng) | — | 0379292222 | — | Homestay #12 |
| 12 | Homestay / khách sạn | Lượng Hường Homestay | Thị trấn Mù Cang Chải | 100.000–600.000 đêm (tùy loại phòng) | có | 0383699978 | — | Homestay #13 |
| 13 | Homestay / khách sạn | Homestay Minh Ngọc | Kim Nọi | 100.000–600.000 đêm (tùy loại phòng) | có | 0912503469 | — | Homestay #14 |
| 14 | Homestay / khách sạn | Suối Kim 2 Homestay | Púng Luông | 100.000–600.000 đêm (tùy loại phòng) | có | 0329961420 | — | Homestay #15 |
| 15 | Homestay / khách sạn | Nhà nghỉ cộng đồng Nông Văn Êm | Thị trấn Mù Cang Chải | 100.000–500.000 đêm (tùy loại phòng) | — | 0367765445 | — | Homestay #16 |
| 16 | Homestay / khách sạn | Homestay Tư Nguyệt | Thị trấn Mù Cang Chải | 120.000–250.000 người/đêm | có | 0813772213 | — | Homestay #17 + Homestay reviewer #17 |
| 17 | Homestay / khách sạn | Homestay Quyết Đoản | Cao Phạ | 100.000–600.000 đêm (tùy loại phòng) | — | 0329153287 | — | Homestay #18 |
| 18 | Homestay / khách sạn | Hoai Phuong Homestay | Kim Nọi | 100.000–600.000 đêm (tùy loại phòng) | có | 0339908404 | — | Homestay #19 |
| 19 | Homestay / khách sạn | Home Stay Duy Cường | Thị trấn Mù Cang Chải | 100.000–500.000 đêm (tùy loại phòng) | — | 0964864094 | — | Homestay #20 |
| 20 | Homestay / khách sạn | Gà Tre Homestay | Thị trấn Mù Cang Chải | 100.000–600.000 đêm (tùy loại phòng) | có | 0944529942 | — | Homestay #21 |
| 21 | Homestay / khách sạn | Mù Cang Chải Village Home | Thị trấn Mù Cang Chải | 500.000–800.000 phòng/đêm | có | 0396483968 | — | Homestay reviewer #3 |
| 22 | Homestay / khách sạn | Mù Cang Chải Big View Homestay | Chế Cu Nha | 538.000 phòng/đêm | có | 0865847890 | — | Homestay reviewer #4 |
| 23 | Homestay / khách sạn | Chải Eco House | Thị trấn Mù Cang Chải | 300.000–350.000 phòng/đêm | có | 0975727510 | — | Homestay reviewer #5 |
| 24 | Homestay / khách sạn | A Su Homestay | La Pán Tẩn | 400.000–1.000.000 phòng/đêm | có | 0373749322 | — | Homestay reviewer #6 |
| 25 | Homestay / khách sạn | Wind's Homestay | La Pán Tẩn | 300.000–800.000 phòng/đêm | có | 0339817462 | 20→20 | Homestay reviewer #7 |
| 26 | Homestay / khách sạn | Homestay Chù Chỏ | Púng Luông | 630.000 phòng/đêm | có | 0832074131 | — | Homestay reviewer #8 |
| 27 | Homestay / khách sạn | Bamboo Homestay | La Pán Tẩn | 100.000–400.000 đêm | có | 0812170480 | — | Homestay reviewer #9 |
| 28 | Homestay / khách sạn | Sùng A Hờ Homestay | Mù Cang Chải | 170.000–500.000 đêm | có | 0838921888 | — | Homestay reviewer #10 |
| 29 | Homestay / khách sạn | Suối Kim Homestay | Mù Cang Chải | 100.000–500.000 đêm | có | 0367765445 | — | Homestay reviewer #11 |
| 30 | Homestay / khách sạn | Bluehome Homestay (Khau Phạ) | Cao Phạ | 500.000 phòng/đêm | có | 0865186456 | — | Homestay reviewer #12 |
| 31 | Homestay / khách sạn | Pú Nhu Homestay | La Pán Tẩn | 432.000 phòng/đêm | có | 0941584153 | — | Homestay reviewer #13 |
| 32 | Homestay / khách sạn | Dòng Suối Hmong Homestay & Bungalow | Chế Cu Nha | 150.000–550.000 người/đêm | có | 0354727980 | — | Homestay reviewer #14 |
| 33 | Homestay / khách sạn | Mù Cang Chải Dream House | Púng Luông | 800.000 phòng/đêm | có | 0786166222 | — | Homestay reviewer #15 |
| 34 | Homestay / khách sạn | Súa Su Homestay | Cao Phạ | 100.000–450.000 người/đêm | có | 0866554428 | — | Homestay reviewer #16 |
| 35 | Homestay / khách sạn | Indigenous Homestay – Trek & Local Life | La Pán Tẩn | 300.000 phòng/đêm | có | 0355014012 | — | Homestay reviewer #18 |
| 36 | Homestay / khách sạn | GARRYA Mù Cang Chải | Púng Luông |  | có | 02163878989 | — | Homestay reviewer #19 |
| 37 | Nhà hàng / quán | Nhà hàng Quyền Hường | Thị trấn Mù Cang Chải | 100.000–200.000 người | có | 0942447103 | 20→20 | Nhà hàng #2 + Nhà hàng reviewer #12 |
| 38 | Nhà hàng / quán | Quán Mạnh Thơm | Thị trấn Mù Cang Chải | 20.000–1.000.000  | có | 0972003166 | — | Nhà hàng #3 + Nhà hàng reviewer #13 |
| 39 | Nhà hàng / quán | Nhà hàng Tuấn Thúy | Thị trấn Mù Cang Chải |  | — | 0977279165 | 9→9 | Nhà hàng #4 + Nhà hàng #13 |
| 40 | Nhà hàng / quán | Nhà hàng Thắng Dung | Thị trấn Mù Cang Chải |  | — | 0986675935 | — | Nhà hàng #5 |
| 41 | Nhà hàng / quán | Nhà hàng Hằng Béo | Thị trấn Mù Cang Chải |  | — | 0944904047 | — | Nhà hàng #6 |
| 42 | Nhà hàng / quán | Nhà hàng A Tân Quán | Thị trấn Mù Cang Chải | 30.000–1.000.000  | có | 0849451866 | — | Nhà hàng #7 + Nhà hàng reviewer #7 |
| 43 | Nhà hàng / quán | Nhà hàng Thùy Linh | Thị trấn Mù Cang Chải | 30.000–1.000.000  | có | 0919809352 | — | Nhà hàng #8 + Nhà hàng reviewer #9 |
| 44 | Nhà hàng / quán | Nhà hàng Vườn Đào | Thị trấn Mù Cang Chải |  | — | 0866077628 | 5→5 | Nhà hàng #9 |
| 45 | Nhà hàng / quán | Nhà hàng Thành Oanh | Thị trấn Mù Cang Chải | 40.000–1.500.000  | có | 0888236679, 0966765528 | 5→5 | Nhà hàng #10 + Nhà hàng reviewer #14 |
| 46 | Nhà hàng / quán | Nhà hàng Nguyệt Thắng | Thị trấn Mù Cang Chải |  | — | — | — | Nhà hàng #11 |
| 47 | Nhà hàng / quán | Quán Thuật Hà | Thị trấn Mù Cang Chải |  | — | 0972140555 | — | Nhà hàng #12 |
| 48 | Nhà hàng / quán | Quán con khỉ | Mù Cang Chải | 30.000–300.000  | — | 0988820608 | — | Nhà hàng #14 |
| 49 | Nhà hàng / quán | Cơm Phở Lục Hường | Púng Luông | 30.000 suất | — | — | — | Nhà hàng reviewer #5 |
| 50 | Nhà hàng / quán | Cafe Mâm Xôi | La Pán Tẩn | 30.000–550.000  | có | 0389480981 | — | Nhà hàng reviewer #6 |
| 51 | Nhà hàng / quán | Vua Xứ Mù Cafe | Thị trấn Mù Cang Chải | 30.000–50.000  | có | 0987127592 | — | Nhà hàng reviewer #8 |
| 52 | Nhà hàng / quán | View Gió (Gió Quán) | Mù Cang Chải | 40.000–45.000  | có | 0822500825 | — | Nhà hàng reviewer #10 |
| 53 | Nhà hàng / quán | Nhà hàng Hương Ly | Thị trấn Mù Cang Chải |  | — | 01252213319 | — | Nhà hàng reviewer #11 |
| 54 | Vận chuyển | Hà Trang (Lai Châu) | Mù Cang Chải |  | — | 0975559911, 1900888684, 0967884582 | — | Di chuyển #2 + Dịch vụ reviewer #14 |
| 55 | Vận chuyển | Sơn Phương | Mù Cang Chải | 300.000 vé | — | 0976232118 | — | Di chuyển #3 |
| 56 | Vận chuyển | Hưng Thành (Lai Châu) | Mù Cang Chải |  | — | 0981202525 | — | Di chuyển #4 |
| 57 | Vận chuyển | Cường Lan | Mù Cang Chải | 350.000 vé | — | 0963856856, 0347842842 | — | Di chuyển #5 + Di chuyển #8 |
| 58 | Vận chuyển | Anh Khang Authentic | Mù Cang Chải | 380.000 vé | — | 0986359477 | — | Di chuyển #6 |
| 59 | Vận chuyển | Gia Khánh | Mù Cang Chải | 250.000 vé | — | 0981413413, 1900202708 | — | Di chuyển #7 |
| 60 | Vận chuyển | Nam Thắng Limousine | Mù Cang Chải | 280.000 vé | — | 02430936036 | — | Di chuyển #9 |
| 61 | Vận chuyển | Golden Limousine | Mù Cang Chải | 300.000 vé | — | 19006772 | — | Di chuyển #10 |
| 62 | Vận chuyển | An Bình Limousine | Mù Cang Chải | 200.000 vé | — | 0988050310 | — | Di chuyển #11 |
| 63 | Vận chuyển | Xe Ghép Yên Bái | Mù Cang Chải | 700.000 ghế | — | 0962535333 | — | Di chuyển #12 |
| 64 | Vận chuyển | Xe ghép Yên Bái – Chế Cu Nha | Mù Cang Chải | 700.000 ghế | — | 0888521007 | — | Di chuyển #13 |
| 65 | Vận chuyển | Xe ghép Yên Bái – Chế Tạo | Mù Cang Chải | 700.000 ghế | — | 0962535333 | — | Di chuyển #14 |
| 66 | Vận chuyển | Xe ghép Yên Bái – Nậm Có | Mù Cang Chải | 700.000 ghế | — | 0962535333 | — | Di chuyển #15 |
| 67 | Vận chuyển | Xe ôm lên Đồi Móng Ngựa | Thị trấn Mù Cang Chải | 110.000 khứ hồi | — | — | — | Di chuyển reviewer #5 |
| 68 | Vận chuyển | Xe ôm lên Đồi Mâm Xôi (La Pán Tẩn) | La Pán Tẩn | 100.000 khứ hồi | — | — | — | Di chuyển reviewer #6 |
| 69 | Vận chuyển | Xe ôm đi các điểm ruộng bậc thang qua homestay đặt hộ | Mù Cang Chải |  | — | — | — | Di chuyển reviewer #7 |
| 70 | Vận chuyển | Thuê xe máy tự lái (Thị trấn / Ngã Ba Kim) | Púng Luông | 200.000–250.000 ngày | — | 0914904686 | — | Di chuyển reviewer #8 |
| 71 | Vận chuyển | Xe khách giường nằm Hà Nội – Mù Cang Chải (tổng hợp các nhà xe) | Mù Cang Chải | 200.000–250.000 vé | — | 1900888684, 0967884582 | — | Di chuyển reviewer #9 |
| 72 | Vận chuyển | Xe ôm vào Rừng trúc Nà Háng Tủa | Púng Luông | 140.000 khứ hồi | — | — | — | Di chuyển reviewer #10 |
| 73 | Vận chuyển | Xe trung chuyển Ngã 3 Kim – Ngã 3 Ba Nhà | Púng Luông | 30.000–50.000 chuyến | — | — | — | Di chuyển reviewer #11 |
| 74 | Vận chuyển | Thuê xe ô tô bán tải / 2 cầu có tài xế | Mù Cang Chải | 800.000–1.200.000 ngày | — | — | — | Di chuyển reviewer #12 |
| 75 | Vận chuyển | Xe ôm ghép đoàn phượt đường dài | Mù Cang Chải | 300.000–400.000 ngày | — | — | — | Di chuyển reviewer #13 |
| 76 | Trải nghiệm văn hóa | Bay dù lượn "Bay trên mùa vàng" (Đèo Khau Phạ) | Cao Phạ | 2.000.000–3.000.000 lượt | — | — | — | Dịch vụ reviewer #5 |
| 77 | Chụp ảnh & trang phục | Thuê thợ chụp ảnh & trang phục dân tộc | Mù Cang Chải | 150.000–300.000 bộ/giờ | — | — | — | Dịch vụ reviewer #6 |
| 78 | Chụp ảnh & trang phục | Quay / thuê flycam tại điểm ngắm lúa | Mù Cang Chải | 100.000–300.000 gói | — | — | — | Dịch vụ reviewer #7 |
| 79 | Dịch vụ | Ngâm chân lá thuốc thảo mộc | Thị trấn Mù Cang Chải | 50.000–100.000 lượt | — | — | — | Dịch vụ reviewer #8 |
| 80 | Dịch vụ | Gửi hành lý / xe máy tại chân dốc | Mù Cang Chải | 10.000–30.000 lượt | — | — | — | Dịch vụ reviewer #9 |
| 81 | Dịch vụ | Cứu hộ xe máy khẩn cấp trên đèo | Cao Phạ | 50.000–200.000  | — | — | — | Dịch vụ reviewer #10 |
| 82 | Trải nghiệm văn hóa | Thuê porter / hướng dẫn viên trekking | Mù Cang Chải | 300.000–500.000 ngày | — | — | — | Dịch vụ reviewer #11 |
| 83 | Trải nghiệm văn hóa | Đặt tiệc / đốt lửa trại & múa xòe | Mù Cang Chải | 800.000–1.500.000 show | — | — | — | Dịch vụ reviewer #12 |
| 84 | Dịch vụ | Dịch vụ rửa xe máy sau phượt | Mù Cang Chải | 20.000–30.000 xe | — | — | — | Dịch vụ reviewer #13 |
| 85 | Dịch vụ | Thuê ủng đi mưa / áo mưa tại chân dốc | Mù Cang Chải | 10.000–20.000 đôi | — | — | — | Dịch vụ reviewer #15 |
| 86 | Điểm tham quan | Đỉnh Tà Xùa (Trạm Tấu, Yên Bái) | — | 50.000–1.200.000 gói porter | — | — | — | Dịch vụ reviewer #16 |
| 87 | Điểm tham quan | Bể khoáng nóng Cường Hải | — | 50.000–120.000 vé (xem mô tả) | — | — | — | Dịch vụ reviewer #17 |
| 88 | Trải nghiệm văn hóa | Khèn Mông (trải nghiệm văn hóa) | Mù Cang Chải |  | — | — | — | Văn hóa #10 |
| 89 | Trải nghiệm văn hóa | Thổ cẩm/vẽ sáp ong (trải nghiệm văn hóa) | Mù Cang Chải |  | — | — | — | Văn hóa #11 |
| 90 | Trải nghiệm văn hóa | Ruộng bậc thang (trải nghiệm văn hóa) | Mù Cang Chải |  | — | — | — | Văn hóa #12 |
| 91 | Trải nghiệm văn hóa | Ẩm thực vùng cao (trải nghiệm văn hóa) | Mù Cang Chải |  | — | — | — | Văn hóa #13 |
| 92 | Trải nghiệm văn hóa | Bản làng & sinh hoạt cộng đồng (trải nghiệm văn hóa) | Mù Cang Chải |  | — | — | — | Văn hóa #14 |
| 93 | Trải nghiệm văn hóa | Một ngày cùng ruộng bậc thang | Mù Cang Chải |  | — | — | — | Văn hóa #26 |
| 94 | Trải nghiệm văn hóa | Khèn và sắc chàm | Mù Cang Chải |  | — | — | — | Văn hóa #27 |
| 95 | Trải nghiệm văn hóa | Mùa lễ hội bản địa | Mù Cang Chải |  | — | — | — | Văn hóa #28 |
| 96 | Trải nghiệm văn hóa | Mù Cang Chải sống chậm | Mù Cang Chải |  | — | — | — | Văn hóa #29 |
| 97 | Homestay / khách sạn | Chiba Ecolodge | Mù Cang Chải |  | — | — | 17→17 | (chỉ thư mục ảnh) |
| 98 | Homestay / khách sạn | Hà Châu 2 Homestay | Mù Cang Chải |  | — | — | 49→30 | (chỉ thư mục ảnh) |
| 99 | Homestay / khách sạn | Hạnh Phúc Creek | Mù Cang Chải |  | — | — | 7→7 | (chỉ thư mục ảnh) |
| 100 | Homestay / khách sạn | Nhà Nghỉ Ngủ | Mù Cang Chải |  | — | — | 10→10 | (chỉ thư mục ảnh) |
| 101 | Homestay / khách sạn | Nhất Phượng Homestay | Mù Cang Chải |  | — | — | 5→5 | (chỉ thư mục ảnh) |
| 102 | Homestay / khách sạn | Nắng Hotel | Mù Cang Chải |  | — | — | 7→7 | (chỉ thư mục ảnh) |
| 103 | Homestay / khách sạn | Sky Motel | Mù Cang Chải |  | — | — | 6→6 | (chỉ thư mục ảnh) |
| 104 | Homestay / khách sạn | Thuật Hà Homestay | Mù Cang Chải |  | — | — | 2→2 | (chỉ thư mục ảnh) |

### Ảnh giống hệt nhau giữa các địa điểm mới

Các cặp sau dùng chung ảnh (cùng nội dung file). Có thể là cùng một cơ sở đăng dưới hai tên — cần người xác nhận. Hệ thống lưu mỗi ảnh một lần và dùng lại cho cả hai.

- Nhất Phượng Homestay ↔ Wind's Homestay: 4 ảnh
- Nhà hàng Quyền Hường ↔ Nhà hàng Vườn Đào: 2 ảnh
- Nhà hàng Thành Oanh ↔ Nhà hàng Tuấn Thúy: 1 ảnh

## 3. Dòng Excel đã có sẵn trong hệ thống (đối chiếu với DB)

| Sheet | Dòng | Tên trong Excel | Bản ghi trong hệ thống |
|---|---:|---|---|
| Điểm đến | 2 | Đồi Mâm Xôi | #18 Đồi Mâm Xôi (La Pán Tẩn) |
| Điểm đến | 3 | Đèo Khau Phạ | #19 Đèo Khau Phạ |
| Điểm đến | 4 | Thung lũng Tú Lệ | #40 Thung lũng Tú Lệ |
| Điểm đến | 5 | Thác Pú Nhu | #41 Thác Pú Nhu |
| Điểm đến | 6 | Thác Mơ | #42 Thác Mơ |
| Điểm đến | 7 | Đồi Móng Ngựa | #23 Đồi Móng Ngựa |
| Điểm đến | 8 | Rừng Trúc | #43 Rừng Trúc Mồ Dề (Nả Háng Tủa) |
| Điểm đến | 9 | Sống Lưng Khủng Long | #44 Sống Lưng Khủng Long (Dế Xu Phình) |
| Điểm đến | 10 | Đồi Kim Nọi - Võng lúa Háng đăng dê | #45 Đồi Kim Nọi - Võng lúa Háng Đăng Dê |
| Điểm đến | 11 | Thác Hầu đề | #46 Thác Hầu Đề |
| Điểm đến | 12 | Mâm Xôi Nhỏ | #47 Mâm Xôi Nhỏ |
| Điểm đến | 13 | Hoa đào rừng ( Hoa Tớ Dầy) La Pán Tẩn | #48 Rừng hoa đào Tớ Dày La Pán Tẩn |
| Đặc sản | 2 | Xôi nếp Tú Lệ / xôi ngũ sắc | #49 Xôi nếp Tú Lệ / Xôi ngũ sắc |
| Đặc sản | 3 | Cá suối nướng | #50 Cá suối nướng than hoa |
| Đặc sản | 4 | Pa pỉnh tộp | #51 Pa pỉnh tộp (Cá gập nướng kiểu Thái) |
| Đặc sản | 5 | Thịt lợn bản kẹp cây rừng nướng | #52 Thịt lợn bản kẹp cây rừng nướng |
| Đặc sản | 6 | Gà đen Mù Cang Chải | #53 Gà đen Mù Cang Chải |
| Đặc sản | 7 | Gà nướng lá mắc mật, nướng mắc khén | #54 Gà nướng lá mắc mật & mắc khén |
| Đặc sản | 8 | Cá hồi, cá tầm Khau Phạ | #55 Cá hồi, cá tầm Khau Phạ |
| Đặc sản | 9 | Cua suối rang muối | #56 Cua suối rang muối |
| Đặc sản | 10 | Châu chấu rang | #57 Châu chấu rang lá chanh |
| Đặc sản | 11 | Nhộng ong rừng, sâu tre | #58 Nhộng ong rừng, sâu tre xào măng |
| Đặc sản | 12 | Măng đắng, rau rừng/cải mèo | #59 Măng đắng, rau rừng & Cải mèo |
| Đặc sản | 13 | Bánh chưng đen | #60 Bánh chưng đen Mù Cang Chải |
| Đặc sản | 14 | Cốm Tú Lệ | #61 Cốm Tú Lệ (Ngọc xanh Tây Bắc) |
| Đặc sản | 15 | Táo mèo / sơn tra và rượu táo mèo | #62 Táo mèo (Sơn tra) & Rượu táo mèo |
| Đặc sản | 16 | Mật ong rừng; lạp xưởng; thịt hun khói/gác bếp; nếp Tú Lệ; măng khô | #63 Thịt hun khói, Lạp xưởng & Mật ong rừng |

## 4. Thư mục ảnh → nơi gắn

| Thư mục | Ảnh | Khác nhau | Video | Gắn vào | Ghi chú |
|---|---:|---:|---:|---|---|
| ẢNH HOMESTAY MCC/Chely Hotel | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOMESTAY MCC/Chiba Ecolodge | 17 | 17 | 0 | Chiba Ecolodge (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Duy Vũ hotel | 6 | 6 | 0 | địa điểm có sẵn "Nhà nghỉ Duy Vũ" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Hoa sơn tra | 11 | 11 | 1 | địa điểm có sẵn "Hoa Sơn Trà Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Hà Châu 2 Homestay | 49 | 30 | 1 | Hà Châu 2 Homestay (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Hạnh Phúc Creek | 7 | 7 | 0 | Hạnh Phúc Creek (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Mai Linh Hotel | 28 | 28 | 4 | địa điểm có sẵn "Mai Linh Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Newhightland hotel | 17 | 17 | 2 | địa điểm có sẵn "New Highland Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/Nhà Nghỉ Ngủ | 10 | 10 | 1 | Nhà Nghỉ Ngủ (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Nhất Phượng Homestay | 5 | 5 | 0 | Nhất Phượng Homestay (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Nắng Hotel | 7 | 7 | 0 | Nắng Hotel (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Sky Motel | 6 | 6 | 0 | Sky Motel (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Thuật Hà homestay | 2 | 2 | 1 | Thuật Hà Homestay (tạo mới chỉ từ ảnh) |  |
| ẢNH HOMESTAY MCC/Win Homestay | 20 | 20 | 1 | Wind's Homestay | ⚠ tên gần giống ("Win" ~ "Wind's"), cần người xác nhận |
| ẢNH HOMESTAY MCC/ẢNH BAAN MA LÍ HOMESTAY | 14 | 14 | 0 | địa điểm có sẵn "Baan Mali Homestay" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY BẢO LAN | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY CƯỜNG TÚ | 0 | 0 | 0 | Homestay Cường Tú |  |
| ẢNH HOMESTAY MCC/ẢNH HOMESTAY MÙA VÀNG | 16 | 16 | 1 | địa điểm có sẵn "Homestay Mùa Vàng" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/ẢNH MỘC HOMESTAY | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOMESTAY MCC/ẢNH PÚ NHU HOUSE | 0 | 0 | 0 | Pú Nhu Homestay | ⚠ tên gần giống ("Pú Nhu House" ~ "Pú Nhu Homestay") |
| ẢNH HOMESTAY MCC/🍀Đồi đổi gió homestay | 10 | 10 | 3 | địa điểm có sẵn "Đồi Đổi Gió" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH BULGALOW XUÂN GIANG | 17 | 17 | 3 | địa điểm có sẵn "Bulgalow Xuân giang" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH CÔ GÁI THÁI HOMESTAY | 35 | 29 | 0 | địa điểm có sẵn "Cô Gái Thái Homestay" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY ANH TÚC | 14 | 13 | 0 | địa điểm có sẵn "Homestay Anh Túc" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH HOMESTAY HOÀ THẢO | 24 | 24 | 0 | địa điểm có sẵn "Homestay Hoà Thảo" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOMESTAY MCC/🍀ẢNH TRAI BẢN HOMESTAY | 15 | 14 | 0 | địa điểm có sẵn "Trai Bản Homestay" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/ẢNH HOTEL CHELLY | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOTEL - KHÁCH SẠN MCC/ẢNH HOTEL THUẬT HÒA | 0 | 0 | 0 | — | thư mục rỗng, không có gì để nhập |
| ẢNH HOTEL - KHÁCH SẠN MCC/ẢNH NHÀ NGHỈ DUY VŨ | 4 | 4 | 0 | địa điểm có sẵn "Nhà nghỉ Duy Vũ" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/🍀MAI LINH HOTEL | 15 | 15 | 0 | địa điểm có sẵn "Mai Linh Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/🍀ẢNH HOA SƠN TRÀ HOTEL | 9 | 9 | 0 | địa điểm có sẵn "Hoa Sơn Trà Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| ẢNH HOTEL - KHÁCH SẠN MCC/🍀ẢNH NEWHIGHLAND HOTEL | 15 | 15 | 0 | địa điểm có sẵn "New Highland Hotel" | KHÔNG gắn (giữ nguyên địa điểm hiện có; thêm --attach-existing nếu muốn) |
| NHÀ HÀNG/NHÀ HÀNG THUẬT HÒA | 0 | 0 | 0 | Quán Thuật Hà | ⚠ tên gần giống ("Thuật Hòa" ~ "Thuật Hà") |
| NHÀ HÀNG/🍀NHÀ HÀNG QUYỀN HƯỜNG | 20 | 20 | 0 | Nhà hàng Quyền Hường |  |
| NHÀ HÀNG/🍀NHÀ HÀNG THÀNH OANH | 5 | 5 | 0 | Nhà hàng Thành Oanh |  |
| NHÀ HÀNG/🍀NHÀ HÀNG TUẤN TUẤN THÚY | 9 | 9 | 0 | Nhà hàng Tuấn Thúy | ⚠ khớp tên (thư mục viết "Tuấn Tuấn Thúy") |
| NHÀ HÀNG/🍀VƯỜN ĐÀO QUÁN | 5 | 5 | 1 | Nhà hàng Vườn Đào |  |

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
| Nhà nghỉ Duy Vũ (#31) | 1 | 10 | 10 | chưa gắn |
| Hoa Sơn Trà Hotel (#14) | 1 | 20 | 20 | chưa gắn |
| Mai Linh Hotel (#52) | 1 | 43 | 29 | chưa gắn |
| New Highland Hotel (#12) | 3 | 32 | 27 | chưa gắn |
| Baan Mali Homestay (#15) | 1 | 14 | 14 | chưa gắn |
| Homestay Mùa Vàng (#32) | 1 | 16 | 16 | chưa gắn |
| Đồi Đổi Gió (#51) | 1 | 10 | 10 | chưa gắn |
| Bulgalow Xuân giang (#38) | 15 | 17 | 15 | chưa gắn |
| Cô Gái Thái Homestay (#39) | 6 | 35 | 24 | chưa gắn |
| Homestay Anh Túc (#11) | 1 | 14 | 13 | chưa gắn |
| Homestay Hoà Thảo (#16) | 1 | 24 | 24 | chưa gắn |
| Trai Bản Homestay (#13) | 1 | 15 | 14 | chưa gắn |

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

**Mong Ngua Homestay**
- Link Google Maps https://maps.app.goo.gl/yX1AGbrf8MtaF3hZ9 trỏ tới "MÓNG NGỰA HOMESTAY _ Hoàng Su Phì" (22.5625864,104.7271333) — NGOÀI vùng Mù Cang Chải, đã bỏ link và toạ độ này (link trong file nguồn có thể sai)

**Homestay Cường Tú**
- Thư mục ảnh "ẢNH HOMESTAY MCC/ẢNH HOMESTAY CƯỜNG TÚ" gắn vào đây — khớp tên

**Homestay Tư Nguyệt**
- Địa chỉ ở sheet "Homestay": "Kim Nọi" (khác sheet reviewer, lấy sheet reviewer)
- Giá ở sheet "Homestay": "Khoảng 100.000 – 150.000 VNĐ/người/đêm (ngủ sàn cộng đồng); 400.000 – 600.000 VNĐ/phòng riêng/đêm"
- Có mặt ở cả hai sheet "Homestay" và "Homestay reviewer" — đã gộp thành một

**Homestay Quyết Đoản**
- Link Google Maps ghi ở dòng này (https://maps.app.goo.gl/LuyZimyhMHMQjmUT6) thực chất là của "Hoai Phuong Homestay" (Google Maps: "Hoai Phuong Homestay"); đã chuyển sang đó, dòng này chưa có toạ độ

**Hoai Phuong Homestay**
- Toạ độ & link Google Maps lấy từ dòng "Homestay Quyết Đoản" trong file nguồn (link ghi ở dòng đó thực chất là của cơ sở này: Google Maps gọi là "Hoai Phuong Homestay")

**Wind's Homestay**
- Cột Ưu điểm / Hạn chế / Phù hợp trong file nguồn bị lệch; đã sắp lại theo nội dung
- Thư mục ảnh "ẢNH HOMESTAY MCC/Win Homestay" gắn vào đây — tên gần giống ("Win" ~ "Wind's"), cần người xác nhận

**Pú Nhu Homestay**
- Thư mục ảnh "ẢNH HOMESTAY MCC/ẢNH PÚ NHU HOUSE" gắn vào đây — tên gần giống ("Pú Nhu House" ~ "Pú Nhu Homestay")

**GARRYA Mù Cang Chải**
- Giá "$150 – $370/đêm (đã gồm thuế phí)" không phải VND nên chưa điền giá tham khảo (đã ghi trong mô tả)

**Nhà hàng Quyền Hường**
- Địa chỉ ở sheet "Nhà hàng": "khu trung tâm, QL32"
- Thư mục ảnh "NHÀ HÀNG/🍀NHÀ HÀNG QUYỀN HƯỜNG" gắn vào đây — khớp tên

**Quán Mạnh Thơm**
- Tên ở sheet "Nhà hàng": "Nhà Sàn Quán Mạnh Thơm"
- Địa chỉ ở sheet "Nhà hàng": "QL32"

**Nhà hàng Tuấn Thúy**
- Tên ở sheet "Nhà hàng": "Quán Ăn Mu Cang Chai"
- Dòng "Quán Ăn Mu Cang Chai" (QL32) được người rà soát ghi chú là "Nhà hàng tuấn thúy" — gộp vào đây
- Thư mục ảnh "NHÀ HÀNG/🍀NHÀ HÀNG TUẤN TUẤN THÚY" gắn vào đây — khớp tên (thư mục viết "Tuấn Tuấn Thúy")

**Nhà hàng Hằng Béo**
- Người rà soát ghi "Không có, bổ sung nhà hàng luận còi hoặc cường hạnh" — nghi cơ sở không còn / không tồn tại, cần xác minh trước khi dùng (Luận Còi, Cường Hạnh chỉ được nhắc tên, chưa có dữ liệu nên chưa tạo)

**Nhà hàng A Tân Quán**
- Địa chỉ ở sheet "Nhà hàng": "Tổ 1"

**Nhà hàng Thùy Linh**
- Địa chỉ ở sheet "Nhà hàng": "Thôn 2"
- Khoảng giá ở sheet "Nhà hàng": "150.000 - 1.500.000" (lấy sheet reviewer)

**Nhà hàng Vườn Đào**
- Thư mục ảnh "NHÀ HÀNG/🍀VƯỜN ĐÀO QUÁN" gắn vào đây — khớp tên

**Nhà hàng Thành Oanh**
- Tên ở sheet "Nhà hàng": "Nhà Hàng Thành Oanh Thắng Cố Ngựa"
- Địa chỉ ở sheet "Nhà hàng": "khu Mù Cang Chải"
- Thư mục ảnh "NHÀ HÀNG/🍀NHÀ HÀNG THÀNH OANH" gắn vào đây — khớp tên

**Quán Thuật Hà**
- Thư mục ảnh "NHÀ HÀNG/NHÀ HÀNG THUẬT HÒA" gắn vào đây — tên gần giống ("Thuật Hòa" ~ "Thuật Hà")

**Nhà hàng Hương Ly**
- Nhà hàng reviewer dòng 11: số "01252213319" không đúng định dạng số điện thoại hiện hành, cần gọi kiểm tra

**Hà Trang (Lai Châu)**
- Gộp dịch vụ "Đặt trước vé xe khách chiều về Hà Nội" (sheet Dịch vụ reviewer) và SĐT trong sheet Di chuyển reviewer

**Thuê xe máy tự lái (Thị trấn / Ngã Ba Kim)**
- Di chuyển reviewer dòng 8: bỏ số không hợp lệ "0924 904"

**Xe khách giường nằm Hà Nội – Mù Cang Chải (tổng hợp các nhà xe)**
- Dòng tổng hợp nhiều nhà xe (Khánh Thủy, Cường Lan, Hà Trang...). Khánh Thủy chỉ được nhắc tên, chưa có SĐT nên chưa tạo riêng

**Đỉnh Tà Xùa (Trạm Tấu, Yên Bái)**
- Giá "50.000đ - 1.200.000đ/gói porter" lấy nguyên từ file (khoảng rất rộng)

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
