# FS – EP02 Khám phá quanh Homestay

> **Nguồn:** `User_Story_Phase2/00_Tong_quan.md` (BR-C01 → BR-C08, XN-1 → XN-13) và US02.01 → US02.04 (BR-02.01 → BR-02.08,
> AC-02.01 → AC-02.23). Khi tài liệu này khác user story thì **user story là chuẩn**. Nội dung tự đề xuất được đánh dấu
> **(đề xuất)**.
> **Hệ thống đích:** mã nguồn hiện tại (Spring Boot 3.5 + JPA + Liquibase/PostgreSQL; React + Vite + TypeScript + Tailwind;
> bản đồ Leaflet qua `components/map/VietmapView.tsx`). Không đổi công nghệ.
> **Trạng thái:** ĐÃ CODE 2026-10-15 (Đợt 1–4, chưa commit). Kết quả: §9; điểm khác bản đặc tả: §10. Khảo sát trên nhánh `tuyenchuyenvan` @ `d636504`, ngày 2026-10-15.

---

## 0. Hệ thống hiện có liên quan EP02 (đã kiểm chứng trong mã nguồn)

| Đã có | Chi tiết | Dùng lại cho |
|---|---|---|
| Bảng `place` | `kind` (HOMESTAY, ATTRACTION, RESTAURANT, CULTURE, PHOTO, RENTAL, TRANSPORT, SERVICE), `name`, `description`, `address`, `latitude/longitude numeric(9,6)`, `visibility` (DRAFT/PUBLISHED/UNPUBLISHED), `operation_status`, `is_deleted`, `provider_id`, `verification` (xác minh **nội dung**, không phải tọa độ) | Thực thể Địa điểm |
| `place_media` | Ảnh bìa (COVER, tối đa 1) + bộ ảnh (GALLERY), trỏ `media_asset` | Ảnh địa điểm |
| `place_opening_hour` | Giờ mở cửa theo thứ (1 = thứ Hai … 7 = Chủ nhật), `is_closed` | Giờ mở cửa (BR-02.01, BR-C07) |
| `place_contact` | Kênh PHONE, WEBSITE, ZALO, FACEBOOK, GOOGLE_MAPS… | Số điện thoại, website |
| `app_setting` | Bảng khóa – giá trị (`setting_key`, `setting_value`) | Cấu hình bán kính (BR-02.04) |
| `partner_change_request` | NCC gửi sửa đổi, Admin duyệt; nội dung chính thức chỉ đổi khi duyệt | BR-C02, BR-C03 cho địa điểm của NCC |
| `GET /api/public/places/{id}/nearby` | Truy vấn trong bán kính (tối đa 30 km), có hộp tọa độ `GeoBox` | Tham khảo cách truy vấn; **không** đáp ứng BR-02.06 / BR-C05 nên viết API mới |
| Upload ảnh | Supabase Storage, chặn **4 MB**; frontend tự nén ảnh về ≤ 4 MB (`lib/imageCompress.ts`) | BR-02.01 (5 MB) |
| Chỉ đường | `lib/mapUtils.ts#openGoogleMapsDirections`, điểm đi luôn là "Current Location" | Cần thêm điểm đi = homestay (BR-02.08) |
| Admin "Duyệt điểm đến" | Danh sách địa điểm, đổi xác minh nội dung, ẩn / hiện, xóa. **Không có** form tạo / sửa địa điểm | Màn quản lý địa điểm phải làm mới |
| NCC | Chỉ quản lý **homestay**; chưa có màn quản lý địa điểm khác | Màn NCC phải làm mới |

**Chưa có:** cờ "Tọa độ đã xác minh" (BR-C05), trạng thái duyệt cho địa điểm NCC tạo, bảng ghim, cấu hình bán kính,
API "Khám phá quanh đây", mục giao diện trên trang homestay, bộ chạy test frontend, Docker/psql trên máy phát triển.

---

## 1. Đối chiếu yêu cầu gốc với US02.01 → US02.04

| # | Ý trong yêu cầu gốc | Story / BR đáp ứng | Đánh giá | Đề xuất bổ sung |
|---|---|---|---|---|
| 1 | Mục "Khám phá quanh đây" tại trang chi tiết homestay | US02.03 | Đáp ứng | — |
| 2 | Nhà hàng, quán ăn, điểm check-in, điểm tham quan, hoạt động trải nghiệm, dịch vụ địa phương | BR-02.01 (5 danh mục) | Đáp ứng. "Nhà hàng" và "quán ăn" gộp chung danh mục Ăn uống | Ánh xạ danh mục ↔ `place.kind` ở §4.2 **(đề xuất)** |
| 3 | Mỗi địa điểm có hình ảnh, tên, mô tả ngắn | BR-02.01, US02.03 | Đáp ứng. Bảng `place` chỉ có `description` dài, **chưa có mô tả ngắn ≤ 300** | Thêm cột `summary` **(đề xuất)**, xem Q3 |
| 4 | Vị trí trên bản đồ | US02.03 (bản đồ nhỏ), US02.04 | Đáp ứng, nhưng chỉ cho địa điểm có tọa độ **đã xác minh** (BR-C05) | — |
| 5 | Khoảng cách tham khảo **nếu có dữ liệu** | BR-C06 | **Chưa khớp hoàn toàn.** Yêu cầu gốc ngầm hiểu địa điểm chưa có tọa độ vẫn được giới thiệu, chỉ không có khoảng cách. BR-02.03 lại loại hẳn địa điểm chưa có tọa độ đã xác minh | Giữ theo BR-02.03 (khách hàng đã duyệt qua XN-2). Cân nhắc cho địa điểm **ghim** chưa có tọa độ xác minh hiện không kèm khoảng cách, bản đồ → **Q1** |
| 6 | Nhấn để xem thông tin chi tiết | US02.04 | Đáp ứng | — |
| 7 | Hướng dẫn đường đi | BR-02.08 | Đáp ứng (mở ứng dụng bản đồ ngoài) | — |
| 8 | Đối tượng: khách du lịch | US02.03, US02.04 | Đáp ứng. US02.01, US02.02 thêm Admin, NCC để có dữ liệu | — |
| 9 | (ngầm định) Có dữ liệu ngay khi ra mắt | Không có story | **Chưa đáp ứng.** Dữ liệu địa điểm hiện có (nhập từ đợt trước) đều chưa có cờ tọa độ đã xác minh → mục sẽ trống ở mọi homestay cho tới khi Admin xác minh từng điểm | Thêm thao tác "Xác minh tọa độ hàng loạt" cho Admin **(đề xuất)** → **Q2** |
| 10 | (ngầm định) Địa điểm tạm đóng cửa | Không có BR | **Chưa đặc tả** | Loại địa điểm `TEMP_CLOSED` khỏi mục **(đề xuất)** → **Q4** |

---

## 2. Danh sách màn hình

Quy ước trạng thái: **D** = có dữ liệu · **R** = rỗng · **BĐ** = lỗi bản đồ · **TĐ** = thiếu tọa độ · **M** = mobile 360 px.

### 2.1 Phía khách

#### KH-01 Mục "Khám phá quanh đây" (trong trang chi tiết homestay `/homestays/:id`)

