# Hướng dẫn deploy DuLichSo

> **22/10/2026 — Backend chuyển từ Spring Boot (Java) sang Node.js 22 + TypeScript (Express 5).** Hợp đồng API, tên biến môi trường, định dạng JWT, băm mật khẩu và schema giữ nguyên nên frontend và dữ liệu đang chạy không phải đổi. Khác biệt khi vận hành: không còn JVM / Maven / HAProxy / CDS / Hibernate / Liquibase; schema dựng bằng `backend-api/migrations/*.sql`; build = `npm ci && npm run build`, chạy = `node dist/server.js`. Bản Java cũ được nén ở `backup-backend-api-java-2026-10-22.zip` (cạnh thư mục repo, ngoài repo). Lệnh thường dùng: [`backend-api/README.md`](backend-api/README.md).

> **11/10/2026 — Cơ sở dữ liệu v2:** chỉ còn PostgreSQL (bỏ MySQL), schema dựng lại từ đầu bằng
> `backend-api/migrations/*.sql` (trình chạy `backend-api/src/db/migrate.ts`). Thiết kế, thay đổi API và **quy trình chuyển DB
> production đang chạy schema cũ sang v2** (sao lưu → dời schema cũ → deploy → chép dữ liệu → kiểm tra → xóa schema
> cũ, kèm cách quay lại): xem [`docs/db-v2.md`](docs/db-v2.md). Không merge nhánh `db-v2` vào `main` khi chưa làm theo
> quy trình đó — backend v2 dừng khởi động nếu `public` còn bảng của schema cũ.

## 0. Bắt buộc làm trước khi chạy thật (production checklist)

1. **Đổi mọi secret đã lộ trong git history** — các bản commit cũ chứa: Cloudinary `api-key`/`api-secret`, mật khẩu database mặc định (bản MySQL cũ), mật khẩu database Supabase (trong `ops/import/place_covers.py`, đã gỡ khỏi file ngày 11/10/2026), mật khẩu ban đầu của 6 tài khoản NCC (mục 0.3) và giá trị JWT secret mặc định. Vào **Cloudinary Console → Settings → Access Keys** tạo cặp key mới rồi thu hồi cặp cũ; đổi mật khẩu database Supabase (rồi cập nhật `DB_PASSWORD` trên Vercel — mục 6.2); sinh `JWT_SECRET` mới (`openssl rand -base64 48`). Không đặt lại chúng trong source — chỉ đặt qua biến môi trường.
2. **Đặt `JWT_SECRET`** — backend **từ chối khởi động** trên profile production nếu thiếu, ngắn hơn 32 ký tự hoặc trùng giá trị mặc định cũ (xem `backend-api/src/config/productionSecretGuard.ts`).
3. **Chạy đúng profile production:**
   - Vercel + Supabase: `APP_PROFILE=supabase` (như mục 6; tên cũ `SPRING_PROFILES_ACTIVE` vẫn được đọc).
   - VPS tự quản (PostgreSQL): `APP_PROFILE=prod`.
   - Hai profile này mặc định tắt CORS wildcard dev (`*.vercel.app`, ngrok, tunnel...) và tắt seed dữ liệu mẫu — chỉ origin khai báo trong `CORS_ALLOWED_ORIGINS` được gọi API. Cần tạm mở cho tunnel test thì đặt `CORS_ALLOW_DEV_WILDCARDS=true`.
4. **Token giả mạo đã bị chặn:** token cổng ADMIN/PROVIDER không khớp tài khoản (và phiên) nào trong bảng `account` bị từ chối 401 — kể cả khi ký bằng secret đúng. Phiên trang khách (vai trò `TRAVELER`, token cũ `GUEST` vẫn nhận) không lưu phiên trên máy chủ, nhưng mọi API của khách tra lại tài khoản theo định danh trong token và từ chối khi tài khoản không còn / bị khóa. Không còn tài khoản QA cài cứng trong code — mọi tài khoản Admin/NCC phải có trong DB.
5. **Webhook SEPay chưa có đối soát tự động** (`backend-api/src/routes/sepayWebhook.ts` chỉ xác thực secret rồi trả 501). Đặt `SEPAY_WEBHOOK_SECRET` để SEPay không bị 401/403, nhưng xác nhận thanh toán hiện làm thủ công qua Cổng NCC/Admin cho tới khi triển khai đối soát `PaymentTransaction`.
6. Phụ thuộc backend (Node.js 22, Express 5, `pg`, `zod`...) khóa trong `backend-api/package-lock.json` — chạy `npm audit` trước mỗi lần phát hành. Backend không dùng Redis.

## 0.1. API miễn phí / mã nguồn mở đang dùng

