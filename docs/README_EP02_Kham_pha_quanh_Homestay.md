# EP02 – Khám phá quanh Homestay: cài đặt, chạy, kiểm thử

Đặc tả: [FS_EP02_Kham_pha_quanh_Homestay.md](FS_EP02_Kham_pha_quanh_Homestay.md). Tính năng nằm trong dự án hiện có
(Spring Boot 3.5 + PostgreSQL / Supabase, React + Vite), không có bước cài đặt riêng.

## 1. Yêu cầu

| Thành phần | Phiên bản |
|---|---|
| JDK | 17 trở lên (máy phát triển đang dùng 21) |
| Maven | 3.9 (máy hiện tại: Maven đi kèm IntelliJ, `D:/Intell/plugins/maven/lib/maven3/bin/mvn`) |
| PostgreSQL | 15–17 (CI dùng 17), hoặc Supabase |
| Node.js | 20 trở lên |

## 2. Migration (Liquibase)

Không cần chạy tay. Backend khởi động sẽ tự chạy `backend-api/src/main/resources/db/changelog/db.changelog.xml`, trong
đó có changeset mới `v2/011-explore-nearby.sql`:

- `place`: thêm `summary`, `coord_verified`, `coord_verified_at`, `coord_verified_by`, `approval_status`, `reject_reason`.
  Dữ liệu cũ nhận `approval_status = APPROVED`, `coord_verified = false`.
- Bảng mới `homestay_explore_pin` (ghim), `place_edit_request` (bản sửa chờ duyệt của NCC).
- `app_setting.explore.radius_km = 10`; 4 mẫu thông báo.

> **Lưu ý khi ra mắt:** mọi địa điểm cũ đều chưa có cờ "Tọa độ đã xác minh", nên mục "Khám phá quanh đây" sẽ trống cho
> tới khi Admin xác minh. Vào Admin → Quản lý → **Địa điểm khám phá** → lọc "Chưa xác minh" → chọn nhiều → **Xác minh
> tọa độ** (FS §7 Q2).

## 3. Dữ liệu mẫu (chỉ môi trường phát triển / QA)

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f ops/seed/ep02-explore-sample.sql
```

Script tạo homestay **"Homestay Mẫu Khám Phá"** và 18 địa điểm phủ mọi trường hợp test (xem đầu file). Chạy lại nhiều
lần được. **Không chạy trên production** — script không nằm trong Liquibase vì lý do này.

## 4. Chạy ứng dụng

```bash
# Backend (cổng 8080), profile mặc định đọc DB trong application.yml / biến môi trường
cd backend-api
mvn spring-boot:run

# Frontend (cổng 5173, proxy /api sang backend)
cd frontend-pwa
npm ci
npm run dev
```

Biến môi trường tùy chọn: `VITE_VIETMAP_API_KEY` (nền bản đồ VietMap; không có thì dùng ảnh vệ tinh Esri).

Kiểm tra nhanh:

| Vai trò | Đường dẫn |
|---|---|
| Khách | `/homestays/{id homestay mẫu}` → mục "Khám phá quanh đây" |
| Admin | `/admin` → Quản lý → **Địa điểm khám phá** (tab "Địa điểm" và "Quanh homestay") |
| NCC | `/partner/explore-places` (menu **Địa điểm của tôi**) |
| API | `GET /api/public/explore/homestays/{id}?category=FOOD&page=0`, `GET /api/public/explore/places/{id}?homestayId={id}` |

## 5. Chạy test

```bash
# Toàn bộ backend (có 70 test EP02, tên test theo mã AC)
cd backend-api
mvn -o -q clean test

# Chỉ EP02
mvn -o -q test -Dtest='Explore*Test,OpeningHoursStatusTest,AdminEndpointAuthorizationTest,LiquibaseChangelogRulesTest'

# Frontend: kiểm kiểu, lint, build
cd frontend-pwa
npx tsc -b
npm run lint
npm run build
```

Dùng `clean`: nếu VS Code (trình biên dịch Eclipse) đã ghi file `.class` lỗi vào `target/`, Maven sẽ báo
"Unresolved compilation problems" dù mã nguồn đúng.

Frontend chưa có bộ chạy test tự động, nên toàn bộ logic BR (lọc, sắp xếp, khoảng cách, làm tròn, giới hạn, giờ mở cửa,
phân quyền) đặt ở backend và được test bằng JUnit. Phần giao diện kiểm tay theo FS §6.

## 6. Cấu hình nghiệp vụ

| Giá trị | Nơi đổi |
|---|---|
| Bán kính (1–50 km) | Admin → Địa điểm khám phá → tab "Quanh homestay" → "Bán kính hệ thống" |
| Hằng số khác (100 / 300 ký tự, 10 ảnh, 5 MB, 10 ghim, 10 thẻ / trang, vùng phục vụ) | `backend-api/.../service/ExploreRules.java` và bản sao `frontend-pwa/src/lib/exploreRules.ts` |
| Nhà cung cấp bản đồ (XN-10) | `frontend-pwa/src/lib/mapProvider.ts` |