| Thành phần | Mô tả | BR / AC |
|---|---|---|
| Tiêu đề mục | "Khám phá quanh đây" + liên kết trong thanh điều hướng mục của trang | — |
| Thanh lọc danh mục | Chip: Tất cả, Ăn uống, Tham quan, Check-in, Trải nghiệm, Dịch vụ địa phương. Chỉ hiện chip của danh mục có ít nhất 1 địa điểm **(đề xuất)** | AC-02.17 |
| Thẻ địa điểm | Ảnh bìa, tên, nhãn danh mục, mô tả ngắn, khoảng cách + nhãn "khoảng cách tham khảo", huy hiệu "Nổi bật" nếu được ghim **(đề xuất)** | BR-02.06, BR-C06, BR-C08 |
| Nút "Xem thêm" | Tải thêm 10; ẩn khi hết | BR-02.07, AC-02.15 |
| Bản đồ nhỏ | Ghim homestay (màu chính) + ghim các địa điểm **đang hiển thị trong danh sách**; bấm ghim → mở KH-02 | AC-02.17, BR-C05 |

| Trạng thái | Hiển thị |
|---|---|
| D | Lưới thẻ (2 cột ≥ 768 px, 1 cột dưới) + bản đồ bên phải (≥ 1024 px) hoặc phía trên danh sách (dưới 1024 px) |
| R | Homestay không có địa điểm đủ điều kiện → **không render mục**, không để khoảng trống, không có liên kết trong thanh điều hướng (AC-02.18) |
| R (sau lọc) | Danh mục đang chọn không có địa điểm không xảy ra vì chip chỉ hiện danh mục có dữ liệu |
| BĐ | Danh sách thẻ vẫn hiện; vùng bản đồ báo "Không tải được bản đồ" (AC-02.19) |
| TĐ | Homestay chưa có tọa độ → ẩn mục (BR-02.07) |
| M | 1 cột thẻ, ảnh 16:9, bản đồ cao 220 px đặt trên danh sách, chip lọc cuộn ngang, không tràn ngang |

#### KH-02 Chi tiết địa điểm (bảng trượt từ đáy trên điện thoại, hộp thoại trên máy tính) **(đề xuất)**

Dùng popup thay vì chuyển trang để nút Chỉ đường biết điểm xuất phát là homestay đang xem (BR-02.08). Có liên kết
"Mở trang đầy đủ" tới `/places/:id` sẵn có.

| Thành phần | Mô tả | BR / AC |
|---|---|---|
| Bộ ảnh | Ảnh trượt, bấm phóng to (dùng `ImageLightbox` sẵn có) | US02.04 |
| Tên, danh mục | | |
| Trạng thái mở / đóng | "Đang mở cửa, đóng lúc 21:00" / "Đã đóng cửa, mở lúc 07:00 thứ Ba" / "Hôm nay nghỉ"; tính theo giờ Việt Nam | BR-C07, AC-02.23 |
| Giờ mở cửa theo tuần | Bảng 7 ngày, ngày hôm nay in đậm | BR-02.01 |
| Mô tả, địa chỉ, điện thoại, website | Trường trống thì **ẩn cả dòng** | BR-C08, AC-02.20 |
| Bản đồ vị trí | Ghim địa điểm + ghim homestay | BR-C05 |
| Khoảng cách | "2,4 km · khoảng cách tham khảo" | BR-C06 |
| Nút "Chỉ đường" | Điểm đi = homestay, điểm đến = địa điểm; chỉ hiện khi tọa độ đã xác minh | BR-02.08, AC-02.21, AC-02.22 |
| Nút "Quay lại homestay" | Đóng popup | US02.04 |

| Trạng thái | Hiển thị |
|---|---|
| D | Như trên |
| R | Không áp dụng (chỉ mở từ thẻ có dữ liệu). Địa điểm vừa bị ẩn giữa lúc khách mở → "Địa điểm không còn hiển thị" |
| BĐ | Ẩn vùng bản đồ, hiện "Không tải được bản đồ"; nút Chỉ đường vẫn dùng được |
| TĐ | Không xảy ra ở KH-02 vì địa điểm không có tọa độ đã xác minh không vào được mục |
| M | Bảng trượt cao tối đa 90% màn hình, nút Chỉ đường cố định ở đáy, vùng chạm ≥ 44 px |

### 2.2 Phía quản trị (Admin)

#### AD-01 Quản lý địa điểm (mục menu mới "Địa điểm khám phá", nhóm Quản lý) **(đề xuất)**

Chỉ quản lý địa điểm không phải homestay. Màn "Duyệt điểm đến" hiện có giữ nguyên.

| Thành phần | Mô tả | BR / AC |
|---|---|---|
| Bộ lọc | Danh mục (5); trạng thái: Hiển thị / Ẩn / Chờ duyệt / Bị từ chối; tọa độ: Đã xác minh / Chưa xác minh / Chưa có tọa độ; ô tìm theo tên | US02.01 |
| Danh sách | Ảnh, tên, danh mục, NCC (nếu có), trạng thái, cờ tọa độ; cảnh báo "Chưa có tọa độ" | AC-02.01 |
| Hành động dòng | Sửa, Ẩn / Hiển thị, Bật / Tắt "Tọa độ đã xác minh", Duyệt / Từ chối (địa điểm NCC đang chờ) | BR-C02, BR-C05, AC-02.08 |
| Nút "Thêm địa điểm" | Mở AD-02 | AC-02.01 |
| Xác minh tọa độ hàng loạt | Chọn nhiều dòng → bật cờ **(đề xuất)** | Q2 |

| Trạng thái | Hiển thị |
|---|---|
| D | Bảng (máy tính) / danh sách thẻ (điện thoại) |
| R | "Chưa có địa điểm nào" + nút Thêm; lọc không ra kết quả → "Không có địa điểm phù hợp bộ lọc" + nút Bỏ lọc |
| BĐ | Không có bản đồ ở danh sách |
| TĐ | Nhãn vàng "Chưa có tọa độ"; nút bật cờ xác minh bị khóa kèm gợi ý "Nhập tọa độ trước" |
| M | Thẻ dọc, hành động gom vào nút "…" |

#### AD-02 Form thêm / sửa địa điểm (Admin và NCC dùng chung, NCC không có cờ xác minh)

| Thành phần | Mô tả | BR / AC |
|---|---|---|
| Tên * | Bộ đếm x/100 | BR-02.01 |
| Danh mục * | 5 lựa chọn | BR-02.01, AC-02.02 |
| Mô tả ngắn * | Bộ đếm x/300 | BR-02.01 |
| Mô tả chi tiết | Không bắt buộc **(đề xuất, dùng cột `description` sẵn có)** | |
| Ảnh * | 1–10 ảnh, JPG/PNG/WebP, ảnh gốc ≤ 5 MB; chọn ảnh bìa | BR-02.01, AC-02.02 |
| Địa chỉ | | |
| Tọa độ | Bản đồ chọn điểm (bấm / kéo ghim) **hoặc** ô vĩ độ, kinh độ thập phân; hai cách đồng bộ với nhau | BR-02.02, AC-02.03 |
| Giờ mở cửa | 7 dòng: Nghỉ / Mở từ – đến | BR-02.01 |
| Điện thoại, Website | | BR-02.01 |
| Cờ "Tọa độ đã xác minh" (chỉ Admin) | Tự tắt khi tọa độ đổi, có ghi chú giải thích | BR-C05, AC-02.05 |
| Hiển thị / Ẩn (chỉ Admin) | | BR-02.03 |

