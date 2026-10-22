# Cơ sở dữ liệu v2 (PostgreSQL) — thiết kế và quy trình chuyển đổi

Ngày 11/10/2026, nhánh `db-v2`. Tài liệu này thay cho các mục schema cũ trong `DEPLOY.md`.

- [1. Vì sao làm lại](#1-vì-sao-làm-lại)
- [2. Schema mới](#2-schema-mới)
- [3. Quy ước](#3-quy-ước)
- [4. Thay đổi API](#4-thay-đổi-api)
- [5. Quyết định và điểm khác kế hoạch](#5-quyết-định-và-điểm-khác-kế-hoạch)
- [6. Chuyển production sang v2](#6-chuyển-production-sang-v2)
- [7. Đã kiểm chứng](#7-đã-kiểm-chứng)
- [8. Việc còn lại](#8-việc-còn-lại)

## 1. Vì sao làm lại

Schema cũ lớn dần qua 2 changelog song song (MySQL `changes/*.xml` + PostgreSQL `postgres/*.sql`), nhiều chỗ chắp vá:

| Vấn đề ở schema cũ | Ở v2 |
|---|---|
| Hai changelog cho MySQL và PostgreSQL phải sửa song song | Chỉ PostgreSQL. Một changelog: `db/changelog/db.changelog.xml` → `v2/000…007-*.sql` |
| `account` (Admin / NCC) và `traveler` (khách) tách đôi; NCC muốn đặt phòng phải tạo tài khoản khách riêng | Một bảng `account`; `role` là cổng cao nhất (`ADMIN` / `PROVIDER` / `TRAVELER`), mọi tài khoản đang hoạt động đều dùng được trang khách |
| `place` gánh cả món ăn (`kind = CUISINE`, tọa độ giả = trung tâm thị trấn) và cả cột JSON `attributes` không kiểm soát | Món ăn tách ra bảng `dish` (+ `dish_media`, `dish_highlight`, `place_dish`); thông tin riêng từng loại địa điểm nằm ở bảng `*_profile` 1-1 (`homestay_profile`, `attraction_profile`); nhãn phân loại ở `tag` / `place_tag` |
| `category` + `category_field_def` (danh mục động gần như không dùng) | `place.kind` (varchar + CHECK), nhãn hiển thị theo enum `CategoryKind` |
| Một đơn chỉ đặt được một loại phòng (`booking.room_type_id`, `room_count`) | `booking_room` (nhiều loại phòng / đơn) + `booking_night` (giá từng đêm của từng loại) |
| Bảng của các luồng đã gỡ vẫn nằm trong DB | Bỏ `booking_service_item`, `booking_change_request`, `booking_info_request`, `booking_evaluation`, `booking_response_deadline` |
| Hai bảng Web Push (`admin_push_subscription`, `traveler_push_subscription`) | Một bảng `push_subscription` theo tài khoản |
| Ràng buộc chống trùng dạng "cột guard" generated (kế thừa MySQL) | Index duy nhất một phần của PostgreSQL (`WHERE status = …`) |

## 2. Schema mới

64 bảng (cũ 59): 57 bảng nền ở `000`–`007`, `008`–`009` thêm 7 bảng của lịch trình gợi ý. Tất cả bật Row Level Security. Mỗi file một nhóm:

| File | Bảng | Ghi chú chính |
|---|---|---|
| `000-guard.sql` | — | Dừng khởi động nếu `public` còn bảng của schema cũ (`traveler`, `category`…) — xem mục 6 |
| `001-identity.sql` | `provider`, `account`, `account_session`, `password_reset_token`, `push_subscription`, `provider_application`, `affiliate_link` | Email chữ thường, duy nhất không phân biệt hoa/thường (`uq_account_email` trên `lower(email)`); SĐT duy nhất; `password_hash` NULL chỉ với khách đăng nhập Google |
| `002-catalog.sql` | `region`, `media_asset`, `amenity`, `tag`, `place` (+ `place_amenity`, `place_contact`, `place_highlight`, `place_media`, `place_opening_hour`, `place_tag`), `attraction_profile`, `dish` (+ `dish_media`, `dish_highlight`, `place_dish`), `festival`, `festival_occurrence`, `emergency_contact` | Mùa đẹp của điểm tham quan lưu dạng MMDD lặp lại hằng năm (`attraction_profile.season_start_md`); mỗi địa điểm / món tối đa một ảnh bìa |
| `003-homestay.sql` | `cancellation_policy`, `homestay_profile`, `homestay_service_offer`, `room_type` (+ `room_bed`, `room_amenity`, `room_type_media`, `room_special_price`), `room_inventory_day`, `room_unit_day` | `room_inventory_day` là nguồn sự thật của số phòng bán được (`available_rooms` là cột generated) |
| `004-booking.sql` | `booking`, `booking_room`, `booking_night`, `booking_status_history`, `booking_admin_note`, `payment_gateway`, `payment_transaction`, `refund`, `commission_ledger`, `review`, `review_image` | Chặn đơn trùng: `uq_booking_active_dup (place_id, guest_phone, check_in, check_out) WHERE status IN ('PENDING','CONFIRMED')`; tối đa một giao dịch SUCCESS và một hoàn tiền PENDING mỗi đơn |
| `005-journey.sql` | `journey`, `journey_stop`, `journey_checkin`, `journey_helpful` | Xóa tài khoản thì xóa lịch trình; xóa đơn thì chỉ bỏ gắn |
| `006-operations.sql` | `notification_template`, `notification`, `audit_log`, `app_setting`, `sos_request`, `partner_change_request` | `audit_log.actor_id` không có khóa ngoại (nhật ký giữ nguyên khi tài khoản bị xóa) |
| `007-reference-data.sql` | — | Mẫu thông báo đang dùng, khu vực Yên Bái → Mù Cang Chải / Văn Chấn → xã, tiện nghi, cổng thanh toán `MANUAL` / `SEPAY` |
| `008-trip-planner.sql` | `trip_addon`, `trip_template`, `trip_template_tag` | Lịch trình gợi ý phase 1 (`docs/lich-trinh-goi-y.md` mục 5): dịch vụ thêm, 2 gói Mù Cang Chải dạng `content` jsonb, 8 tag lọc; `journey` thêm tỉnh / số người / mã gói / tiêu chí, `journey_stop` thành mục nhiều loại có giờ |
| `009-journey-unify.sql` | `journey_day`, `journey_tag`, `journey_stop_dish`, `journey_stop_alternative` | Gói mẫu và lịch trình của khách chung một bảng `journey`: `source` = `SUGGESTED` (gói — không có chủ, `template_code` = mã gói duy nhất) / `TRAVELER`; `template_id` = gói đã chép; mục có `origin` (`SUGGESTED` / `CUSTOM`) + `source_stop_id`. Changeset dữ liệu `v2-009-suggested-journeys` chờ danh mục có điểm của gói rồi mới chép `trip_template` sang (mục 6 bước 4b). `trip_template` giữ tới changeset sau (`docs/lich-trinh-goi-y.md` mục 13) |

Đặt nhiều loại phòng: một đơn ở một homestay, cùng ngày nhận / trả, gồm một hoặc nhiều dòng `booking_room (booking_id, room_type_id, room_count)`. `booking_night (booking_id, room_type_id, stay_date, unit_price)` trỏ về đúng dòng `booking_room` (khóa ngoại ghép, `ON DELETE CASCADE`). Tổng tiền = Σ `unit_price × room_count`. Mọi thay đổi tồn phòng đi qua `RoomCalendarService` (`hold` / `releaseHeld` / `confirmHeld` / `releaseConfirmed`), khóa các loại phòng theo id tăng dần để hai đơn chạm cùng loại phòng không khóa chéo nhau.

## 3. Quy ước

Ghi ở đầu `db.changelog.xml`, kiểm tự động bởi `LiquibaseChangelogRulesTest` (`mvn verify`):

- **Chỉ thêm file mới** `v2/NNN-*.sql` (bắt đầu `--liquibase formatted sql`), không sửa changeset đã chạy — checksum khóa trong `src/test/resources/liquibase/changeset-checksums.txt`. Test in sẵn dòng cần dán khi thêm changeset.
- Bảng mới: `ALTER TABLE … ENABLE ROW LEVEL SECURITY;` trong cùng changeset.
- Trạng thái / loại: `varchar` + `CHECK` (không dùng enum của PostgreSQL — thêm giá trị chỉ cần đổi CHECK).
- Khóa ngoại luôn ghi rõ `ON DELETE` (CASCADE cho dữ liệu con, SET NULL cho tham chiếu "ai làm") và có index.
- Thời gian: `timestamp(6)` không múi giờ, giá trị là **giờ Việt Nam** (JVM chạy `Asia/Ho_Chi_Minh`). SQL viết tay dùng `now() AT TIME ZONE 'Asia/Ho_Chi_Minh'`, không dùng `now()` trần (Supabase chạy UTC).
- Hibernate kiểm tra entity ↔ schema bằng `JPA_DDL_AUTO=validate` (CI job "image Vercel + Liquibase + schema" chạy trên PostgreSQL trống).

## 4. Thay đổi API

Backend vẫn nhận dạng cũ nên frontend cũ không gãy ngay, nhưng frontend mới đã chuyển hết:

| API | Thay đổi |
|---|---|
| `POST /api/public/bookings` | Thêm `rooms: [{roomTypeId, roomCount}]` (tối đa 10 loại, 20 phòng / đơn). Cặp `roomTypeId` / `roomCount` cũ vẫn nhận khi không gửi `rooms` |
| `PUT /api/public/bookings/{code}` | Thêm `rooms` (thay toàn bộ loại phòng). `roomCount` cũ chỉ áp dụng khi đơn có đúng một loại phòng |
| Phản hồi đơn (khách, NCC) | Thêm `rooms: [{roomTypeId, roomTypeName, roomCount, subtotal}]`; `roomTypeId` = loại đầu tiên, `roomTypeName` = tên các loại nối dấu phẩy, `roomCount` = tổng số phòng |
| `GET /api/v1/partner/bookings/{id}` | `nightPrices[]` thêm `roomTypeId`, `roomTypeName` (mỗi đêm một dòng cho từng loại phòng) |
| `GET /api/public/dishes`, `GET /api/public/dishes/{id hoặc slug}` | Mới — món đặc sản. `/api/public/places?kind=CUISINE` không còn (`kind` không có giá trị CUISINE). Trang chủ: `specialties` là danh sách món (`kind = "DISH"`) |
| Admin địa điểm | Bỏ `categoryId` |
| `POST /api/v1/auth/google/login` | 409 `GOOGLE_LINK_REFUSED` khi email Google trùng email **chưa xác minh** của tài khoản cổng (Admin / NCC) — không tự gắn Google, chủ tài khoản đăng nhập bằng mật khẩu |
| JWT trang khách | Vai trò `ROLE_TRAVELER` (token cũ `ROLE_GUEST` vẫn được nhận) |

Id của địa điểm, món ăn (= id `place` CUISINE cũ), loại phòng, ảnh và tài khoản cổng giữ nguyên khi chuyển dữ liệu — đường dẫn `/homestays/{id}`, `/specialties/{id}` cũ vẫn đúng.

## 5. Quyết định và điểm khác kế hoạch

Theo chốt ngày 11/10/2026: bỏ hẳn MySQL, gộp bảng tài khoản, đặt được nhiều loại phòng trong một đơn, chưa xử lý doanh thu / hoa hồng (bảng `commission_ledger` giữ nguyên chưa dùng), giữ dữ liệu danh mục và tài khoản, bỏ dữ liệu thử nghiệm (đơn, thanh toán, đánh giá, lịch trình, thông báo, yêu cầu thay đổi).

Những chỗ giữ như cũ hoặc để sau, có chủ đích:

- **Thời gian không múi giờ** (`timestamp`, giờ Việt Nam): đổi sang `timestamptz` phải sửa mọi entity và câu so sánh ngày — không đáng khi hệ thống chỉ phục vụ một múi giờ.
- **`booking.provider_id`** giữ như ảnh chụp NCC lúc đặt (đối soát đúng kể cả khi homestay đổi chủ), không suy ra qua `place`.
- **Không có bảng `room` vật lý**: lịch từng phòng ("Phòng 1, Phòng 2…") vẫn là `room_unit_day`; đơn đặt theo loại phòng.
- **`is_deleted`, `visibility`, `operation_status`** của `place` giữ riêng: xóa mềm / hiển thị công khai / đang tạm đóng là ba việc khác nhau.
- **`homestay_profile`** giữ các trường chữ tự do (nội quy, chính sách…) như form NCC đang dùng.
- **Chưa thêm** `restaurant_profile`, dịch vụ đặt kèm đơn (`booking_service`) — chưa có luồng dùng.
- **`price_ref_min/max` của homestay** giữ như bộ đệm (đồng bộ từ giá loại phòng) để lọc / sắp xếp danh sách không phải tính lại.
- **Lịch trình gợi ý** = dòng `journey` có `source = 'SUGGESTED'` (009), không phải bảng riêng: gói mẫu và lịch trình của khách cùng dạng mục / ngày / tag / món / điểm đổi được, khách chép gói thì từng mục nhớ mục gốc (`source_stop_id`). `traveler_id` NULL chỉ với gói (`ck_journey_owner`); gói không có đơn, mã chia sẻ, bài "Trải nghiệm" (`ck_journey_suggested`). API danh mục `/api/public/trips/catalog` giữ nguyên dạng `content` cũ. `journey_stop_dish` / `journey_stop_alternative` khóa chính `(stop_id, sort_order)` thứ tự liền 0..n-1 (Hibernate `@OrderColumn`), không chặn trùng món ở DB — service bỏ trùng.
- **Chưa có màn quản trị món đặc sản**: dữ liệu `dish` chuyển từ `place` CUISINE; sửa món hiện phải làm bằng SQL.
- Khách đăng ký trùng email / SĐT với tài khoản cổng được **gộp vào tài khoản cổng** khi chuyển dữ liệu (đăng nhập trang khách bằng mật khẩu của tài khoản cổng); bảng "Ghi chú chuyển đổi" của bước 2 liệt kê từng trường hợp.

## 6. Chuyển production sang v2

Production đang chạy schema cũ trên Supabase. Không thể deploy v2 đè lên: changeset `v2-000-guard-legacy-schema` dừng khởi động nếu `public` còn bảng cũ. Quy trình dời schema cũ sang schema `legacy` (giữ nguyên dữ liệu) → backend v2 dựng schema mới trong `public` → chép dữ liệu → kiểm tra → xóa `legacy` sau.

Script: `ops/migration/v2/`. Mỗi file là **một giao dịch**: lỗi ở đâu thì cả file bị hủy, DB không đổi gì. Hai cách chạy, kết quả như nhau:

- **Trên trình duyệt (khuyến nghị):** Supabase Dashboard → **SQL Editor** → New query → mở file trong VS Code, chép **toàn bộ** nội dung → dán → **Run**. Supabase hỏi xác nhận vì có lệnh DROP / ALTER thì chọn chạy tiếp. SQL Editor chỉ hiện kết quả của câu lệnh cuối — các script đã đặt bảng cần xem ở cuối.
- **psql trên máy** (Session pooler cổng 5432 hoặc Direct connection — không dùng Transaction pooler 6543):
  ```bash
  # Git Bash trên Windows: đưa công cụ PostgreSQL (máy đã cài bản 18) vào PATH
  export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"
  # Mật khẩu để riêng trong PGPASSWORD: ký tự đặc biệt (@, #, /...) không làm hỏng chuỗi kết nối
  export PGPASSWORD='<mật khẩu database Supabase>'
  export DATABASE_URL='host=<session-pooler-host> port=5432 dbname=postgres user=postgres.<project-ref> sslmode=require'
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f ops/migration/v2/<file>.sql
  ```

Thời gian gián đoạn dự kiến 10–15 phút (từ bước 2 tới hết bước 4); làm lúc vắng khách.

**0. Chuẩn bị**
- CI xanh trên nhánh `db-v2` (gồm job PostgreSQL trống + Hibernate validate).
- Backend production đang chạy bình thường = biến `DB_URL` / `DB_PASSWORD` trên Vercel đúng; backend v2 dùng lại đúng các biến đó (mật khẩu trong `backend-api/.env` trên máy đã cũ — không dùng). `APP_SEED_INITIAL_PASSWORD` có hay không đều được: nếu backend v2 lỡ tạo admin khởi tạo trên schema trống, bước 4 tự bỏ tài khoản đó.

**1. Sao lưu** (bản sao lưu chứa dữ liệu cá nhân — giữ ngoài repo). Dữ liệu cũ vẫn nằm nguyên trong schema `legacy` tới bước 7, nên bản sao lưu là để phòng sự cố lớn:
- Supabase → **Database → Backups**: project gói trả phí có bản sao lưu tự động mỗi ngày — kiểm tra có bản trong 24 giờ qua (tải về máy nếu trang cho phép). Dữ liệu phát sinh sau thời điểm của bản đó không có trong bản sao lưu.
- Hoặc lấy bản đúng thời điểm bằng script trên máy (cần `pg_dump`, cùng biến như cách psql ở trên):
  ```bash
  DB_HOST=<session-pooler-host> DB_PORT=5432 DB_NAME=postgres DB_USERNAME=postgres.<project-ref> DB_PASSWORD="$PGPASSWORD" \
    BACKUP_DIR=~/viettrek-backups bash ops/backup/backup-postgres.sh
  ```
  Thử phục hồi vào PostgreSQL trên máy (`ops/backup/restore-postgres.sh` với `DB_HOST=localhost`, mặc định ghi vào CSDL `viettrek_restore_test`) để chắc bản sao lưu dùng được.

**2. Dời schema cũ** — chạy `01-move-legacy-to-schema.sql`. Kết quả phải là "CÒN LẠI trong public (phải trống): (không có)". Từ lúc này web cũ báo lỗi. Đổi ý ở bước này: chạy `01-undo-move.sql`.

**3. Deploy v2** — GitHub: Pull request `db-v2` → `main` → Merge. Vercel build cả backend và frontend (3–5 phút); đợi tab Deployments của `viettrek-api` báo Ready. Container đầu tiên dựng schema v2 trên `public` trống. Mở `https://viettrek-api.vercel.app/api/public/health` → phải trả 200 (danh mục lúc này còn trống).

**4. Chép dữ liệu** — chạy `02-import-from-legacy.sql`. Kết quả là một bảng: số bản ghi cũ / mới từng bảng, tiếp theo là các dòng "Ghi chú: …" (tài khoản đã gộp, SĐT bỏ vì trùng, thuộc tính không chuyển…) — lưu lại (Export CSV hoặc chụp màn hình). Script đổi `catalog_version` nên web hiện dữ liệu sau vài giây.

**4b. Chép gói mẫu sang lịch trình gợi ý** — changeset `v2-009-suggested-journeys` tham chiếu điểm / món theo slug nên ở bước 3 (`public` trống) nó **chờ** (`onFail: CONTINUE`; log "Continuing past … v2-009-suggested-journeys", các lần khởi động sau log WARN "1 changeset đang chờ dữ liệu …" mà không lấy lock). Nó chỉ chạy khi có container mới khởi động sau bước 4: Vercel → `viettrek-api` → Deployments → bản đang chạy → **Redeploy**. Log phải có `[Liquibase] Còn 1 changeset chưa chạy (vd: db/changelog/v2/009-journey-unify.sql::v2-009-suggested-journeys::viettrek) — chạy update` rồi "Update has been successful". Kiểm tra trên SQL Editor: `SELECT template_code, count(s.id) FROM journey j JOIN journey_stop s ON s.journey_id = j.id WHERE j.source = 'SUGGESTED' GROUP BY 1` → `MCC_2N1D` 15, `MCC_3N2D` 24. Trước khi redeploy, trang `/lich-trinh` vẫn đủ gói (đọc thẳng `trip_template`), chỉ chưa có id mục để nối lịch trình khách lưu về mục gốc — changeset tự nối các lịch trình đó khi chạy.

**5. Kiểm tra** (trang thật):
- Trang chủ, danh sách và chi tiết homestay, điểm đến, đặc sản (`/specialties`), bản đồ.
- Đăng nhập Admin và một NCC (bằng SĐT); các tab của cổng tải được dữ liệu.
- Đặt thử một đơn 2 loại phòng bằng tài khoản khách → NCC thấy đơn, giá từng đêm theo loại phòng → hủy đơn.
- Vercel → `viettrek-api` → Logs: các lượt `/cron/tick` trả 200.

**6. Nếu phải quay lại** (chưa chạy bước 7): chạy `rollback-to-legacy.sql`, rồi đưa web về bản cũ — Vercel → cả `viettrek-api` và `viettrek-app` → Deployments → bản trước → **Instant Rollback** (hoặc revert commit merge trên GitHub). Schema v2 cùng dữ liệu phát sinh trong lúc chạy v2 (đơn mới…) nằm ở schema `v2_rejected` để chép tay nếu cần; muốn chuyển lại lần sau thì xóa `v2_rejected` và làm lại từ bước 2.

**7. Xóa schema cũ** — sau vài ngày chạy ổn, khi đã xem kỹ bảng ghi chú của bước 4: chạy `03-drop-legacy-schema.sql`.
Script từ chối nếu `public` chưa phải schema v2 hoặc thiếu địa điểm / món / tài khoản của schema cũ. Không hoàn tác được — sau bước này chỉ còn bản sao lưu ở bước 1.

## 7. Đã kiểm chứng

Trên PostgreSQL cục bộ (không đụng production):

- `mvn verify` backend: 431 test, gồm quy tắc changelog và khóa checksum.
- Schema dựng bằng Liquibase trên DB trống + Hibernate `validate` toàn bộ entity; khởi động lại thì bỏ qua Liquibase không lấy lock (đúng hai điều kiện CI kiểm tra).
- Chuyển đổi trọn quy trình 01 → khởi động v2 (có `APP_SEED_INITIAL_PASSWORD`) → 02 → 03 → khởi động lại, trên bản dựng lại schema cũ bằng changelog cũ + dữ liệu thật lấy từ API công khai của production (26 địa điểm, 15 món, 27 loại phòng, 143 ảnh, tài khoản Admin / NCC / khách có trường hợp trùng email và SĐT). `rollback-to-legacy.sql` và các điều kiện chặn của 03 cũng đã chạy thử. Các script chạy cả theo kiểu SQL Editor của Supabase (cả file gửi trong một lần): kết quả đúng, chạy lặp bị chặn mà không đổi gì.
- API đầu-cuối: 24 bước đặt nhiều loại phòng (giá theo đêm, chống trùng, sửa đơn kiểu mới và cũ, NCC xác nhận, hủy trả tồn phòng, ngày ngừng bán chuyển từ dữ liệu cũ, thiếu phòng một loại thì cả đơn rollback); ~70 bước GET / thao tác của Admin, NCC, khách.
- Giao diện trên trình duyệt (Edge headless, bản build production): chọn 2 loại phòng ở trang homestay → trang đặt phòng → đặt → xem / sửa / hủy đơn → trang xử lý đơn của NCC; trang đặc sản (danh sách, chi tiết theo id / slug, không tồn tại); không lỗi JS; bố cục điện thoại 390px không tràn ngang.

## 8. Việc còn lại

- Chạy quy trình mục 6 trên production (cần quyền / mật khẩu DB hiện tại).
- 11/144 link ảnh trong dữ liệu đang hỏng sẵn ở production (5 ảnh phòng, 1 ảnh điểm đến, 5 ảnh món — Cloudinary đã xóa, Supabase không còn file, 1 link Unsplash 404): thay ảnh hoặc xóa dòng media.
- Màn quản trị món đặc sản (`dish`).
- Changeset 010 bỏ `trip_template`, `trip_template_tag` sau khi production đã chép gói (bước 4b) — điều kiện ở `docs/lich-trinh-goi-y.md` mục 13. Màn quản trị gói (hiện sửa gói bằng SQL trên các dòng `journey` `SUGGESTED`).
