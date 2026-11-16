import fs from 'node:fs/promises';
import path from 'node:path';
import { config, loadEnvFiles } from '../src/config/env.js';
import { closePool, exec, initPool, query } from '../src/db/pool.js';
import { bumpCatalogVersion } from '../src/services/catalogCache.js';

/**
 * Chuyển ảnh đang lưu ở Supabase Storage về ổ đĩa máy chủ (ACTIVE_MEDIA_PROVIDER=LOCAL) rồi sửa URL trong DB.
 *
 *   npm run migrate:media-local                                  # CHẠY THỬ: chỉ liệt kê, không tải, không ghi DB
 *   npm run migrate:media-local -- --apply --confirm-host=<host DB>   # TẢI ẢNH + CẬP NHẬT URL
 *
 * Với mỗi URL dạng  https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<đường dẫn>  trong các cột ảnh:
 *   1. tải về  <MEDIA_LOCAL_DIR>/<đường dẫn>  (giữ nguyên đường dẫn — bỏ qua nếu file đã có);
 *   2. đổi URL thành  <MEDIA_LOCAL_PUBLIC_PATH>/<đường dẫn>  (mặc định /uploads/...).
 * Chỉ sửa DB cho URL đã tải thành công; chạy lại nhiều lần được (idempotent).
 *
 * Lưu ý: Supabase đang trả 402 thì không tải được — mở lại project (billing / spend cap) trước khi chạy.
 * Image production không chứa scripts/ và tsx, nên chạy từ máy dev: đặt DB_URL trỏ tới DB của VPS (qua SSH tunnel tới cổng 5432
 * của container db) và MEDIA_LOCAL_DIR=./uploads, chạy script, rồi chép thư mục đó vào volume `viettrek_uploads` của VPS:
 *   docker run --rm -v viettrek_uploads:/data -v $PWD/uploads:/src alpine sh -c "cp -a /src/. /data/ && chown -R 1000:1000 /data"
 */

/** [bảng, cột] chứa URL ảnh. */
const COLUMNS: Array<[string, string]> = [
  ['media_asset', 'public_url'],
  ['review_image', 'url'],
  ['journey_checkin', 'photo_url'],
  ['combo', 'cover_image_url'],
  ['festival', 'cover_image_url'],
  ['account', 'avatar_url'],
];

const SUPABASE_URL = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^/]+\/(.+)$/;
const CONCURRENCY = 6;

function parseArgs(argv: string[]): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) out[m[1]!] = m[2] ?? true;
  }
  return out;
}

async function download(url: string, target: string): Promise<'ok' | 'exists'> {
  try {
    await fs.access(target);
    return 'exists';
  } catch {
    // chưa có → tải
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buf);
  return 'ok';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apply = args.apply === true;
  loadEnvFiles();
  const cfg = config();
  if (apply && args['confirm-host'] !== cfg.db.host) throw new Error(`Để ghi thật vào "${cfg.db.host}", thêm --confirm-host=${cfg.db.host}`);
  initPool(cfg.db);

  const root = path.resolve(cfg.media.localDir);
  const publicPath = cfg.media.localPublicPath;

  // Gom URL duy nhất từ mọi cột.
  const urls = new Map<string, string>(); // url → đường dẫn tương đối
  for (const [table, col] of COLUMNS) {
    const rows = await query<{ u: string }>(`SELECT DISTINCT "${col}" AS u FROM "${table}" WHERE "${col}" LIKE 'https://%.supabase.co/storage/v1/object/public/%'`);
    let n = 0;
    for (const { u } of rows) {
      const m = SUPABASE_URL.exec(u);
      if (!m) continue;
      urls.set(u, decodeURIComponent(m[1]!.split('?')[0]!));
      n++;
    }
    console.log(`${table}.${col}: ${n} URL Supabase`);
  }
  console.log(`Tổng ${urls.size} ảnh duy nhất → ${root}  (URL mới: ${publicPath}/...)`);
  if (!apply) {
    console.log('CHẠY THỬ — thêm --apply --confirm-host=... để tải và cập nhật.');
    return;
  }

  const done = new Set<string>();
  const failed: Array<[string, string]> = [];
  const queue = [...urls.entries()];
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const [url, rel] = item;
      const target = path.resolve(root, rel);
      if (!target.startsWith(root + path.sep)) { failed.push([url, 'đường dẫn không hợp lệ']); continue; }
      try {
        await download(url, target);
        done.add(url);
      } catch (err) {
        failed.push([url, (err as Error).message]);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Tải xong ${done.size}/${urls.size} ảnh, lỗi ${failed.length}.`);
  for (const [u, why] of failed.slice(0, 20)) console.log(`  ✗ ${why}  ${u}`);

  let updated = 0;
  for (const url of done) {
    const next = `${publicPath}/${urls.get(url)!}`;
    for (const [table, col] of COLUMNS) updated += await exec(`UPDATE "${table}" SET "${col}" = $1 WHERE "${col}" = $2`, [next, url]);
  }
  console.log(`Đã cập nhật ${updated} dòng trong DB.`);
  await bumpCatalogVersion();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