| Trạng thái | Hiển thị |
|---|---|
| D | Form đầy đủ |
| R | Form trống khi thêm mới |
| BĐ | Ẩn bản đồ chọn điểm, chỉ còn ô nhập vĩ độ / kinh độ + thông báo "Không tải được bản đồ, hãy nhập tọa độ" |
| TĐ | Được lưu khi chưa có tọa độ (tọa độ là tùy chọn); sau khi lưu hiện cảnh báo "Chưa có tọa độ" (AC-02.01) |
| M | Một cột, bản đồ cao 240 px, ảnh dạng lưới 3 cột |

#### AD-03 Tab "Khám phá quanh đây" của homestay (trong khung xem homestay của "Duyệt điểm đến") **(đề xuất vị trí)**

| Thành phần | Mô tả | BR / AC |
|---|---|---|
| Bán kính hệ thống | Ô số km + nút Lưu; áp dụng toàn hệ thống | BR-02.04, AC-02.13 |
| Danh sách ghim | Thứ tự kéo hoặc lên / xuống, bỏ ghim, bộ đếm x/10 | BR-02.05, AC-02.10, AC-02.11 |
| Tìm để ghim | Tìm theo tên trong **mọi** địa điểm đủ điều kiện, kể cả ngoài bán kính | AC-02.12 |
| Địa điểm trong bán kính | Danh sách kèm khoảng cách, tăng dần; nút "Ghim" | AC-02.09 |
| Xem trước | "Khách sẽ thấy": 10 thẻ đầu theo đúng thứ tự BR-02.06 **(đề xuất)** | |

| Trạng thái | Hiển thị |
|---|---|
| D | Như trên |
| R | "Không có địa điểm đủ điều kiện trong {N} km" + gợi ý tăng bán kính hoặc ghim địa điểm xa hơn |
| BĐ | Không dùng bản đồ |
| TĐ | Homestay chưa có tọa độ → "Cần bổ sung tọa độ homestay trước khi cấu hình", khóa mọi thao tác (AC-02.14) |
| M | Một cột; ghim hiển thị dạng danh sách có nút lên / xuống |

### 2.3 Phía NCC

#### NCC-01 Địa điểm của tôi (mục menu mới trong cổng NCC) **(đề xuất)**

| Thành phần | Mô tả | BR / AC |
|---|---|---|
| Danh sách | Chỉ địa điểm của NCC đang đăng nhập; trạng thái Chờ duyệt / Đang hiển thị / Bị từ chối (kèm lý do) / Ẩn; nhãn "Có thay đổi chờ duyệt" | BR-C01, BR-C02, BR-C03 |
| Thêm / Sửa | Mở AD-02 (không có cờ xác minh, không có Hiển thị / Ẩn) | AC-02.06 |

| Trạng thái | Hiển thị |
|---|---|
| D | Danh sách thẻ |
| R | "Bạn chưa có địa điểm nào" + nút Thêm |
| BĐ, TĐ | Như AD-02 |
| M | Một cột |

Truy cập địa điểm của NCC khác → trang báo "Bạn không có quyền truy cập nội dung này" (AC-02.07).

---

## 3. Luồng nghiệp vụ

### L1 – Admin tạo địa điểm (US02.01)
1. Admin mở AD-01 → "Thêm địa điểm".
2. Nhập tên, danh mục, mô tả ngắn, ≥ 1 ảnh; tùy chọn địa chỉ, tọa độ, giờ mở cửa, điện thoại, website.
3. Bấm Lưu → hệ thống kiểm tra (§5).
4. Lưu thành công: trạng thái **Hiển thị + Đã duyệt** ngay (BR-C02, Admin tạo), cờ tọa độ = chưa xác minh.
5. Danh sách hiện địa điểm, kèm cảnh báo "Chưa có tọa độ" nếu bỏ trống (AC-02.01).

- **L1-A1 (thay thế):** Admin bật luôn cờ "Tọa độ đã xác minh" trong form khi đã nhập tọa độ → địa điểm đủ điều kiện xuất hiện ở KH-01 ngay.
- **L1-E1 (ngoại lệ):** thiếu danh mục / ảnh / tên / mô tả ngắn → không lưu, báo lỗi dưới từng ô (AC-02.02).
- **L1-E2:** tọa độ ngoài vùng phục vụ → không lưu, báo lỗi tại ô tọa độ (AC-02.03).
- **L1-E3:** ảnh > 5 MB, sai định dạng, quá 10 ảnh → chặn ngay khi chọn ảnh.
- **L1-E4:** tải ảnh lỗi (mạng / kho ảnh) → ảnh đó báo lỗi, các ảnh khác giữ nguyên; không cho lưu khi còn ảnh đang tải.

### L2 – NCC tạo địa điểm (US02.01, BR-C01, BR-C02)
1. NCC mở NCC-01 → "Thêm địa điểm" → nhập như L1 (không có cờ xác minh).
2. Bấm Gửi → địa điểm được tạo ở trạng thái **Chờ duyệt**, `provider_id` = NCC; khách chưa thấy (AC-02.06).
3. Hệ thống thông báo cho Admin (BR-C04).
4. Admin duyệt (L4) → Hiển thị; hoặc từ chối → NCC thấy lý do, sửa và gửi lại.

### L3 – NCC sửa địa điểm đã duyệt (BR-C03)
1. NCC sửa → bấm Gửi.
2. Hệ thống tạo yêu cầu thay đổi (`partner_change_request`, đích `PLACE`); **dữ liệu khách đang thấy không đổi**.
3. Admin duyệt → áp dụng thay đổi. Nếu tọa độ đổi → cờ xác minh tự tắt (BR-C05).
4. Admin từ chối (lý do 10–500 ký tự) → bản đang hiển thị giữ nguyên; NCC được thông báo kèm lý do.

### L4 – Admin duyệt / từ chối địa điểm của NCC
1. AD-01 lọc "Chờ duyệt" → mở địa điểm → xem nội dung (với L3: xem so sánh cũ / mới qua màn "Yêu cầu thay đổi" sẵn có).
2. Duyệt → Hiển thị; thông báo NCC.
3. Từ chối → nhập lý do 10–500 ký tự → Bị từ chối; thông báo NCC.
- **L4-E1:** lý do < 10 hoặc > 500 ký tự → chặn.
- **L4-E2:** hai Admin xử lý cùng lúc → người sau nhận "Địa điểm đã được xử lý", không ghi đè (khóa dòng).

### L5 – Xác minh tọa độ (BR-C05)
1. Admin bật cờ ở AD-01 hoặc AD-02 → lưu thời điểm và người xác minh.
2. Địa điểm đủ điều kiện (hiển thị + đã duyệt + cờ bật) → xuất hiện ở KH-01 (AC-02.04).
- **L5-A1:** Admin hoặc NCC (khi được duyệt) đổi tọa độ → cờ tự tắt → địa điểm rời KH-01 tới khi xác minh lại (AC-02.05).
- **L5-E1:** địa điểm chưa có tọa độ → không bật được cờ.
- **L5-E2:** NCC gọi API bật cờ → 403.

