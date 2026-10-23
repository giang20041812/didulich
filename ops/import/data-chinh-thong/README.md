# Nhập "DATA CHÍNH THỐNG" (xlsx + thư mục ảnh) vào hệ thống

Đưa dữ liệu mới trong `DATA CHÍNH THỐNG.xlsx` và các thư mục ảnh `ẢNH HOMESTAY MCC`, `ẢNH HOTEL - KHÁCH SẠN MCC`, `NHÀ HÀNG`
vào DB. Mọi địa điểm mới mang cờ **`place.data_verified = FALSE` ("chưa xác thực")**; Admin bật cờ này ở màn *Duyệt điểm đến*
(cột **Xác thực dữ liệu**, hoặc công tắc trong ngăn xem nhanh) sau khi đối chiếu thực tế. Địa điểm đã có từ trước migration
`016-place-data-verified.sql` được đặt `TRUE` (dữ liệu chính thống), địa điểm tạo mới sau đó mặc định `FALSE`.

> `data_verified` độc lập với `place.verification` (quy trình *Chờ duyệt / Đã duyệt / Cần bổ sung / Lưu trữ* của nội dung)
> và `coord_verified` (toạ độ). Địa điểm nhập từ đây có cả `verification = UNVERIFIED` nên hiện ở tab *Chờ duyệt* mặc định.

## Hai bước

```bash
# 1) Dựng dataset từ Excel + quét ảnh (cần python + openpyxl). Chỉ đọc file; ghi dataset.json / coverage.json.
python ops/import/data-chinh-thong/build_dataset.py            # có mạng: đổi link Google Maps rút gọn → toạ độ (lưu maps_cache.json)
python ops/import/data-chinh-thong/build_dataset.py --no-maps  # chỉ dùng maps_cache.json

# 2) Ghi vào DB (chạy trong backend-api; đọc DB_URL từ .env.local — CHÍNH LÀ DB production nếu .env.local trỏ vào đó)
cd backend-api
npm run migrate                                  # (nếu chưa) áp migration 016 — thêm cột place.data_verified
npm run import:data-chinh-thong                  # CHẠY THỬ: chỉ đọc DB, in kế hoạch, ghi bao-cao-doi-chieu.md
npm run import:data-chinh-thong -- --apply --confirm-host=<host DB>   # GHI THẬT
```

`--apply` bắt buộc kèm `--confirm-host=<đúng host DB đích>` (chốt chặn chống ghi nhầm môi trường). Chạy lại nhiều lần an toàn:
địa điểm đã nhập (nhận biết bằng `slug` + `source_name` bắt đầu bằng "DATA CHÍNH THỐNG") được bỏ qua; ảnh đã tải được nhớ trong
`.import-state/uploads.<kho ảnh>.json` (git-ignore) nên không tải lại.

## Tùy chọn của bước 2

| Cờ | Mặc định | Ý nghĩa |
|---|---|---|
| `--visibility=PUBLISHED\|DRAFT\|UNPUBLISHED` | `PUBLISHED` | Hiển thị của địa điểm mới. Mặc định **công khai**: cờ "chưa xác thực" chỉ để Admin theo dõi, không ẩn dữ liệu khỏi khách. |
| `--publish-held` | tắt | Công khai luôn 9 mục `dataset.json` đề nghị giữ ẩn (`holdBack`): 8 homestay chỉ có tên + ảnh, nhà hàng Hằng Béo bị ghi "Không có". Mặc định các mục này ở `DRAFT` cho tới khi Admin bấm *Công khai*. |
| `--festival-visibility=PUBLISHED\|DRAFT` | `PUBLISHED` | Hiển thị của lễ hội mới (bảng `festival`, chưa có màn Admin riêng). |
| `--attach-existing` | tắt | Gắn thêm ảnh vào các địa điểm **đã có** (Mai Linh, Hoa Sơn Trà, Đồi Đổi Gió...). Mặc định không đụng tới địa điểm hiện hữu. |
| `--skip-images` | tắt | Không tải / không gắn ảnh. |
| `--only=HOMESTAY,RESTAURANT,TRANSPORT,CULTURE,PHOTO,SERVICE,ATTRACTION,FESTIVAL` | tất cả | Chỉ xử lý các loại này. |
| `--upload=cloudinary\|fake` | `cloudinary` | `fake` không gọi mạng (kiểm thử). Cần `CLOUDINARY_*` trong `.env.local`. |
| `--report=<file>` | `bao-cao-doi-chieu.md` | Nơi ghi báo cáo đối chiếu. |

