# Backend API - Booking System (Node.js)

API đặt phòng / khám phá / cổng NCC / cổng Admin của Đi Du Lịch. Viết bằng **Node.js 22 + TypeScript + Express 5**, truy vấn PostgreSQL
bằng `pg` (SQL thuần), kiểm tra dữ liệu bằng `zod`. Thay thế hoàn toàn bản Spring Boot cũ nhưng **giữ nguyên hợp đồng API** (đường dẫn, JSON,
mã trạng thái, định dạng JWT, băm BCrypt) nên `frontend-pwa` không phải đổi.

## Yêu cầu cài đặt
- Node.js >= 20.11 (khuyên dùng 22)
- Docker & Docker Compose (cho PostgreSQL local)

## Thiết lập môi trường (Local)

1. **Khởi chạy PostgreSQL bằng Docker Compose:**
```bash
docker compose up -d
```

2. **Cấu hình biến môi trường:**
- Copy các dòng cần thiết trong `.env.example` thành `.env.local` (đã git-ignore).
- Tối thiểu: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` khớp `docker-compose.yml`. Dev không cần `JWT_SECRET` (secret ngẫu nhiên mỗi lần chạy).
- DB trống: đặt `APP_SEED_INITIAL_PASSWORD` để tạo tài khoản Admin đầu tiên (`APP_SEED_ADMIN_EMAIL`).

3. **Chạy ứng dụng:**
```bash
npm ci
npm run dev        # tsx watch, tự dựng schema từ migrations/*.sql lúc khởi động
```
Build + chạy bản production:
```bash
npm run build && npm start
```

## Lệnh thường dùng
| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Chạy dev, tự nạp lại khi sửa mã |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm test` | Chạy toàn bộ test (cần PostgreSQL, xem dưới) |
| `npm run migrate` | Chỉ chạy migration rồi thoát |
| `npm run build` / `npm start` | Biên dịch sang `dist/` / chạy `dist/server.js` |

## Test
Test tích hợp chạy trên PostgreSQL thật. Mỗi file test tự tạo một database riêng (`viettrek_test_<tên>`), chạy migration và dọn dữ liệu giữa các test.
Mặc định kết nối `postgres://postgres@127.0.0.1:54329/postgres`; đổi bằng `TEST_DB_ADMIN_URL`, ví dụ:
```bash
docker run -d --name pg-test -e POSTGRES_HOST_AUTH_METHOD=trust -p 54329:5432 postgres:17-alpine
npm test
```

## Cấu trúc
```
src/
  config/        đọc biến môi trường, kiểm tra secret production
  db/            pool pg, transaction (tx / afterCommit / newTx), trình chạy migration
  lib/           lỗi, phân trang kiểu Spring Page, thời gian giờ Việt Nam, kiểm tra dữ liệu (zod), cron…
  security/      JWT, BCrypt, phân quyền theo đường dẫn (accessRules), giới hạn tần suất
  repositories/  truy vấn SQL theo bảng
  services/      nghiệp vụ (đặt phòng, NCC, Admin, khám phá, combo, cron…)
  routes/        các router Express (public, traveler, partner, admin, explore, combo, cron…)
migrations/      000…015 *.sql (định dạng "liquibase formatted sql" như bản Java, chạy theo thứ tự, lịch sử ở bảng schema_migration; DB do bản Spring Boot dựng sẵn (bảng databasechangelog) được nhận là đã chạy — nâng cấp không cần chuyển dữ liệu)
test/            vitest + supertest
```

## Lưu ý về tích hợp
- **SEPay Webhook:** Cần public cổng local qua Ngrok (`ngrok http 8080`) để test webhook ở môi trường local. Endpoint vẫn trả 501 khi secret đúng (chưa có đối soát tự động, như bản Java).
- **Job định kỳ:** dev/VPS chạy trong tiến trình (mỗi phút); Vercel dùng `vercel.json` gọi `GET /api/internal/cron/tick` kèm `CRON_SECRET`.
- **Thông báo đẩy (Web Push):** khóa VAPID tự sinh lần đầu và lưu trong bảng `app_setting` nếu không đặt `PUSH_VAPID_*`.
- **Docker:** `Dockerfile` (VPS/Render…) và `Dockerfile.vercel` (Vercel Container Images) đều chạy `node dist/server.js`; không còn JVM / HAProxy.