### L6 – Ẩn / hiển thị (BR-02.03)
1. Admin chuyển Ẩn → địa điểm biến mất khỏi mọi trang phía khách ở lần tải tiếp theo (AC-02.08); vẫn giữ trong cấu hình ghim (BR-02.05).
2. Chuyển Hiển thị lại → quay lại vị trí ghim cũ (nếu có).

### L7 – Cấu hình "Khám phá quanh đây" của homestay (US02.02)
1. Admin mở AD-03 của homestay A.
2. A chưa có tọa độ → báo "Cần bổ sung tọa độ homestay trước khi cấu hình", dừng (AC-02.14).
3. Hệ thống liệt kê địa điểm đủ điều kiện trong bán kính, kèm khoảng cách, tăng dần (AC-02.09).
4. Admin ghim (từ danh sách hoặc tìm theo tên, kể cả ngoài bán kính – AC-02.12), sắp thứ tự, bỏ ghim.
- **L7-E1:** đã có 10 ghim → chặn "Mỗi homestay ghim tối đa 10 địa điểm" (AC-02.11).
- **L7-E2:** ghim trùng → bỏ qua, báo "Địa điểm đã được ghim".
- **L7-A1:** đổi bán kính hệ thống 1–50 km; ngoài khoảng → "Bán kính phải từ 1 đến 50 km" (AC-02.13).

### L8 – Khách xem "Khám phá quanh đây" (US02.03)
1. Khách mở trang homestay A → hệ thống gọi API Khám phá cho A.
2. A không có tọa độ hoặc không có địa điểm đủ điều kiện → không render mục (AC-02.18).
3. Hiện 10 thẻ đầu theo BR-02.06; còn nữa → nút "Xem thêm" (+10 mỗi lần, AC-02.15).
4. Khách chọn chip danh mục → danh sách và bản đồ chỉ còn danh mục đó; về "Tất cả" → đầy đủ (AC-02.17).
- **L8-E1:** bản đồ lỗi → danh sách vẫn hiện, vùng bản đồ báo lỗi (AC-02.19).
- **L8-E2:** API lỗi → ẩn mục, không làm hỏng phần còn lại của trang **(đề xuất)**.

### L9 – Khách xem chi tiết và chỉ đường (US02.04)
1. Khách bấm thẻ hoặc ghim trên bản đồ → mở KH-02.
2. Hiện các trường có dữ liệu (AC-02.20), trạng thái mở / đóng theo giờ Việt Nam (AC-02.23).
3. Bấm "Chỉ đường" → mở `https://www.google.com/maps/dir/?api=1&origin={homestay}&destination={địa điểm}` ở tab mới. Điện thoại có ứng dụng Google Maps thì hệ điều hành mở ứng dụng; không có thì mở bản web (AC-02.21, AC-02.22).
4. "Quay lại homestay" → đóng popup, giữ nguyên vị trí cuộn và bộ lọc.

---

## 4. Mô hình dữ liệu

### 4.1 Địa điểm – bảng `place` (có sẵn) + cột mới

| Cột | Kiểu | Ràng buộc | Nguồn |
|---|---|---|---|
| `name` | varchar(255) **có sẵn** | Bắt buộc, **≤ 100 ký tự** kiểm ở service khi tạo / sửa (dữ liệu cũ có thể dài hơn) | BR-02.01 |
| `kind` | varchar(16) **có sẵn** | Bắt buộc; ánh xạ danh mục ở §4.2 | BR-02.01 |
| `summary` | varchar(300) **mới** | Bắt buộc khi tạo / sửa | BR-02.01 – mô tả ngắn |
| `description` | text **có sẵn** | Tùy chọn **(đề xuất)** | |
| `address` | varchar(500) **có sẵn** | Tùy chọn | BR-02.01 |
| `latitude`, `longitude` | numeric(9,6) **có sẵn** | Tùy chọn; nhập thì phải đủ cả hai và nằm trong vùng phục vụ | BR-02.02 |
| `coord_verified` | boolean NOT NULL DEFAULT false **mới** | Chỉ Admin bật / tắt; tự về false khi tọa độ đổi; không bật được khi chưa có tọa độ (CHECK) | BR-C05 |
| `coord_verified_at`, `coord_verified_by` | timestamp(6), FK account **mới** | Ghi nhận ai xác minh | BR-C05 |
| `approval_status` | varchar(16) NOT NULL DEFAULT 'APPROVED' **mới** | `PENDING` / `APPROVED` / `REJECTED`; dữ liệu cũ = APPROVED | BR-C02 |
| `reject_reason` | varchar(500) **mới** | Bắt buộc khi REJECTED (CHECK) | BR-C02 |
| `visibility` | **có sẵn** | Hiển thị = `PUBLISHED`; Ẩn = `UNPUBLISHED` | BR-02.03 |
| `provider_id` | **có sẵn** | NULL = Admin tạo; có giá trị = thuộc NCC | BR-C01 |

Ảnh: `place_media` (có sẵn), 1–10 ảnh, đúng 1 ảnh bìa. Giờ mở cửa: `place_opening_hour` (có sẵn). Điện thoại,
website: `place_contact` kênh PHONE, WEBSITE (có sẵn).

**Điều kiện đủ để xuất hiện ở "Khám phá quanh đây"** (BR-02.03, BR-C05): `is_deleted = false` ∧ `visibility = PUBLISHED`
∧ `approval_status = APPROVED` ∧ `coord_verified = true` ∧ `kind ≠ HOMESTAY` ∧ `operation_status = OPERATING`
**(đề xuất, Q4)**.

### 4.2 Danh mục – enum `ExploreCategory` trong mã **(đề xuất: không tạo bảng)**

BR-02.01 liệt kê đúng 5 giá trị cố định, không có story quản lý danh mục, nên khai báo enum và ánh xạ sang `place.kind`:

| Danh mục (hiển thị) | Mã | `place.kind` khi tạo mới | `place.kind` được tính vào danh mục |
|---|---|---|---|
| Ăn uống | `FOOD` | RESTAURANT | RESTAURANT |
| Tham quan | `SIGHTSEEING` | ATTRACTION | ATTRACTION |
| Check-in | `CHECKIN` | PHOTO | PHOTO |
| Trải nghiệm | `EXPERIENCE` | CULTURE | CULTURE |
| Dịch vụ địa phương | `LOCAL_SERVICE` | SERVICE | SERVICE, RENTAL, TRANSPORT |

### 4.3 Ghim địa điểm – homestay: bảng mới `homestay_explore_pin`

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `homestay_id` | FK `place` ON DELETE CASCADE | Phải là `kind = HOMESTAY` (kiểm ở service) |
| `place_id` | FK `place` ON DELETE CASCADE | Phải là địa điểm khám phá (kind ≠ HOMESTAY) |
| `sort_order` | integer NOT NULL | Thứ tự Admin sắp (BR-02.06) |
| `created_by`, `created_at` | FK account ON DELETE SET NULL, timestamp(6) | |

PK `(homestay_id, place_id)`; index `place_id`. Tối đa **10** ghim / homestay, kiểm ở service, có khóa dòng homestay
khi ghim (BR-02.05). Ghim **không** bị xóa khi địa điểm bị Ẩn (BR-02.05); chỉ không hiển thị với khách.

