# Load test & giám sát hiệu năng

## Chạy k6

```bash
brew install k6          # macOS; xem k6.io/docs cho Linux/Windows

# 1) Chạy thử 1 VU (smoke) — an toàn, dùng bất cứ lúc nào
BASE_URL=https://viettrek-app.vercel.app SMOKE=true k6 run k6-load-test.js

# 2) Ramp nhỏ 50 VU trước khi thử lớn
BASE_URL=https://viettrek-app.vercel.app k6 run --vus 50 --duration 2m k6-load-test.js

# 3) Kịch bản nghiệm thu đầy đủ: ramp 0 → 1000 VU, giữ 5 phút
BASE_URL=https://viettrek-app.vercel.app k6 run k6-load-test.js
```

**Ràng buộc an toàn**: KHÔNG chạy bước (3) lên production khi chưa được chủ hệ thống cho phép
(bài тест đánh thẳng API thật + CDN; Vercel còn có lớp chống bot sẽ chặn các client bắn dồn dập
— kết quả sẽ sai). Tốt nhất: chạy bước (3) trên staging, hoặc vào lúc thấp điểm và được phép.

Tiêu chí nghiệm thu được cài sẵn thành `thresholds` — k6 exit code ≠ 0 nếu sai:
`http_req_failed < 1%`, `p(95) < 800ms` (API), `max < 10s` (không timeout).

## Giám sát chậm trễ / lỗi 5xx (không cần cài thêm gì)

- **Vercel → project → Observability / Logs**: lọc status >= 500 của `viettrek-api`, xem p95 latency theo endpoint.
- **Vercel → Speed Insights / Analytics** (đã bật trong app): Core Web Vitals người dùng thật (LCP, CLS, INP, TBT).
- **Sentry frontend**: đặt biến môi trường `VITE_SENTRY_DSN` (Vercel → Settings → Environment Variables)
  rồi deploy lại — SDK tải lười, chỉ hoạt động khi có DSN (`frontend-pwa/src/lib/sentry.ts`).
- **Sentry backend (chưa bật)**: thêm dependency `io.sentry:sentry-spring-boot-starter-jakarta` +
  biến `SENTRY_DSN` khi cần; hiện lỗi backend xem qua Vercel Logs.

## Truy vấn chậm trên database (Supabase PostgreSQL)

Supabase đã bật sẵn `pg_stat_statements` — chạy trong SQL Editor để lấy các câu chậm hơn 200ms:

```sql
SELECT round(total_exec_time::numeric, 1) AS total_ms,
       round(mean_exec_time::numeric, 1)  AS avg_ms,
       calls,
       left(query, 120) AS query
FROM pg_stat_statements
WHERE mean_exec_time > 200
ORDER BY mean_exec_time DESC
LIMIT 20;
```

Chú thích kiến trúc: bảng nghiệp vụ hiện chỉ vài trăm dòng nên Postgres quét tuần tự là tối ưu —
các index sẵn có (`place(kind, needs)`, `place(category_id, kind)`, `place(region_id)` + FK) đã phủ
toàn bộ cột lọc của danh sách (kind, khu vực qua join region). Khi dữ liệu lớn lên (chục nghìn dòng+),
chạy lại câu SQL trên để quyết định index mới theo số đo thật thay vì đoán.

## Số connection DB so với giới hạn gói

- Backend cấu hình `HIKARI_MAX_POOL_SIZE=5` mỗi container, kết nối qua **Supabase Pooler chế độ
  transaction** (cổng 6543) — giới hạn gói áp cho pooler rất cao (hàng trăm).
- Số container luôn chạy: 2 (hai cron giữ ấm mỗi phút). Tổng connection thường trực ≈ 2 × 5 = 10,
  thêm các instance mở đột biến lúc cao điểm (Vercel scale theo tải) — vẫn dưới 80% mọi ngưỡng gói.
- Kiểm tra trực tiếp: Supabase Dashboard → Database → Connections.