| Tính năng | Dịch vụ | Chi phí | Cần key? |
|---|---|---|---|
| Geocoding NCC nhập tọa độ | VietMap (ưu tiên) hoặc [Nominatim](https://nominatim.org) (fallback) | VietMap free tier; Nominatim miễn phí | VietMap: có / Nominatim: không |
| Bản đồ nền (tile) | VietMap (free tier) | Miễn phí | Có — xem dưới |
| Thông báo đẩy | Firebase FCM | Free tier | Có (đang cấu hình `FIREBASE_PROJECT_ID`) |
| Media | Cloudinary | Free tier | Có |

- **Thời tiết (Open-Meteo) đã gỡ ngày 06/10/2026** khỏi trang chi tiết homestay cùng API `/api/public/weather` — biến `WEATHER_ENABLED` không còn tác dụng, có thể xóa khỏi Vercel.
- **Nominatim** (fallback geocoding, tự bật khi chưa có `VIETMAP_API_KEY`): tuân thủ chính sách sử dụng — tối đa 1 request/giây (đã giới hạn trong `backend-api/src/services/geocodingService.ts`), gửi `User-Agent` nhận diện (cấu hình `NOMINATIM_USER_AGENT`, nên ghi email liên hệ thật), cache kết quả (500 mục). Ép provider bằng `GEOCODING_PROVIDER=VIETMAP|NOMINATIM`.
- **Kích hoạt bản đồ nền (1 lần, ~2 phút):** tạo tài khoản miễn phí ở `console.vietmap.vn` → tạo **2 consumer**: một loại **Tilemap** (key điền `VITE_VIETMAP_API_KEY` của frontend) và một loại **Services** có quyền Search + Place (key điền `VIETMAP_API_KEY` của backend). Chưa có key tile thì bản đồ tự dùng nền vệ tinh **Esri World Imagery** (không cần key, ảnh vệ tinh không vẽ biên giới chính trị nên không phạm nguyên tắc chủ quyền — tuyệt đối không dùng OSM) — có key tile thì tự chuyển sang nền VietMap; thiếu key Services thì geocoding tự dùng Nominatim.
- **Giám sát uptime miễn phí:** `/api/public/health` đã trả 200/503 theo trạng thái database — tạo monitor 5 phút trong UptimeRobot/Better Stack (free) trỏ tới URL này để nhận cảnh báo khi container/DB sự cố.

## 0.2. Tài khoản kiểm thử (đã xác minh trên production)

> **02/10/2026 — đã dọn toàn bộ dữ liệu demo** (homestay mẫu, NCC/khách/admin demo, 32 booking demo — chi tiết
> và cách khôi phục: `ops/backup/GHI_CHU_PURGE_2026-10-02.md`). Danh mục công khai hiện chỉ gồm 6 homestay thật
> nhập từ file Excel (mục 0.3).

| Vai trò | Đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| Admin cấp 1 | `admin@dulichso.vn` | xem `backend-api/.env.deploy.local` → `APP_SEED_INITIAL_PASSWORD` | Toàn quyền — tài khoản thật duy nhất còn lại |
| 6 NCC homestay thật | theo SĐT từng homestay | xem mục 0.3 | Nhập từ file Excel 02/10/2026 |

Luồng onboarding NCC đã kiểm chứng E2E: `/register/partner` → Admin duyệt (Hồ sơ NCC) → tài khoản đăng nhập được ngay bằng mật khẩu đã đăng ký (có test tự động chốt hành vi trong `backend-api/test/`). Nạp ảnh homestay qua Cổng NCC → Homestay của tôi → quản lý ảnh (upload thẳng Cloudinary, ảnh đầu tự thành ảnh đại diện).

| NCC nội bộ (nạp ảnh/nội dung) | `0999000001` | `Vtt@NoiDung2026!` | "Viettrek Nội dung (hệ thống)" — dùng cho pipeline upload ảnh Cloudinary, không nhận booking |

## 0.3. Tài khoản NCC nhập từ file Excel `Mo_ta_Homestay_BA_da_dien.xlsx` (đã lên production 02/10/2026)

6 homestay thật ở thị trấn Mù Cang Chải, nhập qua đúng luồng nghiệp vụ (đăng ký NCC → Admin duyệt → tạo homestay + loại phòng/giá → gửi xuất bản → Admin duyệt). Đăng nhập Cổng NCC bằng **số điện thoại**:

| Homestay (placeId) | Đăng nhập (SĐT) | Mật khẩu ban đầu |
|---|---|---|
| Homestay Anh Túc (11) | `0963000708` | `Ncc@Mcc01!` |
| New Highland Hotel (12) | `0966242337` | `Ncc@Mcc02!` |
| Trai Bản Homestay (13) | `0979929101` | `Ncc@Mcc03!` |
| Hoa Sơn Trà Hotel (14) | `0974664911` | `Ncc@Mcc04!` |
| Baan Mali Homestay (15) | `0983994669` | `Ncc@Mcc05!` |
| Homestay Hoà Thảo (16) | `0974503699` | `Ncc@Mcc06!` |

Việc cần NCC hoàn thiện sau (chi tiết trong log import):
- **Ảnh**: toàn bộ ảnh hiện là placeholder có thương hiệu — chủ nhà thay ảnh thật qua Cổng NCC (Homestay của tôi → quản lý ảnh).
- **Loại phòng chưa có giá** (chưa tạo để tránh bán sai giá): Anh Túc — Sàn, nhà gỗ; New Highland — phòng 4 giường; Baan Mali — phòng cộng đồng; Hoà Thảo — phòng dom **đã tạo rồi ngừng bán (INACTIVE)** vì Excel ghi giá theo người (150–200k/người) trong khi hệ thống bán theo phòng — NCC bật lại khi chốt giá theo phòng.
- **Cần xác nhận số lượng**: Hoa Sơn Trà (Phòng thường gộp 9 = 6×1 giường to + 3×2 giường nhỏ); Hoà Thảo (đơn/đôi tạm 1 phòng mỗi loại).
- **Tọa độ**: Anh Túc / New Highland / Trai Bản / Hoà Thảo trích từ link Google Maps trong file (chính xác); Hoa Sơn Trà + Baan Mali dùng tọa độ cụm Tổ 2 thị trấn (≈±300m) — NCC nên chỉnh lại qua Cổng NCC khi có GPS chính xác.
- `businessLicenseNo` để "Đang bổ sung (HSxxx)" — cần NCC cập nhật giấy phép DKD.
- **SĐT 2** (Anh Túc 0984000708, Hoa Sơn Trà 0328608977) chưa nhập được: API/NCC portal hiện chỉ hỗ trợ 1 SĐT chính mỗi homestay — cân nhắc bổ sung sau.

Đã rà soát & chuẩn hóa khớp file Excel ngày 02/10/2026 (audit từng trường): mô tả HS005 về đúng nguyên văn; beds Trai Bản (1/2/3 giường); giá thấp nhất Hoà Thảo hiển thị đúng 350.000đ theo cột L sau khi ngừng bán phòng dom. Kèm theo: `RoomTypeDto` (API chi tiết chỗ nghỉ) đã thêm trường `status`, frontend lọc loại phòng INACTIVE khỏi trang khách — **cần deploy lại backend + frontend** để phòng dom ẩn hẳn khỏi trang chi tiết (tạm thời khách bấm đặt sẽ được backend từ chối với thông báo rõ).

## 1. Database (PostgreSQL)
- Chỉ hỗ trợ PostgreSQL (Supabase đang dùng bản 15/17; CI chạy 17). MySQL đã bỏ ngày 11/10/2026 cùng các script `dulichsoDBscript.sql` / `dulichso_deploy.sql` (không có trong source).
- DB **trống**: backend tự dựng schema v2 khi khởi động lần đầu (`backend-api/migrations/*.sql`, chạy theo thứ tự tên file bởi `src/db/migrate.ts`) và nạp dữ liệu tham chiếu (khu vực, tiện nghi, mẫu thông báo, cổng thanh toán). Admin đầu tiên: đặt `APP_SEED_INITIAL_PASSWORD` (mục 6) — backend tạo `admin@dulichso.vn` khi chưa có Admin nào đang hoạt động.
- DB đang chạy **schema cũ** (production trước 11/10/2026): làm theo [`docs/db-v2.md`](docs/db-v2.md) mục 6.
- DB production đang chạy **bản Spring Boot (schema v2)**: không cần chuyển dữ liệu. Bản Node coi các changeset trong bảng `databasechangelog` (Liquibase) là đã chạy và ghi các migration mới vào bảng `schema_migration`; hai bảng Liquibase cũ (`databasechangelog`, `databasechangeloglock`) giữ nguyên, xóa được khi chắc chắn không quay lại bản Java.
- Sao lưu / phục hồi: `ops/backup/backup-postgres.sh`, `ops/backup/restore-postgres.sh` (Supabase: Session pooler cổng 5432). Bản sao lưu chứa dữ liệu cá nhân — giữ ngoài repo.

## 2. Backend (Node.js 22 + TypeScript, Express 5)

Dev local: đặt biến trong `backend-api/.env.local` (định dạng `KEY=VALUE`, đã git-ignore) — `npm run dev` / `npm run migrate` tự đọc; hoặc export biến môi trường. Source **không có** mật khẩu/secret mặc định: dev cần đặt `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (khớp `docker-compose.yml`); `JWT_SECRET` dev có thể bỏ trống (secret ngẫu nhiên mỗi lần chạy nên phiên đăng nhập mất khi khởi động lại).

Đặt các biến môi trường (xem `backend-api/.env.example`):

| Biến | Ý nghĩa |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Kết nối PostgreSQL, vd `jdbc:postgresql://localhost:5432/viettrek` (cũng nhận `postgres://user:pass@host:5432/db?sslmode=require`) |
| `JWT_SECRET` | Chuỗi bí mật ≥ 32 ký tự — **bắt buộc đổi**, production sẽ không khởi động nếu thiếu/yếu |
| `APP_PROFILE` | `prod` (VPS PostgreSQL) / `supabase` (mục 6) — bật các mặc định an toàn (tên cũ `SPRING_PROFILES_ACTIVE` vẫn được đọc) |
| `CORS_ALLOWED_ORIGINS` | Origin frontend, vd `https://app.example.com` (nhiều origin cách nhau dấu phẩy) |
| `GOOGLE_OAUTH_CLIENT_ID` | Client ID Google (nếu dùng đăng nhập Google) |
| `APP_SEED_DEMO_DATA` | Mặc định **false** trên profile production |
| `SEPAY_WEBHOOK_SECRET` | Secret cho webhook SEPay (xem mục 0.5) |

Chạy: `cd backend-api && npm ci && npm run build && npm start` (Node >= 20.11, khuyên dùng 22). `npm start` chạy `node dist/server.js`: khi khởi động tự áp migration còn thiếu rồi nghe cổng `PORT` (mặc định 8080). Dev: `npm run dev`; test: `npm test` (cần PostgreSQL, xem `backend-api/README.md`). Container: `Dockerfile` (VPS / Render, cổng 10000) hoặc `Dockerfile.vercel` (Vercel).

## 3. Frontend (Vite)
Tạo `frontend-pwa/.env.production`:
```
VITE_API_ORIGIN=https://api.example.com   # để trống nếu dùng reverse proxy cùng domain
VITE_GOOGLE_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_GOOGLE_MAPS_API_KEY=...
```
Build: `npm ci && npm run build` → thư mục `dist/`.

Chọn **một** trong hai cách kết nối API:
- **Cùng domain (khuyến nghị):** nginx phục vụ `dist/` và chuyển `/api` sang backend, `VITE_API_ORIGIN` để trống:
  ```nginx
  server {
    listen 80;
    root /var/www/dulichso/dist;
    location /api/ { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; }
    location / { try_files $uri /index.html; }
  }
  ```
- **Khác domain:** đặt `VITE_API_ORIGIN` = URL backend và thêm origin frontend vào `CORS_ALLOWED_ORIGINS`.

Host tĩnh (Vercel/Netlify) đã có sẵn `vercel.json` và `public/_redirects` để trang `/login`, `/admin`... không bị 404 khi tải lại.

## 4. Google đăng nhập
Google Cloud Console → Credentials → OAuth Client (Web) → thêm domain frontend vào **Authorized JavaScript origins**. Không có bước này nút Google sẽ báo lỗi origin.

Nút Google dùng Google Identity Services (GIS) nên ID token có `aud` = **OAuth Client ID**. Backend bắt buộc có cùng giá trị này trong biến môi trường `GOOGLE_OAUTH_CLIENT_ID` (project `viettrek-api`, đã cấu hình = client `812546516455-tiv1...apps.googleusercontent.com` trùng frontend). Thiếu/khác giá trị → mọi lần đăng nhập Google đều báo "Google ID token không dành cho ứng dụng này (aud mismatch)" (đã xảy ra và đã fix ngày 2026-10-01). Token có `aud` = `dulichso-6ac41` (Firebase ID token) cũng được chấp nhận.

## 5. Kiểm tra sau deploy
- `POST /api/v1/auth/portal/login` với Admin → trả token.
- Đăng nhập NCC bằng SĐT → vào `/partner`.
- Mở `/admin` → các tab tải được dữ liệu (nếu 403 kiểm tra `CORS_ALLOWED_ORIGINS` và JWT).

## 6. Phương án Vercel + Supabase (PostgreSQL)
Phương án đang chạy production: frontend và backend chạy trên Vercel, database là PostgreSQL của Supabase.

| Thành phần | Nơi chạy | Ghi chú |
|---|---|---|
| Frontend | Vercel project `viettrek-app` (thư mục `frontend-pwa`) | **Không** đặt `VITE_API_URL` / `VITE_API_ORIGIN` trong Environment Variables (Production lẫn Preview; biến của Vercel ghi đè `.env.production`). Frontend gọi `/api/...` cùng domain, `frontend-pwa/vercel.json` rewrite `/api/:path*` → `https://viettrek-api.vercel.app/api/:path*` — không CORS, không preflight. Đổi domain backend thì sửa đích rewrite |
| Backend | Vercel project `viettrek-api` (thư mục `backend-api`) | Chạy dạng container từ `Dockerfile.vercel` (Vercel Container Images, đang Beta); `vercel.json` đặt `framework: container` và vùng `sin1` (cùng khu vực với database) |
| Database | Supabase project `viettrek` (`mbmliqykqjufvngjvdjx`, ap-southeast-1) | Bật bằng `APP_PROFILE=supabase` (pool 5 kết nối, tắt prepared statement khi dùng cổng 6543, lịch chạy `external` — xem `backend-api/src/config/env.ts`) |

### Biến môi trường của backend trên Vercel
| Biến | Giá trị |
|---|---|
| `APP_PROFILE` | `supabase` |
| `DB_URL` | `jdbc:postgresql://<pooler-host>:6543/postgres?sslmode=require&prepareThreshold=0` — host lấy ở Supabase → Connect → **Transaction pooler**. Vercel không có IPv6 nên không dùng được Direct connection; Vercel có thể chạy nhiều container cùng lúc nên Session pooler (cổng 5432) dễ hết kết nối. `prepareThreshold=0` giữ lại cho tương thích với cấu hình cũ (bản Node tự tắt prepared statement khi cổng là 6543) |
| `DB_USERNAME` | `postgres.<project-ref>` |
| `DB_PASSWORD` | Database password của project Supabase |
| `JWT_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự |
| `CORS_ALLOWED_ORIGINS` | Domain frontend, vd `https://viettrek-app.vercel.app` — **vẫn bắt buộc** dù frontend đi qua rewrite: POST/PUT/DELETE qua rewrite vẫn mang `Origin: https://viettrek-app.vercel.app`. Không còn chấp nhận `*.vercel.app`, ngrok, trycloudflare, onrender, LAN |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Tùy chọn — mẫu hẹp cho bản preview của chính dự án, vd `https://viettrek-app-*-<team>.vercel.app`. Không dùng `https://*.vercel.app` |
| `CRON_SECRET` | **Bắt buộc** (`openssl rand -hex 32`). Profile `supabase` mặc định `APP_SCHEDULING_MODE=external` (tắt bộ hẹn giờ trong tiến trình); dọn dữ liệu quá hạn lưu giữ chạy qua `GET /api/internal/cron/tick` do Vercel Cron gọi kèm `Authorization: Bearer <CRON_SECRET>`. Thiếu biến này endpoint trả 404 và dữ liệu quá hạn không được dọn (đơn đặt phòng không còn hạn chờ xác nhận nên không có job hết hạn đơn) |
| `RESEND_API_KEY` + `MAIL_FROM` | Gửi OTP quên mật khẩu và email báo đơn mới cho NCC qua HTTPS API của Resend (`MAIL_FROM` thuộc domain đã xác minh). Hoặc dùng SMTP: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`. Email gửi đồng bộ trong request nhưng **sau** khi transaction đã commit và trả connection về pool, timeout Resend: kết nối 2 giây (`MAIL_CONNECT_TIMEOUT_MS`), đọc 5 giây (`MAIL_TIMEOUT_MS`). `/forgot-password` luôn trả sau tối thiểu 1,5 giây để không lộ tài khoản có tồn tại hay không — chỉ che được khi gửi mail xong trong khoảng đó: nên dùng Resend; SMTP (Gmail thường 1–3 giây) làm thời gian phản hồi lộ ra tài khoản có tồn tại |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Bắt buộc để NCC tải ảnh và khách tải ảnh đánh giá (không còn giá trị mặc định trong source; thiếu thì `/{code}/review/upload-config` trả 409). Khóa cũ đã lộ trong lịch sử git — phải xoay khóa |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_STORAGE_BUCKET` (tùy chọn), `ACTIVE_MEDIA_PROVIDER=SUPABASE` | **Lưu trữ ảnh mã nguồn mở miễn phí** — Supabase Storage của chính project trên (gói free 1GB), thay cho Cloudinary. Xem mục 6.3 |
| `APP_SEED_INITIAL_PASSWORD` | Mật khẩu khởi tạo: khi DB **không còn ADMIN nào đang hoạt động** và chưa có `admin@dulichso.vn`, backend tạo `admin@dulichso.vn` với mật khẩu này. Chỉ cần cho DB mới; xóa biến khi đã có admin thật. Khi chuyển DB sang v2, admin khởi tạo lỡ tạo trên schema trống sẽ được bước chép dữ liệu tự bỏ (`docs/db-v2.md`) |
| `APP_SEED_DEMO_DATA` | Mặc định `false` ở mọi profile. `true` chỉ dùng cho DB thử nghiệm **mới**: nạp tài khoản `demo-*@example.test` với mật khẩu `APP_SEED_DEMO_PASSWORD` (trống thì ngẫu nhiên). **Lưu ý:** bản Node hiện chưa nạp dữ liệu mẫu nào — cờ này chưa có tác dụng |
| Tùy chọn | `HIKARI_MAX_POOL_SIZE` (mặc định 5 ở profile `supabase`, 20 ở profile khác) và các biến `HIKARI_*` khác (tên giữ từ bản Java, nay cấu hình pool của `pg`), `TRUST_PROXY` (cách lấy IP client sau proxy; mặc định chỉ tin `X-Forwarded-For` từ dải mạng nội bộ), `NODE_OPTIONS` (vd `--max-old-space-size`), `LOG_LEVEL`, `SHUTDOWN_TIMEOUT_SECONDS` |

Tài khoản mẫu `demo-*@example.test` (mật khẩu `Demo@12345` đã lộ) đã bị khóa trên production từ trước schema v2 (mật khẩu `{disabled}`, admin mẫu `INACTIVE`); bước chép dữ liệu sang v2 giữ nguyên trạng thái đó.

### 6.3. Lưu trữ ảnh bằng Supabase Storage (mã nguồn mở, miễn phí) — ĐÃ BẬT production 02/10/2026

Backend hỗ trợ 2 nhà cung cấp lưu trữ ảnh, chuyển bằng env `ACTIVE_MEDIA_PROVIDER` (`CLOUDINARY` mặc định → `SUPABASE`):

| | Cloudinary (SaaS) | Supabase Storage (mở) |
|---|---|---|
| Chi phí | Free tier SaaS | Free 1GB trên project Supabase đang dùng |
| Cách upload | Trình duyệt đẩy thẳng (chữ ký) | Qua backend (service key không lộ ra trình duyệt) |
| Endpoint partner | `POST /api/v1/partner/media/direct-upload` → ký | `POST /api/v1/partner/media/upload-image` (multipart) |
| Endpoint ảnh đánh giá | `GET /api/public/bookings/{code}/review/upload-config` → ký | `POST /api/public/bookings/{code}/review/image` (multipart, kiểm tra quyền đơn) |

Ảnh cũ trên Cloudinary **không cần di chuyển** — `media_asset.public_url` lưu URL tuyệt đối, hiển thị song song 2 nguồn.

> Trạng thái: đang chạy `ACTIVE_MEDIA_PROVIDER=SUPABASE` — bucket `viettrek-media` (Public). Ảnh cũ Cloudinary
> giữ nguyên URL và vẫn hiển thị; ảnh mới lưu trên Supabase Storage của chính project (free 1GB).

**Bật lần đầu (~3 phút):**
1. Supabase Dashboard → Settings → API → copy **service_role key** (`SUPABASE_SERVICE_KEY`) và project URL (`SUPABASE_URL`, vd `https://mbmliqykqjufvngjvdjx.supabase.co`).
2. Tạo bucket Public (một lần, bằng API):
   `curl -X POST "$SUPABASE_URL/storage/v1/bucket" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json" -d '{"name":"viettrek-media","public":true}'`
3. Đặt env trên Vercel project `viettrek-api`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_STORAGE_BUCKET=viettrek-media`, `ACTIVE_MEDIA_PROVIDER=SUPABASE`.
4. Push 1 commit (hoặc redeploy) — deployment mới nhận env mới. Giới hạn mỗi ảnh: JPG/PNG/WebP, ≤ 5MB.

### 6.1. Tự động deploy từ GitHub (đã bật 02/10/2026)

Cả 2 project Vercel đã **kết nối Git Integration** với repo `github.com/BAHUY996/Viettrek` và đặt đúng
root directory monorepo (`viettrek-api` → `backend-api`, `viettrek-app` → `frontend-pwa`). Luồng:

1. `git push origin main` → Vercel tự build **cả 2 project** từ thư mục tương ứng → gán alias production.
2. Container backend khởi động → **`migrate.ts` tự áp các file `migrations/*.sql` còn thiếu lên Supabase** (đây chính là
   "deploy database": thay đổi schema chỉ cần thêm file migration mới vào `backend-api/migrations` rồi push).
3. GitHub Action `.github/workflows/verify-deploy.yml` đợi build xong (~2–5 phút) rồi kiểm chứng
   production: `/api/public/health` 200, trang chủ 200, API danh mục trả JSON — hiện trạng ✓/✗ ngay trên commit.

Lưu ý:
- **Chỉ nhánh `main` deploy production.** Nhánh khác Vercel sẽ tạo *preview deployment* — hiện các biến
  môi trường backend đang để phạm vi **production-only**, nên preview của backend sẽ thiếu env và không
  khởi động được (vô hại; muốn preview chạy được thì bật thêm target "Preview" cho env trên Vercel).
- Deploy thủ công bằng CLI (`cd backend-api && vercel deploy --prod`) vẫn dùng được bình thường (đệm khi
  cần đẩy gấp mà không qua git) — bản CLI sẽ gán alias production đè lên bản git vừa rồi.
- Muốn tách luồng: vào Vercel → project → Settings → Git tắt "Production deploys" hoặc đổi production branch.

### 6.2. Sự cố 02/10/2026: mật khẩu DB bị đổi ngoài quy trình (đã xử lý)

Triệu chứng: backend production 500 liên tục, log container `FATAL: password authentication failed` khi kết
nối Supabase; đồng thời mật khẩu 6 tài khoản NCC (và admin) bị thay đổi so với giá trị trong mục 0.3
(dấu vết: `account.token_version` tăng). Nguyên nhân: mật khẩu database Supabase được đổi trực tiếp trên
dashboard mà chưa cập nhật biến `DB_PASSWORD` trên Vercel (env chỉ có hiệu lực với deployment tạo SAU khi đổi).

Xử lý (đã làm): cập nhật `DB_PASSWORD` trên Vercel + `backend-api/.env.deploy.local` → push 1 commit để git
build lại → backend sống lại; đặt lại 6 mật khẩu NCC về đúng mục 0.3 qua Admin → Tài khoản → chìa khóa.

Bài học — khi đổi mật khẩu database Supabase:
1. Vào Vercel → project `viettrek-api` → Settings → Environment Variables cập nhật `DB_PASSWORD` (hoặc
   `PATCH /v10/projects/viettrek-api/env/<id>` qua API).
2. Cập nhật `backend-api/.env.deploy.local` trên máy (đã git-ignore).
3. Push 1 commit bất kỳ lên `main` (hoặc `vercel redeploy`) — deployment mới mới nhận env mới; các
   deployment đang chạy không tự nhận.
4. Lưu ý: đổi mật khẩu DB không ảnh hưởng phiên đăng nhập web (JWT không đổi), nhưng mọi container backend
   khởi động lại sau đó phải có mật khẩu đúng.

Deploy: `cd backend-api && vercel deploy --prod`, rồi **ngay sau đó** `cd frontend-pwa && vercel deploy --prod` (frontend cũ gọi `GET /api/public/bookings/{code}` và `my-bookings` không kèm quyền nên sẽ nhận 404/401). Đặt `CRON_SECRET`, `CORS_ALLOWED_ORIGINS` trên `viettrek-api` và xóa `VITE_API_URL` / `VITE_API_ORIGIN` trên `viettrek-app` **trước** khi deploy.
   > Lưu ý từ 02/10/2026: project đã đặt Root Directory (`backend-api` / `frontend-pwa`) cho git build —
   > CLI deploy phải chạy từ **gốc repo** (`npx vercel deploy --prod` tại thư mục gốc, không phải trong
   > `backend-api/`), nếu không sẽ lỗi "Root Directory does not exist". Khuyến nghị chỉ deploy qua git push.

Kiểm tra sau deploy (chỉ GET):
- `curl -s -o /dev/null -w '%{http_code}' https://viettrek-api.vercel.app/api/public/bookings/my-bookings` → `401`; `.../api/public/bookings/<mã đơn bất kỳ>` → `404`; `.../api/internal/cron/tick` (không kèm secret) → `401`.
- Log runtime của `viettrek-api`: các lượt `/cron/tick` trả 200 với `{"status":"OK",...}` (401 nghĩa là rewrite không chuyển header `Authorization` — khi đó trỏ cron thẳng vào `/api/internal/cron/tick`).
- IP mà giới hạn tần suất nhìn thấy: `curl -s https://viettrek-app.vercel.app/api/public/health/client-ip` (qua rewrite) và `curl -s https://viettrek-api.vercel.app/api/public/health/client-ip` (gọi thẳng), so `remoteAddr` với IP của chính máy bạn (`curl -s https://ifconfig.me`). Khóa giới hạn là `req.ip` của Express (`trust proxy` = `loopback, linklocal, uniquelocal`, đổi bằng `TRUST_PROXY`): địa chỉ không thuộc mạng nội bộ **cuối cùng** trong `X-Forwarded-For`. Nếu đi qua rewrite mà `remoteAddr` là IP của hạ tầng Vercel thì mọi người dùng chung một khóa IP. Vì chưa xác nhận được, giới hạn chặt **không** đặt theo IP mà theo khóa riêng, IP chỉ là trần cao chặn lạm dụng hàng loạt:
  - Đăng nhập (`/portal/login`, `/traveler/login`): chỉ đếm lần **sai** mật khẩu — 10 lần sai / 15 phút cho mỗi cặp định danh + IP, trần chung 100 lần sai / 15 phút cho mỗi định danh; đăng nhập đúng xóa bộ đếm; trần IP 300 lần / 15 phút. Nếu IP bị gộp qua rewrite, cặp định danh + IP thành theo định danh: người biết email Admin/NCC vẫn có thể làm họ bị 429 trong 15 phút bằng 10 lần sai — lý do nên kiểm tra IP như trên.
  - Quên mật khẩu: trần IP 100 / giờ (giới hạn theo tài khoản nằm trong DB: giãn cách 60 giây, tối đa 5 lần / giờ). Đặt lại mật khẩu: 10 lần / giờ cho mỗi định danh + IP, trần IP 200 / giờ, mỗi OTP tối đa 5 lần sai.
  - Đặt phòng: 10 đơn / giờ cho mỗi SĐT khách và mỗi tài khoản khách, trần IP 100 / giờ. Tra cứu mã đơn + SĐT: 10 lần / 15 phút cho mỗi mã đơn, trần IP 100. Nạp đơn bằng mã truy cập: trần IP 300 / 10 phút. Chữ ký tải ảnh đánh giá: 30 / giờ cho mỗi đơn.
  - Muốn có giới hạn theo IP thật, bền giữa các container: thêm luật rate limit của Vercel Firewall trên project `viettrek-app` cho `/api/v1/auth/*` và `POST /api/public/bookings` (Firewall thấy IP thật của trình duyệt).

### 6.3. Trước khi push lên `main` — chống lỗi deploy

Push lên `main` là deploy production ngay (Vercel không chờ CI). Vì vậy:

1. **Làm trên nhánh / pull request, merge khi CI xanh.** `.github/workflows/ci.yml` chạy lại đúng các bước Vercel làm, trên Linux:
   - `Backend — typecheck + test + build (Node.js)`: `npm ci`, `tsc --noEmit`, `vitest` (supertest trên PostgreSQL 17 thật), rồi build `tsc`.
   - `Backend — image Vercel + migrations (PostgreSQL)`: build đúng `Dockerfile.vercel`, chạy container với PostgreSQL 17 trống — `migrate.ts` áp toàn bộ `migrations/*.sql`, gọi thử API công khai và `/api/internal/cron/tick`, khởi động lại để kiểm tra nhánh "schema đã cập nhật, bỏ qua".
   - `Frontend — npm ci + lint + build`: `tsc -b` lỗi (biến / import thừa...) là Vercel build fail.
2. **Đẩy thẳng `main` khi gấp:** tự chạy trước ở máy
   - `cd backend-api && npm ci && npm run typecheck && npm test && npm run build` (Node 22 như image; `npm test` cần PostgreSQL, xem `backend-api/README.md`),
   - `cd frontend-pwa && npm ci && npm run lint && npm run build`,
   - và `git status` không còn file mới chưa add mà code đang import (build trên máy pass nhưng trên Vercel thiếu file).
3. Sau khi push, workflow **Kiểm chứng deploy production** đợi Vercel build xong **đúng commit đó** (đọc trạng thái Vercel gắn lên commit; Vercel build lỗi thì fail ngay kèm link log) rồi mới gọi API production — không còn báo ✓ nhầm khi bản cũ vẫn đang chạy.

**Quy tắc migration** (file `backend-api/migrations/NNN-*.sql`, trình chạy `src/db/migrate.ts`; chi tiết ở `docs/db-v2.md` mục 3):
- **Không sửa / xóa / đổi id / đổi tên changeset đã chạy trên production.** Cần đổi schema thì viết changeset **mới**. Lưu ý: bản Node **không còn** kiểm tra checksum tự động (bản Java khóa checksum trong `changeset-checksums.txt`) nên quy tắc này chỉ dựa vào review — sửa file đã chạy sẽ không báo lỗi mà chỉ làm DB mới lệch với production.
- Thay đổi schema mới: thêm file `backend-api/migrations/NNN-*.sql` (số tiếp theo, bắt đầu bằng `--liquibase formatted sql`, mỗi changeset một dòng `--changeset tác-giả:id`). Runner nạp mọi file `*.sql` trong thư mục theo thứ tự tên, không cần khai báo thêm; mỗi changeset chạy trong một transaction và được ghi vào bảng `schema_migration`.
- Bảng mới phải `ALTER TABLE <bảng> ENABLE ROW LEVEL SECURITY;` trong cùng changeset; trạng thái dùng `varchar` + `CHECK`; khóa ngoại ghi rõ `ON DELETE` và có index; thời gian `timestamp(6)` theo giờ Việt Nam.
- Changeset phụ thuộc dữ liệu (unique index trên bảng đã có dữ liệu...) dùng precondition `onFail:CONTINUE` để dữ liệu xấu không chặn khởi động (`migrate.ts` thử lại ở các lần khởi động sau).
- Backend dùng SQL thuần (không ORM / entity) nên không còn bước `validate` entity ↔ schema: câu SQL sai tên cột chỉ lộ ra khi gọi API. Các test trong `backend-api/test/` chạy trên PostgreSQL thật với schema dựng từ migrations để bắt trước.

### Schema trên PostgreSQL (v2, 11/10/2026)
- Schema, quy ước, thay đổi API và quy trình chuyển từ schema cũ: [`docs/db-v2.md`](docs/db-v2.md). Changeset `v2-000-guard-legacy-schema` dừng khởi động nếu `public` còn bảng của schema cũ.
- Khởi động: `migrate.ts` đọc bảng `schema_migration` (và `databasechangelog` của bản Spring Boot cũ nếu có) mà **không lấy khóa** — không còn changeset nào chạy được thì bỏ qua hoàn toàn (log `[Migrate] Schema đã cập nhật, bỏ qua.`); còn thì mỗi changeset chạy trong một transaction giữ advisory lock của PostgreSQL (`pg_advisory_xact_lock`) nên nhiều container khởi động cùng lúc được tuần tự hóa. Khóa tự nhả khi transaction kết thúc hoặc kết nối đứt — **không có lock kẹt cần gỡ tay** như `databasechangeloglock` của Liquibase. Migration chạy **trước khi** mở cổng HTTP (xem "Giới hạn khi chạy backend trên Vercel").
- API đặt phòng công khai: mọi thao tác theo mã đơn (`/api/public/bookings/{code}/**`) cần header `X-Booking-Token` (mã truy cập trả **một lần** khi đặt đơn, DB chỉ lưu SHA-256 ở `booking.access_token_hash`) hoặc JWT của tài khoản đã đặt (`booking.traveler_id`); thiếu quyền và không tồn tại cùng trả 404. `GET /my-bookings` chỉ lấy danh tính từ JWT; thiết bị chưa đăng nhập nạp lại đơn qua `POST /api/public/bookings/lookup` kèm cặp mã đơn + mã truy cập. Đơn không có mã truy cập lẫn `traveler_id`: chỉ **xem** được — bằng tài khoản có email **đã xác minh** trùng email khách của đơn, hoặc tra cứu chỉ-đọc mã đơn + SĐT.
- Email đã xác minh (`account.email_verified_at`): đăng nhập Google, hoặc đặt lại mật khẩu bằng OTP gửi tới email. Tài khoản khách đăng ký bằng mật khẩu mà chưa xác minh: lần đầu chủ email đăng nhập Google vào tài khoản đó, mật khẩu đặt trước bị xóa (chống đăng ký trước bằng email của người khác) — khách đặt lại mật khẩu bằng "Quên mật khẩu" nếu cần. Tài khoản cổng có email chưa xác minh thì không tự gắn Google (409 `GOOGLE_LINK_REFUSED`).
- `room_unit_day`: lịch theo từng phòng — chủ nhà khóa / mở đúng "Phòng 1, Phòng 2..." (khóa chính `room_type_id, stay_date, unit_no`).

### Lịch trình: nhắc giờ, "Hôm nay", check-in, chia sẻ (08/10/2026)
- **Nhắc giờ** chạy trong cron sẵn có `/cron/tick` (mỗi phút, giờ Việt Nam) — không cần biến môi trường mới. Giờ bắt đầu đề xuất: Sáng 7:00, Trưa 11:00, Chiều 14:00, Tối 18:00; nhắc trước 30 phút (cron trễ vẫn nhắc tới 30 phút sau giờ bắt đầu). Nhận việc bằng `UPDATE journey_stop SET reminder_sent_at ... WHERE reminder_sent_at IS NULL` nên nhiều container không gửi trùng. Mỗi lần nhắc: Web Push tới thiết bị khách đã bật (dùng chung khóa VAPID với cổng Admin/NCC) + một thông báo trong chuông của app (dự phòng cho iPhone chưa "Thêm vào màn hình chính"); khách còn tải được tệp lịch `.ics` (báo trước 30 phút) ở trang lịch trình.
- **"Hôm nay"** tự bật theo ngày của lịch trình (không phụ thuộc đơn đã thanh toán): điểm tiếp theo, đếm ngược, cẩm nang (video TikTok + `place.access_note` làm hướng dẫn đường + nút Chỉ đường mở Google Maps từ vị trí khách — không gọi dịch vụ chỉ đường nào từ máy chủ).
- **Check-in địa điểm**: ảnh nén trên máy rồi tải qua backend vào Supabase Storage (thư mục `checkins/{travelerId}`, cùng bucket với ảnh đánh giá) + lưu bút tùy chọn; không bắt khách đứng tại địa điểm. Admin ẩn / bỏ ẩn ở tab "Đánh giá vi phạm" (từ cấp 3).
- **Chia sẻ** `/j/{token}`: không có mã đơn, giá, SĐT; chuyến chưa đi xong chỉ hiện "Ngày 1, 2". API công khai `GET /api/public/journeys/shared/{token}` trả `Cache-Control: no-store` (tắt chia sẻ là link chết ngay).
- NCC xem lịch trình khách gắn với đơn (chỉ đọc) trong chi tiết đơn của cổng NCC.

### Nhận / trả phòng bằng mã QR tĩnh (08/10/2026)
- Dữ liệu: `booking.checked_in_at|checked_in_by|checked_out_at|checked_out_by`, `homestay_profile.checkin_code` (unique), 2 mẫu thông báo `ADMIN_BOOKING_CHECKED_IN` / `PARTNER_BOOKING_CHECKED_IN`. Nhận / trả phòng là **mốc thời gian**, không phải trạng thái: 4 trạng thái đơn, tồn kho, báo cáo doanh thu giữ nguyên.
- **Mã QR có sẵn cho mọi homestay** (mã 8 ký tự ngẫu nhiên): homestay chuyển từ schema cũ giữ nguyên mã, homestay mới nhận mã ngay khi tạo; homestay nhập tay bằng SQL thì mã được tạo lần đầu mở trang mã QR. Mã **không bao giờ đổi**. NCC (Homestay → "In mã QR nhận phòng") hoặc Admin (danh sách địa điểm → biểu tượng QR) mở `/in-ma-qr/{placeId}` để in / tải ảnh rồi để ra cho khách quét. Mã QR luôn trỏ tới `https://viettrek-app.vercel.app/qr/{mã}` (`VITE_PUBLIC_SITE_URL` trong `frontend-pwa/.env.production`, dùng cho cả production lẫn Preview) — mở trang in từ đâu cũng ra cùng một mã. Đổi tên miền chính thức thì sửa biến này (mã đã in vẫn trỏ tên miền cũ, nên giữ tên miền cũ chạy tiếp).
- Khách quét → `/qr/{mã}` → đăng nhập (nếu cần, đăng nhập xong quay lại đúng trang) → "Nhận phòng". Không quét được thì gõ mã in dưới QR ở trang chi tiết đơn. **Chỉ đơn Đã thanh toán mới nhận phòng được** (đơn chưa thanh toán thấy "Đơn chưa thanh toán" + nút "Thanh toán ngay"; chủ nhà ghi nhận đã thanh toán thì trang tự hiện nút "Nhận phòng"), từ 00:00 ngày nhận phòng tới giờ trả phòng (`homestay_profile.check_out_until`, mặc định 12:00) của ngày trả phòng. Admin / NCC có nút "Khách đã nhận phòng" (cũng chỉ với đơn đã thanh toán) cho khách không tự quét được.
- Tự trả phòng chạy trong cron sẵn có `/cron/tick` (và job nền 5 phút khi `APP_SCHEDULING_MODE=in-process`), ghi `checked_out_by = SYSTEM` với mốc = hạn trả phòng. Không cần biến môi trường mới.

### Tối ưu đang bật
- **Quy trình đơn đặt phòng (05/10/2026):** đơn chỉ còn 4 trạng thái — `PENDING` chờ xác nhận → `CONFIRMED` đã xác nhận (chờ thanh toán) → `PAID` đã thanh toán; `PENDING` / `CONFIRMED` → `CANCELLED` đã hủy. Admin (từ cấp 2) và NCC có cùng bộ thao tác (`/api/v1/{admin|partner}/bookings/{id}/confirm|reject|pay|cancel`, lý do không bắt buộc); bấm "Đã thanh toán" tạo giao dịch SUCCESS qua cổng `MANUAL`. Khách sửa đơn khi còn `PENDING` (mỗi lần sửa báo lại Admin + NCC), hủy được trước `PAID`, đánh giá khi `PAID` từ ngày trả phòng (14 ngày). Không còn hạn 120 phút, khách không đến. Một đơn gồm một hoặc nhiều loại phòng (từ schema v2). Thông báo đẩy (Web Push) giờ có cả cho NCC: bật ở chuông thông báo của cổng NCC.
- **Giữ ấm backend + job định kỳ:** `backend-api/vercel.json` có cron gọi `/cron/tick` mỗi phút; đường dẫn này được rewrite sang `https://viettrek-api.vercel.app/api/internal/cron/tick` (Vercel Cron tự gắn `Authorization: Bearer <CRON_SECRET>`). Mỗi lượt vừa giữ ấm container vừa dọn dữ liệu quá hạn lưu giữ một lần mỗi ngày (03:30 giờ Việt Nam). Phải đi vòng qua tên miền production: cron của Vercel gọi vào URL riêng của bản deploy, còn request thật đi qua tên miền production. Đổi tên miền backend thì sửa luôn URL trong rewrite. Cron chỉ giảm khởi động nguội, không ngăn được với container mới mở thêm khi tải tăng.
- **API cùng domain:** frontend gọi `/api/...` trên `viettrek-app.vercel.app`, rewrite sang backend — trình duyệt không gửi preflight `OPTIONS`, CDN của Vercel phục vụ được các GET đã cache.
- **CDN cache cho API danh mục công khai** (`cdnCachePolicy` trong `backend-api/src/app.ts`, chỉ phản hồi 2xx của GET không kèm `Authorization`):
  - chi tiết một điểm `/api/public/places/{id}`: `s-maxage=60, stale-while-revalidate=600` (giá phòng ở đây được mang sang trang đặt phòng nên bản cũ tối đa 10 phút);
  - trang chủ `/home`, danh sách `/places`: `s-maxage=60, stale-while-revalidate=3600`;
  - dữ liệu ít đổi — khu vực `/places/regions`, tiện ích `/places/amenities`, lân cận `/{id}/nearby`, bản đồ `/{slug}/map-context`, lễ hội `/festivals`: `s-maxage=300, stale-while-revalidate=86400`.
  Tồn phòng (`/rooms`, `/api/public/bookings/**`) và đánh giá (`/reviews`) không qua CDN.
- **Cache danh mục trong bộ nhớ backend (06/10/2026)** — `backend-api/src/services/catalogCache.ts`: các API trên (và `/reviews`) trả từ bộ nhớ khi CDN hết hạn / làm mới nền / gặp URL mới — 0 câu SQL thay vì 5–10 câu. Mỗi mục gắn "phiên bản danh mục" lưu ở bảng `app_setting` (khóa `catalog_version`): mọi request GHI thành công dưới `/api/v1/admin/**`, `/api/v1/partner/**` (trừ thông báo / push) và khi khách viết / sửa / xóa đánh giá đổi phiên bản (`catalogChangeHook` trong `app.ts`), container khác thấy sau ≤ 5 giây (mỗi container chỉ hỏi lại DB tối đa 5 giây / lần). TTL 10 phút (danh mục) / 30 phút (tham chiếu) là chặn trên cho dữ liệu **sửa thẳng trong SQL editor** — sửa tay thì chờ chừng đó hoặc chạy `INSERT INTO app_setting (setting_key, setting_value, updated_at) VALUES ('catalog_version', now()::text, now()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now();`. Lọc theo ngày ở và tìm theo từ khóa không qua cache. Tổng cộng, thay đổi từ cổng Admin / NCC hiện ra trang công khai sau khoảng 1 phút (thời hạn CDN).
- **Số câu SQL mỗi API (đo trên PostgreSQL cục bộ, 06/10/2026 — trước → sau, lần sau trả từ cache = 0):** trang chủ 20 → 7; chi tiết homestay 12 → 10; chi tiết điểm đến / đặc sản 10 → 5; danh sách 7–11 → 2–3; lân cận 4 (mỗi lần kéo thanh bán kính) → 3 (một lần cho mỗi chỗ nghỉ); lịch đặt phòng chỉ đọc 4 cột thay vì cả đơn. API lân cận chỉ đọc tọa độ.
- **Trang chi tiết homestay** lúc mở chỉ gọi 2 API, lần lượt: chi tiết (CDN) rồi lịch đặt phòng; địa điểm xung quanh tải MỘT lần khi khách cuộn tới (thanh bán kính lọc tại chỗ), đánh giá chỉ tải khi chỗ nghỉ đã có đánh giá và khách cuộn tới. Trước đây mở trang bắn 6 request song song (gồm thời tiết và "điểm du lịch nổi bật" đã gỡ).
- **Frontend:** mỗi trang là một chunk riêng (`src/routes/AppRoutes.tsx`), React / animation tách thành vendor chunk, Firebase chỉ tải sau khi trang chủ hiện xong, ảnh hero dùng WebP, service worker không tải sẵn cổng Admin / NCC, thêm header bảo mật trong `frontend-pwa/vercel.json`.
- **Cache phía client cho mạng chậm (07/10/2026):** service worker (`vite.config.ts`, workbox `runtimeCaching`) giờ:
  - trả **tức thì từ cache rồi làm mới ngầm** (StaleWhileRevalidate) các GET công khai `/api/public/(home|festivals|places...)` không kèm `Authorization` — mở lại app / mạng yếu không phải chờ network; độ tươi dữ liệu vẫn bị chặn bởi CDN `s-maxage=60` như trước;
  - cache **ảnh media Supabase Storage** (`*.supabase.co`, nhà cung cấp hiện tại) cùng Cloudinary / Unsplash cũ — ảnh không tải lại mỗi lần vào (30 ngày, tối đa 150 ảnh, tự dọn khi máy hết chỗ);
  - cache ảnh tĩnh same-origin `/assets/*.webp` (hero, logo — tên file có hash bất biến) bằng CacheFirst;
  - cache font tự host.
- **Font tự host (07/10/2026):** bỏ Google Fonts, dùng `@fontsource` (Nunito / Outfit / Dancing Script, subset vietnamese + latin, đúng bộ weight cũ) import trong `src/main.tsx` — font thành asset cùng domain có hash cache bất biến 1 năm, không còn CSS chặn render từ bên thứ 3 và vẫn đúng khi offline. Lưu ý: Outfit không có subset vietnamese (Google Fonts cũng vậy từ đầu) — chữ tiếng Việt trong Outfit rơi về font hệ thống như trước. Ảnh hero được preload `fetchpriority=high` ngay trong `src/main.tsx` để tải song song với JS thay vì chờ React render (LCP nhanh hơn trên mạng chậm).
- **Tối ưu vòng 2 (07/10/2026):**
  - **Làm nóng cache khi container khởi động** (`services/catalogWarmUp.ts`): ngay sau khi máy chủ nghe cổng, tác vụ nền tự gọi HTTP vào chính mình (`/api/public/home`, `/places` trang 1, `/regions`, `/amenities`, `/festivals`) — cache danh mục nạp sẵn, pool kết nối và JIT của V8 được chạy thử với đường dẫn thật, nên request đầu tiên tới container mới (sau deploy / khi tải tăng) không phải nạp cache từ đầu.
  - **Prefetch chunk khi rê chuột** (`src/lib/routePrefetch.ts`, gắn trong `main.tsx`): rê chuột / chạm / focus vào link nào thì tải trước chunk trang đó — lần truy cập đầu (service worker chưa precache xong) chuyển trang gần như tức thì.
  - **Preconnect Supabase Storage** trong `index.html`: dựng sẵn DNS+TLS cho host ảnh media, tấm ảnh đầu của trang chủ không mất thêm một vòng mạng.
  - **Cache header cho file tĩnh public** (`frontend-pwa/vercel.json`): favicon / icon PWA / screenshots cache 7 ngày (trước đây `max-age=0` nên tải lại mỗi lần vào).
  - **Nén ảnh**: hero 210→176KB (webp q58, giảm LCP), QR Zalo 249KB jpg → 83KB webp (`QRcode.webp`).
- **Proxy ảnh media qua Vercel — `/media/...` (07/10/2026):** Supabase Storage trả ảnh với `cache-control: no-cache`, nên trình duyệt phải hỏi lại TỪNG ảnh mỗi lượt truy cập (mỗi lần hỏi tốn một vòng mạng dù được 304). Giờ ảnh đi qua rewrite `/media/:path*` trong `frontend-pwa/vercel.json` (đến Supabase Storage) với header `cache-control: public, max-age=31536000, immutable` — an toàn vì mỗi lần upload là tên file UUID mới (`backend-api/src/services/mediaStorage.ts`), URL cũ không bao giờ đổi nội dung. Lợi ích: browser cache vô thời hạn cho MỌI người dùng (kể cả không có service worker), ảnh phục vụ từ edge toàn cầu của Vercel thay vì một origin ở Singapore, cùng origin với app nên tái dùng kết nối HTTP/2. Frontend chuyển URL bằng helper `src/lib/mediaUrl.ts` tại các chỗ render ảnh phía traveler (HomePage, các trang danh sách, chi tiết homestay/điểm đến/địa điểm, carousel, lightbox, ảnh đánh giá). Service worker cache `/media/` trong `static-image-cache` (CacheFirst, 200 ảnh).
- **Đo Supabase Image Transformation (bản Pro, 07/10/2026) — KHÔNG dùng:** endpoint render hoạt động (`/storage/v1/render/image/public/...?width=&quality=&format=webp`) nhưng ảnh upload đã được nén client-side sẵn nên rất nhỏ (500–680px, 20–90KB): transformation chỉ tiết kiệm 2–13% — không đáng thêm phức tạp. Sẽ đáng bật lại (qua `mediaUrl.ts`) khi bắt đầu có ảnh nguồn lớn (1920px+).
- **Vercel Web Analytics + Speed Insights (Pro, 07/10/2026):** `<Analytics />` + `<SpeedInsights />` trong `App.tsx` — xem lượt truy cập và Core Web Vitals của người dùng thật trong dashboard Vercel (tab Analytics / Speed Insights). Script async, không chặn render.
- **Vercel Firewall rate limit (Pro) — nên bật qua dashboard:** `security/rateLimiter.ts` trong backend đếm trong bộ nhớ TỪNG container nên chỉ là lớp bảo vệ phụ. Bật Vercel Firewall cho project `viettrek-api`: Firewall → Rules, rule 1: path bắt đầu `/api/v1/auth/` AND method POST → rate limit 10 req/phút/IP; rule 2: path `/api/public/bookings` AND method POST → rate limit 10 req/phút/IP. (Đặt rule bằng dashboard rồi export; schema firewall trong vercel.json cần khớp bản export mới an toàn.)
- **Tối ưu vòng 4 (07/10/2026):**
  - **Giữ ấm 2 container:** `backend-api/vercel.json` có 2 cron mỗi phút (`/cron/tick` + `/keepalive-b`) — 2 tick song song giữ 2 container nóng, request đồng thời không còn rơi vào container nguội. Đo trên production: 2 request song song tới API chưa cache đều 0,3–0,8 giây (trước đây request thứ 2 chờ ~15 giây). Vì vậy frontend nâng `MAX_IN_FLIGHT` 1→2 (`frontend-pwa/src/lib/requestQueue.ts`) — các trang cần nhiều API (cổng NCC / Admin) tải gần gấp đôi nhanh. Muốn 3 container ấm thì thêm `/keepalive-c` tương tự (chi phí: mỗi container ấm là một instance tính phí theo giờ hoạt động).
  - **Slim precache service worker:** chỉ precache vỏ app (22 mục / ~1,05MB thay vì 115 mục / 1,86MB) — lần đầu vào mạng chậm, SW không còn giành băng thông tải trước ~100 chunk trang. Trang đã xem tự vào cache runtime (`asset-chunk-cache`, CacheFirst) nên offline vẫn chạy cho các trang đã từng mở; chuyển tab offline sang trang CHƯA từng mở sẽ hiện lỗi thay vì mở được như trước (đánh đổi có chủ đích vì tốc độ lượt đầu quan trọng hơn).
- **Nghiệm thu 1.000 VU (08/10/2026) — JS lượt tải đầu 262KB → 152KB gzip (-42%):**
  - **axios rời bundle chính** (18,5KB gzip): cấu hình gom về `lib/axiosBoot.ts` chỉ nạp ở cổng NCC/Admin/Journey (AdminGuard, PartnerLayout, PortalLoginPage, 2 trang journey gọi `installAxiosBoot()` khi chunk tải); helper phiên đồng bộ tách `lib/currentCustomer.ts`; placeService / homeService / fetchNearMeCandidates / googleLogin (HomePage) chuyển fetch hoặc dynamic import; apiError duck-type `isAxiosError`.
  - **framer-motion rời bundle chính** (43,8KB gzip): HomePage dùng `LazyCoverflow` (Suspense + skeleton); FramerSwipeCardStack chỉ mount carousel khi màn hình < md.
  - **Ảnh qua `/imgc`** (Supabase Image Transformation — width+webp q60) cho thẻ card + srcset 420/640: trang chủ 34 ảnh 6,1MB → ~1,9MB. `/media` (gốc) và `/imgc` đều có `CDN-Cache-Control: s-maxage=1 ngày, swr=7 ngày` — Vercel edge cache ảnh toàn cầu (burst 15 ảnh cùng lúc chỉ 1 request xuống Supabase). Hero 176→127KB (1440w q50). Lưu ý đặt tên prefix `/imgc` thay vì `/mediac` vì proxy `/media` khớp cả `/mediac/...` (lỗi Bucket not found).
  - **Backend**: `routes/health.ts` cho `/` và `/health` công khai (hết 403 cho monitor; các API thật vẫn 200 như cũ — 403 trước đây là do đo vào path chưa map); `publicEtag` (trong `app.ts`) ETag/304 cho GET `/api/public/*`.
  - **Bỏ phụ thuộc ngoài**: `router.project-osrm.org` (khoảng cách lân cận tính Haversine ×1,35 ngay trong trình duyệt — tính năng lịch trình mới cũng không còn gọi OSRM), `api.qrserver.com` (QR sinh client-side bằng package `qrcode`, lazy).
  - **Sentry FE lazy** khi có `VITE_SENTRY_DSN` (`lib/sentry.ts`); k6 script + hướng dẫn đo tại `loadtest/` (ramp 0→1000 VU, thresholds đúng tiêu chí nghiệm thu).

### Giới hạn khi chạy backend trên Vercel
- Container tự tắt sau 5 phút không có request; request đầu tiên sau đó phải chờ Node khởi động lại (bản Spring Boot cũ đo được khoảng 15 giây; Node khởi động nhanh hơn nhiều nhưng chưa đo lại trên production); cron giữ ấm ở trên tránh việc này, nhưng sau mỗi lần deploy request đầu vẫn chậm. Khi tải tăng Vercel mở thêm container, request rơi vào container mới cũng chờ tương tự.
- **Request ĐỒNG THỜI bị đưa sang container mới (Container Images đang Beta).** Đo trên production 06/10/2026: 6 request song song (đúng như trang chi tiết homestay cũ) → 1 request 0,4 giây ở container ấm, 5 request 16–18 giây chờ container nguội; gửi lần lượt thì mọi request ~0,25 giây. Vercel xác nhận hành vi này với container (xem thread "Container Images (beta): concurrent requests spawn cold instances instead of reusing a warm one" trên community.vercel.com) và chưa có cấu hình đổi được. Vì vậy frontend xếp hàng request tới `/api` — **tối đa 2 request cùng lúc** (bằng số container giữ ấm ở trên; request phụ như polling / tải trước ưu tiên thấp) trong `frontend-pwa/src/lib/requestQueue.ts`, gắn trong `lib/apiBase.ts` cho cả `fetch` và axios; lib/hedge.ts gửi bản sao GET sau 2 giây để che trường hợp vẫn rơi vào container nguội. **Không viết code bắn nhiều hơn 2 API song song** (`Promise.all` 3+ request tới backend). Muốn bỏ hạn chế này phải chuyển backend sang nền tảng cho một instance nhận nhiều request cùng lúc (Vercel Functions thường / Fluid, Cloud Run, Fly.io, VPS). *(Các số đo trên là của bản Spring Boot cũ; khởi động nguội của Node nhẹ hơn nhiều nên hạn chế này có thể nới sau khi đo lại — hiện chưa đo, giữ nguyên hàng đợi.)*
- Vercel chỉ cho container 25 giây để mở cổng `$PORT`. Bản Node chạy thẳng `node dist/server.js` ở `$PORT` (không còn HAProxy / CDS / JVM) và **áp migration trước khi mở cổng**: khi schema đã cập nhật chỉ tốn một câu truy vấn, nhưng deploy kèm migration nặng (hoặc DB trống) có thể vượt 25 giây — khi đó chạy `npm run migrate` với `DB_URL` production **trước** rồi mới deploy.
- Giữa hai request Vercel tạm dừng container, nên trên Vercel (profile `supabase`, `APP_SCHEDULING_MODE=external`) không bật bộ hẹn giờ trong tiến trình; job chạy trong request `/api/internal/cron/tick` theo nhịp cron mỗi phút ở trên, không đúng từng giây.
- Giới hạn tần suất (`security/rateLimiter.ts`: đăng nhập, quên mật khẩu, tạo đơn, tra cứu đơn... — chi tiết ở "Kiểm tra sau deploy") đếm trong bộ nhớ từng container — chỉ là lớp bảo vệ phụ; muốn bền vững cần thêm luật rate limit của Vercel Firewall cho `POST /api/public/bookings` và `/api/v1/auth/*`.
- Pool connection chỉ 5 (`HIKARI_MAX_POOL_SIZE`, tên biến giữ từ bản Java): mỗi request chỉ giữ connection trong transaction của service (`tx()`), không giữ suốt request (gửi email, chờ chống dò tài khoản, render JSON).
- Đổi `JWT_SECRET` làm mọi phiên đăng nhập hết hiệu lực (backend trả 401 `SESSION_REVOKED`, frontend tự đăng xuất).