### 4.4 Cấu hình bán kính – `app_setting` (có sẵn)

| Khóa | Giá trị mặc định | Ràng buộc |
|---|---|---|
| `explore.radius_km` | `10` | Số nguyên 1–50 (BR-02.04); áp dụng toàn hệ thống |

### 4.5 Phê duyệt sửa đổi của NCC

Dùng lại `partner_change_request`, thêm đích `PLACE` vào CHECK `target_type` **(đề xuất)**. Khi NCC sửa địa điểm đã duyệt,
nội dung mới nằm trong `payload`; `place` chỉ đổi khi Admin duyệt (BR-C03).

### 4.6 Hằng số – một file duy nhất `ExploreRules.java` (backend) và `exploreRules.ts` (frontend)

| Hằng số | Giá trị | BR |
|---|---|---|
| `NAME_MAX` | 100 | BR-02.01 |
| `SUMMARY_MAX` | 300 | BR-02.01 |
| `IMAGES_MIN` / `IMAGES_MAX` | 1 / 10 | BR-02.01 |
| `IMAGE_MAX_BYTES` | 5 MB (ảnh gốc; sau nén ≤ 4 MB theo kho ảnh) | BR-02.01 |
| `RADIUS_DEFAULT_KM` / `RADIUS_MIN_KM` / `RADIUS_MAX_KM` | 10 / 1 / 50 | BR-02.04 |
| `PIN_MAX` | 10 | BR-02.05 |
| `PAGE_SIZE` | 10 | BR-02.07 |
| `REJECT_REASON_MIN` / `MAX` | 10 / 500 | BR-C02 |
| `SERVICE_AREA` | Hộp tọa độ vĩ độ 21,30–22,90; kinh độ 103,50–105,10 **(đề xuất, XN-13)** | BR-02.02 |
| `ZONE` | `Asia/Ho_Chi_Minh` | BR-C07 |

---

## 5. Validation và thông báo lỗi

| # | Trường / thao tác | Điều kiện | Thông báo |
|---|---|---|---|
| V1 | Tên | Bỏ trống | Vui lòng nhập tên địa điểm. |
| V2 | Tên | > 100 ký tự | Tên địa điểm tối đa 100 ký tự. |
| V3 | Danh mục | Chưa chọn | Vui lòng chọn danh mục. |
| V4 | Mô tả ngắn | Bỏ trống | Vui lòng nhập mô tả ngắn. |
| V5 | Mô tả ngắn | > 300 ký tự | Mô tả ngắn tối đa 300 ký tự. |
| V6 | Ảnh | 0 ảnh | Vui lòng thêm ít nhất 1 ảnh. |
| V7 | Ảnh | > 10 ảnh | Mỗi địa điểm tối đa 10 ảnh. |
| V8 | Ảnh | Ảnh gốc > 5 MB | Ảnh "{tên tệp}" vượt quá 5 MB. |
| V9 | Ảnh | Không phải JPG / PNG / WebP | Chỉ nhận ảnh JPG, PNG hoặc WebP. |
| V10 | Tọa độ | Chỉ nhập một trong hai | Vui lòng nhập đủ vĩ độ và kinh độ. |
| V11 | Tọa độ | Không phải số thập phân | Vĩ độ / kinh độ phải là số thập phân, ví dụ 21.851. |
| V12 | Tọa độ | Ngoài vùng phục vụ | Tọa độ nằm ngoài vùng phục vụ (tỉnh Yên Bái / Lào Cai). |
| V13 | Giờ mở cửa | Ngày mở nhưng thiếu giờ mở hoặc đóng | Vui lòng nhập giờ mở và giờ đóng cho {thứ}. |
| V14 | Giờ mở cửa | Giờ mở = giờ đóng | Giờ mở và giờ đóng không được trùng nhau. |
| V15 | Website | Không bắt đầu bằng http:// hoặc https:// | Website phải bắt đầu bằng http:// hoặc https://. |
| V16 | Điện thoại | Sai định dạng số Việt Nam | Số điện thoại không hợp lệ. |
| V17 | Cờ xác minh | Bật khi chưa có tọa độ | Cần nhập tọa độ trước khi xác minh. |
| V18 | Cờ xác minh | NCC gọi | Bạn không có quyền thực hiện thao tác này. |
| V19 | Lý do từ chối | < 10 hoặc > 500 ký tự | Lý do từ chối phải từ 10 đến 500 ký tự. |
| V20 | Bán kính | Không phải số nguyên, < 1 hoặc > 50 | Bán kính phải từ 1 đến 50 km. |
| V21 | Ghim | Đã đủ 10 | Mỗi homestay ghim tối đa 10 địa điểm. |
| V22 | Ghim | Đã ghim | Địa điểm đã được ghim. |
| V23 | Ghim | Địa điểm không đủ điều kiện hiển thị | Địa điểm chưa đủ điều kiện hiển thị (chưa duyệt hoặc chưa xác minh tọa độ). **(đề xuất: vẫn cho ghim nhưng cảnh báo – Q5)** |
| V24 | Cấu hình homestay | Homestay chưa có tọa độ | Cần bổ sung tọa độ homestay trước khi cấu hình. |
| V25 | Truy cập | NCC mở địa điểm của NCC khác | Bạn không có quyền truy cập nội dung này. |

Giờ đóng nhỏ hơn giờ mở (vd 18:00–02:00) được hiểu là mở qua đêm **(đề xuất)**.

---

## 6. Test case

Ký hiệu loại: **U** = unit test backend (JUnit / Mockito) · **W** = test tầng web (`@WebMvcTest`, phân quyền) · **M** = kiểm thử tay (QA).