## Quy ước dữ liệu

- Danh sách **Lưu trú** công khai trước đây chỉ liệt kê chỗ nghỉ có loại phòng đang bán kèm giá. Đã nới
  (`placeRepo.publicWhere`): chỗ nghỉ **chưa có loại phòng nào** vẫn được liệt kê, thẻ ghi "Liên hệ trực tiếp để đặt"
  (`hasOnlineRooms = false`); chi tiết đã sẵn "Chỗ nghỉ chưa mở bán loại phòng trực tuyến". Chỗ nghỉ có phòng nhưng đã tắt bán thì vẫn không hiện.
- `provider_id` để trống: các cơ sở này chưa là đối tác trên hệ thống. Địa điểm không có loại phòng nên **chưa đặt được phòng**
  (giá chỉ là `price_ref_min/max` tham khảo; mô tả loại phòng / sức chứa nằm trong `description`).
- `source_type = PUBLIC_TRUSTED`, `source_name` ghi rõ sheet + số hàng Excel, `source_url` là các link nguồn nghiên cứu.
- Ảnh tải lên Cloudinary (`viettrek/import-data-chinh-thong/<slug>/<sha>`), bỏ ảnh trùng nội dung (sha256), tối đa 30 ảnh/địa điểm,
  ảnh đầu tiên (theo tên file) là ảnh bìa. Video (`.mp4`) **chưa nhập** vì `place_media` chỉ chứa ảnh — xem danh sách trong báo cáo.
- Thông tin sai/lệch trong file nguồn được script tự phát hiện (link Google Maps trỏ sai cơ sở, ngoài vùng, trùng SĐT, cột lệch...)
  và liệt kê ở mục 6 của báo cáo để người rà soát xử lý.

## Phủ dữ liệu

`coverage.json` ghi "kết cục" của **từng dòng có dữ liệu** của mọi sheet (tạo mới / gộp / đã có sẵn trong hệ thống / không có bảng đích);
`build_dataset.py` dừng với mã lỗi nếu còn dòng nào chưa có kết cục.

| Sheet | Kết cục |
|---|---|
| Homestay, Homestay reviewer | 36 homestay (gộp dòng trùng giữa hai sheet) |
| Nhà hàng, Nhà hàng reviewer | 17 nhà hàng / quán cà phê |
| Di chuyển, Di chuyển reviewer | 22 dịch vụ vận chuyển (`place_service_profile`) |
| Dịch vụ reviewer | 5 dịch vụ + 2 chụp ảnh + 3 trải nghiệm + 2 điểm đến (Tà Xùa, bể khoáng Cường Hải) + 1 gộp vào nhà xe Hà Trang |
| Văn hóa | 5 lễ hội (`festival`), 9 trải nghiệm văn hóa; 5 dòng *phân khúc khách hàng* (marketing) không có bảng đích |
| Điểm đến (12), Đặc sản (15) | đã có sẵn trong hệ thống — script chỉ kiểm chứng, không tạo lại |
| Thư mục ảnh (37) | 5 gắn vào dòng Excel có ảnh (Wind's + 4 nhà hàng); 8 chỉ có ảnh → tạo homestay "chỉ tên + ảnh"; 16 thuộc 12 địa điểm đã có (mặc định không gắn); 8 thư mục rỗng (3 trong số đó khớp dòng Excel, 5 không có dữ liệu nào) |