| TC | AC / BR | Loại | Bước / dữ liệu | Kết quả mong đợi |
|---|---|---|---|---|
| TC-01 | AC-02.01 | U, M | Admin tạo: tên, danh mục Ăn uống, mô tả ngắn, 1 ảnh, không tọa độ | Lưu; APPROVED + PUBLISHED; danh sách có cảnh báo "Chưa có tọa độ" |
| TC-02 | AC-02.02 | U, M | Bỏ trống danh mục | Không lưu; lỗi V3 tại ô danh mục |
| TC-03 | AC-02.02 | U, M | 0 ảnh | Không lưu; lỗi V6 tại ô ảnh |
| TC-04 | BR-02.01 biên | U | Tên 100 / 101 ký tự | 100 lưu được; 101 lỗi V2 |
| TC-05 | BR-02.01 biên | U | Mô tả ngắn 300 / 301 | 300 lưu được; 301 lỗi V5 |
| TC-06 | BR-02.01 biên | U | 1 / 10 / 11 ảnh | 1, 10 lưu được; 11 lỗi V7 |
| TC-07 | BR-02.01 biên | M | Ảnh 5 MB / 5 MB + 1 byte | 5 MB nhận; vượt 1 byte lỗi V8 |
| TC-08 | AC-02.03 | U, M | Tọa độ Hà Nội 21.0285, 105.8542 | Không lưu; lỗi V12 |
| TC-09 | BR-02.02 biên | U | Vĩ độ 21.30 / 21.2999; kinh độ 105.10 / 105.1001 | Trong biên lưu được; ngoài biên lỗi V12 |
| TC-10 | BR-02.02 | U | Chỉ nhập vĩ độ | Lỗi V10 |
| TC-11 | AC-02.04 | U | Địa điểm có tọa độ, cờ tắt → Admin bật cờ | Có trong kết quả API Khám phá |
| TC-12 | AC-02.05 | U | Địa điểm đã xác minh → Admin đổi tọa độ | Cờ = false; không còn trong API Khám phá |
| TC-13 | AC-02.05 | U | NCC sửa tọa độ, Admin duyệt yêu cầu | Cờ = false sau khi duyệt; trước khi duyệt cờ giữ nguyên |
| TC-14 | BR-C05 | U, W | NCC gọi API bật cờ | 403 |
| TC-15 | BR-C05 | U | Bật cờ khi chưa có tọa độ | Lỗi V17 |
| TC-16 | AC-02.06 | U, M | NCC tạo địa điểm | PENDING; không có trong API Khám phá; Admin nhận thông báo |
| TC-17 | AC-02.07 | U, W | NCC A mở / sửa địa điểm của NCC B | 403 "Bạn không có quyền truy cập nội dung này" |
| TC-18 | AC-02.08 | U, M | Admin Ẩn địa điểm đang hiển thị | Không còn trong API Khám phá và trang chi tiết công khai ở lần tải tiếp theo |
| TC-19 | BR-C02 biên | U | Lý do từ chối 9 / 10 / 500 / 501 ký tự | 10, 500 nhận; 9, 501 lỗi V19 |
| TC-20 | BR-C03 | U | NCC sửa địa điểm đã duyệt, chưa duyệt | API công khai vẫn trả nội dung cũ |
| TC-21 | AC-02.09 | U | Homestay A, bán kính 10 km, 3 địa điểm ở 2,1 / 0,4 / 9,9 km và 1 ở 10,1 km | Trả 3 địa điểm theo thứ tự 0,4 → 2,1 → 9,9 kèm khoảng cách |
| TC-22 | AC-02.10 | U | Ghim Y rồi X, sắp Y trước X | Y, X đứng đầu rồi tới địa điểm không ghim |
| TC-23 | AC-02.11 | U | Ghim thứ 11 | Lỗi V21 |
| TC-24 | BR-02.05 biên | U | Ghim thứ 10 | Thành công |
| TC-25 | AC-02.12 | U | Ghim Z cách 25 km (bán kính 10) | Z có trong kết quả dù ngoài bán kính |
| TC-26 | AC-02.13 | U, M | Bán kính 60 | Lỗi V20 |
| TC-27 | BR-02.04 biên | U | Bán kính 0 / 1 / 50 / 51 | 1, 50 lưu được; 0, 51 lỗi V20 |
| TC-28 | AC-02.14 | U, M | Mở cấu hình homestay chưa có tọa độ | Lỗi V24 |
| TC-29 | BR-02.05 | U | Địa điểm ghim bị Ẩn | Không trả cho khách; vẫn còn trong cấu hình ghim |
| TC-30 | BR-02.06 | U | Hai địa điểm không ghim cùng khoảng cách, tên "Bản Lìm Mông" và "Âu Cơ" | Sắp theo tên A–Z tiếng Việt |
| TC-31 | AC-02.15 | U, M | 2 ghim + 13 không ghim | Trang 1: 10 thẻ (2 ghim + 8 gần nhất), còn trang sau; trang 2: 5 thẻ, hết |
| TC-32 | BR-02.07 biên | U | Đúng 10 / 11 / 20 / 21 địa điểm | 10: không có Xem thêm; 11: có, trang 2 còn 1; 20: 2 trang; 21: 3 trang |
| TC-33 | AC-02.16 | U | 0,85 km và 2,43 km | "850 m", "2,4 km" |
| TC-34 | BR-C06 biên | U | 0,004 / 0,995 / 0,9949 / 1,0 / 1,04 / 1,05 km | "0 m" / "1,0 km" / "990 m" / "1,0 km" / "1,0 km" / "1,1 km" (§7 Q6) |
| TC-35 | BR-C06 | U | Haversine giữa hai tọa độ đã biết (trung tâm MCC → đồi Mâm Xôi) | Sai số < 1 m so với giá trị tính tay |
| TC-36 | AC-02.17 | U, M | Lọc "Ăn uống" | Chỉ địa điểm FOOD trong danh sách và trên bản đồ; bỏ lọc → đầy đủ |
| TC-37 | AC-02.18 | U, M | Homestay B không có địa điểm đủ điều kiện | API trả rỗng; mục không render |
| TC-38 | BR-02.07 | U | Homestay chưa có tọa độ | API trả rỗng (không lỗi) |
| TC-39 | AC-02.19 | M | Chặn tải tile bản đồ (DevTools) | Thẻ vẫn hiện; bản đồ báo "Không tải được bản đồ" |
| TC-40 | AC-02.20 | U, M | Địa điểm không có website | DTO không có website; giao diện không có dòng website |
| TC-41 | AC-02.21 | M | Bấm Chỉ đường từ homestay A | URL có origin = tọa độ A, destination = tọa độ X |
| TC-42 | AC-02.22 | M | Điện thoại không có ứng dụng bản đồ | Mở Google Maps web ở tab mới với cùng điểm đi / đến |
| TC-43 | BR-02.08 | U, M | Địa điểm chưa xác minh tọa độ | Không có nút Chỉ đường (không vào được mục) |
| TC-44 | AC-02.23 | U | Mở 07:00–21:00 thứ Hai, lúc 20:30 thứ Hai giờ VN | "Đang mở cửa, đóng lúc 21:00" |
| TC-45 | BR-C07 biên | U | Cùng giờ mở, lúc 21:00 đúng / 06:59 / 07:00 | 21:00 → đã đóng; 06:59 → đã đóng, mở lúc 07:00; 07:00 → đang mở |
| TC-46 | BR-C07 | U | Máy chủ đặt múi giờ UTC, thời điểm 13:30Z thứ Hai | Tính là 20:30 thứ Hai giờ VN → đang mở |
| TC-47 | BR-C07 | U | Mở 18:00–02:00, lúc 01:00 thứ Ba | Đang mở (qua đêm từ thứ Hai), đóng lúc 02:00 |
| TC-48 | BR-C08 | M | Địa điểm không có địa chỉ, điện thoại | Không có dòng trống hoặc "N/A" |
| TC-49 | M (360 px) | M | Trang homestay mẫu ở 360 px | Không tràn ngang; chip lọc cuộn ngang; nút ≥ 44 px |

---

## 7. Câu hỏi mở

| # | Câu hỏi | Phương án đang áp dụng | XN |
|---|---|---|---|
| Q1 | Địa điểm ghim chưa có tọa độ xác minh có được hiện (không khoảng cách, không bản đồ) không? Yêu cầu gốc nói khoảng cách "nếu có dữ liệu" | Không hiện, đúng BR-02.03 | XN-2 |
| Q2 | Dữ liệu địa điểm cũ chưa có cờ xác minh, mục sẽ trống khi ra mắt. Có cần "Xác minh tọa độ hàng loạt"? | Làm thao tác chọn nhiều → bật cờ cho Admin | XN-7 |
| Q3 | Địa điểm cũ chưa có mô tả ngắn: thẻ hiển thị gì? | Lấy 300 ký tự đầu của mô tả dài, cắt ở ranh giới từ; mô tả dài cũng trống thì ẩn (BR-C08) | — |
| Q4 | Địa điểm "Tạm ngừng hoạt động" có xuất hiện không? | Không | — |
| Q5 | Cho ghim địa điểm chưa đủ điều kiện hiển thị không? | Cho ghim, hiện cảnh báo "Chưa hiển thị với khách"; khách chỉ thấy khi đủ điều kiện | XN-12 |
| Q6 | Làm tròn ở biên 1 km: 995 m làm tròn 10 m thành 1.000 m thì hiện "1.000 m" hay "1,0 km"? | Làm tròn mét trước, kết quả ≥ 1.000 m thì hiện theo km ("1,0 km") | — |
| Q7 | Ranh giới vùng phục vụ chính xác (Yên Bái đã nhập vào Lào Cai từ 2025) | Hộp tọa độ §4.6, đặt trong file hằng số để đổi được | XN-13 |
| Q8 | Nhà cung cấp bản đồ | Giữ Leaflet + nền bản đồ hiện có sau `VietmapView`; chỉ đường qua Google Maps URL, gom trong `lib/mapUtils.ts` để đổi được | XN-10 |
| Q9 | Homestay có cần cờ "tọa độ đã xác minh" mới được bật mục không? | Không; chỉ cần có tọa độ (AC-02.14 chỉ nói "chưa có tọa độ") | XN-2 |
| Q10 | Email cho NCC / Admin | Chỉ thông báo trong hệ thống + Web Push (đã có); email khi XN-9 chốt | XN-9 |
| Q11 | Seed dữ liệu mẫu | Script riêng `ops/seed/ep02-explore-sample.sql`, **không** đặt trong Liquibase vì changeset chạy cả trên production | — |
| Q12 | Màn quản lý địa điểm mới và màn "Duyệt điểm đến" cũ có gộp không? | Tách riêng ở Phase 2, xem xét gộp sau | — |

---

## 8. Kế hoạch code theo đợt (Phần 2)

| Đợt | Nội dung | AC |
|---|---|---|
| 1 – Backend lõi | Changeset (cột mới, `homestay_explore_pin`, `app_setting`, đích PLACE, mẫu thông báo); `ExploreRules`; khoảng cách Haversine + làm tròn; sắp xếp / phân trang; giờ mở cửa; API công khai Khám phá + chi tiết; unit test | 02.09–02.12, 02.15–02.18, 02.23 (logic) |
| 2 – Admin | API + màn AD-01, AD-02 (bản đồ chọn điểm), duyệt, cờ xác minh, AD-03 ghim / bán kính; test phân quyền | 02.01–02.05, 02.08–02.14 |
| 3 – NCC | API + màn NCC-01, gửi duyệt, sửa qua yêu cầu thay đổi (BR-C03), thông báo | 02.06, 02.07 |
| 4 – Khách | KH-01, KH-02, chỉ đường, kiểm tra 360 px | 02.15–02.23 |
| Seed | `ops/seed/ep02-explore-sample.sql`: 1 homestay, ~15 địa điểm đủ 5 danh mục, có điểm chưa có tọa độ, chưa xác minh, ngoài bán kính, đang Ẩn | Hỗ trợ QA |

**Giới hạn môi trường:** máy phát triển không có Docker / psql nên không chạy được changeset và app kèm DB ở local;
CI job "Liquibase + schema" kiểm changeset. Frontend chưa có bộ chạy test nên mọi logic BR đặt ở backend để có unit test.

---

## 9. Bảng truy vết

Đường dẫn file: backend dưới `backend-api/src/main/java/com/dulichso/bookingapi/` (service/, controller/, entity/), frontend dưới `frontend-pwa/src/`. Test ở `backend-api/src/test/java/com/dulichso/bookingapi/service/`.

| AC | Màn hình | API | File code | Test case | Kết quả |
|---|---|---|---|---|---|
| AC-02.01 | AD-01, AD-02 | POST /api/v1/admin/explore/places | ExplorePlaceService#adminCreate, ExplorePlaceWriter, ExplorePlaceForm.tsx, ExplorePlacesPanel.tsx | ExplorePlaceServiceTest.ac0201AdminCreate; ExplorePlaceWriterTest.ac0201MinimalValid, br0201Boundaries | Đạt (test tự động); giao diện chờ QA |
| AC-02.02 | AD-02 | POST /api/v1/admin/explore/places | ExplorePlaceWriter#validate, ExplorePlaceForm.tsx | ExplorePlaceWriterTest.ac0202MissingCategoryOrImage, requiredNameAndSummary | Đạt (test tự động); giao diện chờ QA |
| AC-02.03 | AD-02 | POST / PUT /api/v1/admin/explore/places | ExploreRules#inServiceArea, ExplorePlaceWriter#validate | ExploreRulesTest.ac0203ServiceArea, br0202ServiceAreaBoundaries; ExplorePlaceWriterTest.ac0203Coordinates | Đạt (test tự động) |
| AC-02.04 | AD-01 | PATCH /api/v1/admin/explore/places/{id}/coord-verified | ExplorePlaceService#setCoordVerified, ExploreRules#isExploreEligible | ExplorePlaceServiceTest.ac0204Verify, verifyWithoutCoordinates; ExploreRulesTest.ac0204Eligibility; ExploreServiceTest.ac0204IneligibleFromQueryAreDropped | Đạt (test tự động) |
| AC-02.05 | AD-02, NCC-01 | PUT /api/v1/admin/explore/places/{id}; POST …/edit/approve | Place#setLatitude / setLongitude, ExplorePlaceService#adminUpdate, #approveEdit | ExploreRulesTest.ac0205ChangingCoordinatesClearsVerification; ExplorePlaceServiceTest.ac0205AdminChangesCoordinates, ac0205ApproveEditWithNewCoordinates | Đạt (test tự động) |
| AC-02.06 | NCC-01 | POST /api/v1/partner/explore-places | ExplorePlaceService#partnerCreate, PartnerExplorePlacesPage.tsx | ExplorePlaceServiceTest.ac0206PartnerCreate | Đạt (test tự động); giao diện chờ QA |
| AC-02.07 | NCC-01 | GET / PUT /api/v1/partner/explore-places/{id} | ExplorePlaceService#owned, #requireOwner | ExplorePlaceServiceTest.ac0207OtherProvider | Đạt (test tự động) |
| AC-02.08 | AD-01 | PATCH /api/v1/admin/explore/places/{id}/visibility | ExplorePlaceService#setVisible; PublicExploreController (không qua CDN) | ExplorePlaceServiceTest.ac0208Hide; ExploreServiceTest.ac0208HiddenDetail; ExploreRulesTest.ac0204Eligibility | Đạt (test tự động) |
| AC-02.09 | AD-03 | GET /api/v1/admin/explore/homestays/{id} | ExploreHomestayConfigService#overview | ExploreHomestayConfigServiceTest.ac0209Overview; ExploreServiceTest.ac0209WithinRadiusSorted; ExploreRankingTest.ac0209SortedByDistance | Đạt (test tự động) |
| AC-02.10 | AD-03, KH-01 | PUT /api/v1/admin/explore/homestays/{id}/pins/order | ExploreHomestayConfigService#reorder, ExploreRanking#rank | ExploreHomestayConfigServiceTest.ac0210Reorder; ExploreRankingTest.ac0210PinnedFirstInAdminOrder | Đạt (test tự động) |
| AC-02.11 | AD-03 | POST /api/v1/admin/explore/homestays/{id}/pins | ExploreHomestayConfigService#pin | ExploreHomestayConfigServiceTest.ac0211PinLimit, br0205TenthPinAllowed, duplicatePin | Đạt (test tự động) |
| AC-02.12 | AD-03 | GET …/homestays/{id}/search; POST …/pins | ExploreHomestayConfigService#search, #pin; ExploreService#rankFor | ExploreHomestayConfigServiceTest.ac0212PinOutsideRadius; ExploreServiceTest.ac0212PinnedOutsideRadius; ExploreRankingTest.pinnedOutsideRadiusAndNoDuplicates | Đạt (test tự động) |
| AC-02.13 | AD-03 | PUT /api/v1/admin/explore/settings | ExploreSettingsService#updateRadius | ExploreSettingsServiceTest.ac0213RejectsSixty, br0204Boundaries | Đạt (test tự động) |
| AC-02.14 | AD-03 | GET /api/v1/admin/explore/homestays/{id} | ExploreHomestayConfigService#overview, #pin | ExploreHomestayConfigServiceTest.ac0214NoCoordinates | Đạt (test tự động) |
| AC-02.15 | KH-01 | GET /api/public/explore/homestays/{id}?page= | ExploreRanking#page, ExploreNearbySection.tsx | ExploreRankingTest.ac0215TenThenFive, br0207PagingBoundaries | Đạt (test tự động); nút Xem thêm chờ QA |
| AC-02.16 | KH-01, KH-02 | GET /api/public/explore/homestays/{id} | ExploreRules#formatDistance, #haversineKm | ExploreRulesTest.ac0216FormatsExampleDistances, brC06RoundingBoundaries, brC06Haversine | Đạt (test tự động) |
| AC-02.17 | KH-01 | GET /api/public/explore/homestays/{id}?category= | ExploreRanking#filter, #countByCategory; ExploreNearbySection.tsx | ExploreRankingTest.ac0217FilterByCategory; ExploreServiceTest.ac0217Filter | Đạt (test tự động); lọc trên bản đồ chờ QA |
| AC-02.18 | KH-01 | GET /api/public/explore/homestays/{id} | ExploreService#explore; ExploreNearbySection.tsx (không render khi rỗng); HomestayDetailPage.tsx | ExploreServiceTest.ac0218EmptyWhenNothingEligible | Đạt (test tự động); giao diện chờ QA |
| AC-02.19 | KH-01 | — (trình duyệt) | ExploreMap.tsx, lib/mapProvider.ts#attachBaseLayer | TC-39 (kiểm tay) | Chưa đạt — chưa kiểm được: máy phát triển không chạy được app kèm DB; QA kiểm theo TC-39 |
| AC-02.20 | KH-02 | GET /api/public/explore/places/{id} | ExploreService#placeDetail, ExplorePlaceSheet.tsx | ExploreServiceTest.ac0220DetailHidesEmptyFieldsAndShowsOpenStatus | Đạt (test tự động); giao diện chờ QA |
| AC-02.21 | KH-02 | — (URL Google Maps) | lib/mapProvider.ts#directionsUrl, ExplorePlaceSheet.tsx | TC-41 (kiểm tay) | Chưa đạt — chưa kiểm được trên thiết bị; QA kiểm theo TC-41 |
| AC-02.22 | KH-02 | — (URL Google Maps) | lib/mapProvider.ts#openDirections | TC-42 (kiểm tay) | Chưa đạt — cần điện thoại không cài Google Maps; QA kiểm theo TC-42 |
| AC-02.23 | KH-02 | GET /api/public/explore/places/{id} | OpeningHoursStatus, ExploreService#placeDetail | OpeningHoursStatusTest.ac0223OpenAt2030, brC07Boundaries, brC07UsesVietnamTimeNotServerTime, overnightHours; ExploreServiceTest.ac0220DetailHidesEmptyFieldsAndShowsOpenStatus | Đạt (test tự động) |

**Tổng hợp kiểm thử (2026-10-15):**

- Backend toàn dự án: **541 test, 0 lỗi**. Trong đó 70 test EP02: ExploreRulesTest 8, OpeningHoursStatusTest 7, ExploreRankingTest 8, ExploreServiceTest 10, ExploreSettingsServiceTest 4, ExplorePlaceWriterTest 9, ExplorePlaceServiceTest 16, ExploreHomestayConfigServiceTest 8. AdminEndpointAuthorizationTest thêm 9 endpoint EP02; LiquibaseChangelogRulesTest đạt.
- Frontend: `tsc -b` 0 lỗi; `oxlint` 0 lỗi / 89 cảnh báo (bằng mốc trước khi làm, không thêm cảnh báo); `vite build` thành công.
- **Chưa làm được ở máy phát triển:** chạy changeset trên PostgreSQL thật và chạy app kèm DB để tự mở trang homestay mẫu (kể cả 360 px) — máy không có Docker / psql. Changeset được CI job "Liquibase + schema" chạy và `validate` entity. Các AC chỉ kiểm được trên giao diện (AC-02.19, 02.21, 02.22 và phần giao diện của các AC khác) cần QA kiểm tay sau khi deploy môi trường thử, dùng `ops/seed/ep02-explore-sample.sql`.

## 10. Điểm khác bản đặc tả khi triển khai

| # | Đặc tả ban đầu | Đã làm | Lý do |
|---|---|---|---|
| D1 | §4.5 dùng lại `partner_change_request` (thêm đích PLACE) | Bảng riêng `place_edit_request` | Không phải sửa các `switch` của luồng duyệt homestay dùng chung; tách biệt, ít rủi ro |
| D2 | AD-03 nằm trong khung xem homestay của "Duyệt điểm đến" | Tab "Quanh homestay" trong màn mới "Địa điểm khám phá" (chọn homestay rồi cấu hình) | Không sửa màn "Duyệt điểm đến" đang dùng; đủ chức năng US02.02 |
| D3 | Thay đổi chờ duyệt xem ở màn "Yêu cầu thay đổi" | Hộp "Xem thay đổi" ngay trong màn Địa điểm khám phá (so sánh bản đang hiển thị / bản sửa) | Hệ quả của D1 |
| D4 | — | Admin đổi tọa độ thì backend bỏ qua ô "đã xác minh" gửi kèm trong cùng lần lưu | AC-02.05 chặt: tọa độ mới phải được xác minh bằng thao tác riêng |
| D5 | — | Component `ExploreMap` riêng thay vì `VietmapView` | `VietmapView` không báo lỗi khi nền dự phòng cũng hỏng (AC-02.19); nhà cung cấp bản đồ gom ở `lib/mapProvider.ts` (XN-10) |
| D6 | Seed trong phạm vi code | `ops/seed/ep02-explore-sample.sql`, không phải changeset | Changeset chạy cả trên production |
