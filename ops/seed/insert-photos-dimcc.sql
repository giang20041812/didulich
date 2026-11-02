-- ══════════════════════════════════════════════════════════════════════════════
-- Insert ảnh từ Google Drive vào media_asset + place_media
-- URL format: https://lh3.googleusercontent.com/d/{FILE_ID}
-- Safe: bỏ qua nếu home đã có ảnh rồi
-- ══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Bước 1: Insert media_asset (ảnh mới, chưa tồn tại)
INSERT INTO media_asset (storage_key, public_url, mime_type, created_at)
SELECT
  'drive:' || v.file_id,
  'https://lh3.googleusercontent.com/d/' || v.file_id,
  'image/jpeg',
  now() AT TIME ZONE 'Asia/Ho_Chi_Minh'
FROM (VALUES
  -- homestay-anh-tuc (5 ảnh)
  ('homestay-anh-tuc', '1a2RDQLveeRde6v60ox06IMm1-GSX_h5Z', 0),
  ('homestay-anh-tuc', '1ZC6DAxM1SVqYYR4CHGYfGQczwyZ3d8c-', 1),
  ('homestay-anh-tuc', '1d1BJGzpkrv8f8Dw3gzLcBK0ojP3ENjzI', 2),
  ('homestay-anh-tuc', '1kCKZs_ErUc3iPamM4wX6jEJM3PhR6xXS', 3),
  ('homestay-anh-tuc', '1Eos-PisGrm9wHd2x9bZyL2m3mwqw_Rx2', 4),

  -- new-highland-hotel (3 ảnh)
  ('new-highland-hotel', '1rXdFz7id7_LjuE82HsZgs1d6WP1yBZ7e', 0),
  ('new-highland-hotel', '1hCPH6NJ-CVShxScvI2GfgJJE9A0uWwpD', 1),
  ('new-highland-hotel', '1WbxLIeVJXwUwJeaf1GuKBfSmzbkaAup9', 2),

  -- hoa-son-tra-hotel (1 ảnh)
  ('hoa-son-tra-hotel', '1W06k1RNvz4WMsQeaVqzgo7NE2DdRO0yy', 0),

  -- nha-nghi-duy-vu (1 ảnh)
  ('nha-nghi-duy-vu', '19z2eXqhiJLVybIAvFSkwmzNEeeK2YjvV', 0),

  -- homestay-hoa-thao (5 ảnh)
  ('homestay-hoa-thao', '1ZOAXyVpSMUP8PWvRyCHyIPysMw5QGpbj', 0),
  ('homestay-hoa-thao', '1RG52lcn_qsd89qF6YIw2kPI3HFUd8xQH', 1),
  ('homestay-hoa-thao', '1GEbayd0E2YRKBCDSc-5Crurzwxo6DWNr', 2),
  ('homestay-hoa-thao', '1-McYaeXy9cR8qmmyFCFMFft7eNj1ORB0', 3),
  ('homestay-hoa-thao', '1fF4Buif01tARjK2fH-a7DfY-m-lNhHt8', 4),

  -- homestay-cuong-tu (5 ảnh)
  ('homestay-cuong-tu', '1jC_uyQ531C-H98BwSDwB2vEtr4cYqo8n', 0),
  ('homestay-cuong-tu', '1JKArE_9VZd_34rCXS7r4YBs-W3T2OdHJ', 1),
  ('homestay-cuong-tu', '1Fw032VIDv3-Z25ve2FUAhcLfncrECcxx', 2),
  ('homestay-cuong-tu', '1nXLtV6tOK_nPeSAOZ3lM0jfgFTDA7qgw', 3),
  ('homestay-cuong-tu', '1tqmvGW9r0j1H_IvhIG8Ho1WM1ADm790_', 4),

  -- homestay-bao-lan (4 ảnh)
  ('homestay-bao-lan', '15rf-cPK4nku-1pdwHgf225WuQVHZzOiG', 0),
  ('homestay-bao-lan', '1qrdtH_rZXgRPvG-WTpvlN3jUPOkHjGAZ', 1),
  ('homestay-bao-lan', '1311JCRLcm3f-YP2HWIkrA93qKP_3mjEU', 2),
  ('homestay-bao-lan', '1_FakTmA84bqJ_W9t6AW-7MZlOvS9G51g', 3),

  -- win-homestay (4 ảnh drone)
  ('win-homestay', '1zYMr9S6xMzsPV4uy7JQUc3V6oYXKMFuQ', 0),
  ('win-homestay', '1quFOSUoNHU-w7UhZHSZa6fIZSy6kZwi7', 1),
  ('win-homestay', '1WJpu0gnM0cBstD1EGaUtbxsW-ivdXkky', 2),
  ('win-homestay', '1WG9mGAtpaRCAi0QFXLdbrOTCHzvEJ7zP', 3),

  -- pu-nhu-house (5 ảnh)
  ('pu-nhu-house', '19OzuU8-8fPqW04JABT1LR_WSkC8p8wT2', 0),
  ('pu-nhu-house', '1kfMoXspypBHum7p8bSuithI8J0vOUXu-', 1),
  ('pu-nhu-house', '1Xn691lCbK3DIK4HS7L8pDsHroVlHbkg-', 2),
  ('pu-nhu-house', '1d8-h3f-bJPj_xcCFlCmtWXkOTTiQCSBF', 3),
  ('pu-nhu-house', '1qdrliMepxRuDIwvGBx81NFTyLVEL0TRv', 4),

  -- co-gai-thai-homestay (5 ảnh)
  ('co-gai-thai-homestay', '1JUlARR5v0FC-FSdUWzoGHemy_2Luoyqh', 0),
  ('co-gai-thai-homestay', '1S9_k2IKKLvyfAS40cH8AnlZcXj07rsFa', 1),
  ('co-gai-thai-homestay', '1pW2SfloFWwYYQp1wfy-XVHGIAczrlMB6', 2),
  ('co-gai-thai-homestay', '1gNYsuAzbGqyWIn91L0KgSZMeabHHsFEm', 3),
  ('co-gai-thai-homestay', '1lsf-Y3Gu1dJOrrKT5si7UPHYW0KseTEB', 4),

  -- moc-homestay (4 ảnh)
  ('moc-homestay', '1iVtsux0LQe7DXm6g15zsIUjZl0ZgoY1i', 0),
  ('moc-homestay', '1acgQo4urm1shzGGA-BHaJoVW2GU5Q-Ik', 1),
  ('moc-homestay', '1FPeKd-pnRkhmmjbYwyEvRUMeOzaZR_JF', 2),
  ('moc-homestay', '1tAY6wLR0uyM9cKWdD5yp_lxGiYtJbSrQ', 3),

  -- bungalow-xuan-giang (5 ảnh)
  ('bungalow-xuan-giang', '1rVMvRLExU1gNYmKOINNjEDKKhdlQTkU3', 0),
  ('bungalow-xuan-giang', '1Xo30KBXTyDQ8D6fe6qjWIygh7D1sMUFg', 1),
  ('bungalow-xuan-giang', '1z9WwGO3rFjYB_kuYNRGLvckv5z-AcuB9', 2),
  ('bungalow-xuan-giang', '1tb0mlwR_KdxmCuqcbU3hksEZ0-FQkHAL', 3),
  ('bungalow-xuan-giang', '1OPGfcmHra1jfE5B65TAmBpGt1M-VIFlu', 4),

  -- hotel-thuat-hoa (2 ảnh)
  ('hotel-thuat-hoa', '11VqzSrYKxtdwIMV7Nif4jJcD6r0yH4SS', 0),
  ('hotel-thuat-hoa', '1dZWzySZoyuB7kVsnh_JiMSY9rzHp2cU6', 1),

  -- chelly-hotel (5 ảnh drone)
  ('chelly-hotel', '1g7N5v5840ejum3gVWD7Nf1-MEHRIQS86', 0),
  ('chelly-hotel', '1hGD7vBdDcIuvZ6aZwJHNIpF67QRKq86V', 1),
  ('chelly-hotel', '1j1TYfo-MXfJK1eR-UhrHxpknuDYsPpaj', 2),
  ('chelly-hotel', '1PxZ70yvQxIp_UIfTzFVbHamQCN6E8ZPM', 3),
  ('chelly-hotel', '1indQGDvPBqf9qDEeacsu6GeM22IQWUur', 4),

  -- hanh-phuc-creek-homestay (5 ảnh)
  ('hanh-phuc-creek-homestay', '1GAy6l3NGnltZ7-CSfaS1eNdCCHv_Zucm', 0),
  ('hanh-phuc-creek-homestay', '11d0A71kmG_mOerclPcjXdwuxFaaII9iL', 1),
  ('hanh-phuc-creek-homestay', '1kSLi5qfLt7wqb5-Sq2DiuO2qOxdc9c5q', 2),
  ('hanh-phuc-creek-homestay', '1KddIAymEOWgTLY5QPavq20Yg0LhJwZKV', 3),
  ('hanh-phuc-creek-homestay', '1WAI5P1EMuHYDzdWkI4s8T88m7ODUCiKI', 4),

  -- hotel-nhat-phuong (5 ảnh drone)
  ('hotel-nhat-phuong', '1CtQdMs8KLYcYe77wxoBlcxN8uYydgc6c', 0),
  ('hotel-nhat-phuong', '16rZ6wDOBB0w-Md6IbV7rRucwI2sOzBai', 1),
  ('hotel-nhat-phuong', '1YTJZLHT6qh4RPmBeZeE5JuJXJHBeMsQE', 2),
  ('hotel-nhat-phuong', '1PaR0rrTQspD44r4Yf8iiugAO7ez9y7rP', 3),
  ('hotel-nhat-phuong', '1tOEDUpt7cTPe-DFj5__5gYutvcloOCb4', 4)

) AS v(slug, file_id, sort_order)
-- Chỉ insert home chưa có ảnh
WHERE NOT EXISTS (
  SELECT 1 FROM place_media pm
  JOIN place p2 ON p2.id = pm.place_id
  WHERE p2.slug = v.slug
)
ON CONFLICT (storage_key) DO NOTHING;

-- Bước 2: Insert place_media (liên kết ảnh với place)
INSERT INTO place_media (place_id, media_id, role, sort_order)
SELECT
  p.id,
  m.id,
  CASE WHEN v.sort_order = 0 THEN 'COVER' ELSE 'GALLERY' END,
  v.sort_order
FROM (VALUES
  ('homestay-anh-tuc', '1a2RDQLveeRde6v60ox06IMm1-GSX_h5Z', 0),
  ('homestay-anh-tuc', '1ZC6DAxM1SVqYYR4CHGYfGQczwyZ3d8c-', 1),
  ('homestay-anh-tuc', '1d1BJGzpkrv8f8Dw3gzLcBK0ojP3ENjzI', 2),
  ('homestay-anh-tuc', '1kCKZs_ErUc3iPamM4wX6jEJM3PhR6xXS', 3),
  ('homestay-anh-tuc', '1Eos-PisGrm9wHd2x9bZyL2m3mwqw_Rx2', 4),
  ('new-highland-hotel', '1rXdFz7id7_LjuE82HsZgs1d6WP1yBZ7e', 0),
  ('new-highland-hotel', '1hCPH6NJ-CVShxScvI2GfgJJE9A0uWwpD', 1),
  ('new-highland-hotel', '1WbxLIeVJXwUwJeaf1GuKBfSmzbkaAup9', 2),
  ('hoa-son-tra-hotel', '1W06k1RNvz4WMsQeaVqzgo7NE2DdRO0yy', 0),
  ('nha-nghi-duy-vu', '19z2eXqhiJLVybIAvFSkwmzNEeeK2YjvV', 0),
  ('homestay-hoa-thao', '1ZOAXyVpSMUP8PWvRyCHyIPysMw5QGpbj', 0),
  ('homestay-hoa-thao', '1RG52lcn_qsd89qF6YIw2kPI3HFUd8xQH', 1),
  ('homestay-hoa-thao', '1GEbayd0E2YRKBCDSc-5Crurzwxo6DWNr', 2),
  ('homestay-hoa-thao', '1-McYaeXy9cR8qmmyFCFMFft7eNj1ORB0', 3),
  ('homestay-hoa-thao', '1fF4Buif01tARjK2fH-a7DfY-m-lNhHt8', 4),
  ('homestay-cuong-tu', '1jC_uyQ531C-H98BwSDwB2vEtr4cYqo8n', 0),
  ('homestay-cuong-tu', '1JKArE_9VZd_34rCXS7r4YBs-W3T2OdHJ', 1),
  ('homestay-cuong-tu', '1Fw032VIDv3-Z25ve2FUAhcLfncrECcxx', 2),
  ('homestay-cuong-tu', '1nXLtV6tOK_nPeSAOZ3lM0jfgFTDA7qgw', 3),
  ('homestay-cuong-tu', '1tqmvGW9r0j1H_IvhIG8Ho1WM1ADm790_', 4),
  ('homestay-bao-lan', '15rf-cPK4nku-1pdwHgf225WuQVHZzOiG', 0),
  ('homestay-bao-lan', '1qrdtH_rZXgRPvG-WTpvlN3jUPOkHjGAZ', 1),
  ('homestay-bao-lan', '1311JCRLcm3f-YP2HWIkrA93qKP_3mjEU', 2),
  ('homestay-bao-lan', '1_FakTmA84bqJ_W9t6AW-7MZlOvS9G51g', 3),
  ('win-homestay', '1zYMr9S6xMzsPV4uy7JQUc3V6oYXKMFuQ', 0),
  ('win-homestay', '1quFOSUoNHU-w7UhZHSZa6fIZSy6kZwi7', 1),
  ('win-homestay', '1WJpu0gnM0cBstD1EGaUtbxsW-ivdXkky', 2),
  ('win-homestay', '1WG9mGAtpaRCAi0QFXLdbrOTCHzvEJ7zP', 3),
  ('pu-nhu-house', '19OzuU8-8fPqW04JABT1LR_WSkC8p8wT2', 0),
  ('pu-nhu-house', '1kfMoXspypBHum7p8bSuithI8J0vOUXu-', 1),
  ('pu-nhu-house', '1Xn691lCbK3DIK4HS7L8pDsHroVlHbkg-', 2),
  ('pu-nhu-house', '1d8-h3f-bJPj_xcCFlCmtWXkOTTiQCSBF', 3),
  ('pu-nhu-house', '1qdrliMepxRuDIwvGBx81NFTyLVEL0TRv', 4),
  ('co-gai-thai-homestay', '1JUlARR5v0FC-FSdUWzoGHemy_2Luoyqh', 0),
  ('co-gai-thai-homestay', '1S9_k2IKKLvyfAS40cH8AnlZcXj07rsFa', 1),
  ('co-gai-thai-homestay', '1pW2SfloFWwYYQp1wfy-XVHGIAczrlMB6', 2),
  ('co-gai-thai-homestay', '1gNYsuAzbGqyWIn91L0KgSZMeabHHsFEm', 3),
  ('co-gai-thai-homestay', '1lsf-Y3Gu1dJOrrKT5si7UPHYW0KseTEB', 4),
  ('moc-homestay', '1iVtsux0LQe7DXm6g15zsIUjZl0ZgoY1i', 0),
  ('moc-homestay', '1acgQo4urm1shzGGA-BHaJoVW2GU5Q-Ik', 1),
  ('moc-homestay', '1FPeKd-pnRkhmmjbYwyEvRUMeOzaZR_JF', 2),
  ('moc-homestay', '1tAY6wLR0uyM9cKWdD5yp_lxGiYtJbSrQ', 3),
  ('bungalow-xuan-giang', '1rVMvRLExU1gNYmKOINNjEDKKhdlQTkU3', 0),
  ('bungalow-xuan-giang', '1Xo30KBXTyDQ8D6fe6qjWIygh7D1sMUFg', 1),
  ('bungalow-xuan-giang', '1z9WwGO3rFjYB_kuYNRGLvckv5z-AcuB9', 2),
  ('bungalow-xuan-giang', '1tb0mlwR_KdxmCuqcbU3hksEZ0-FQkHAL', 3),
  ('bungalow-xuan-giang', '1OPGfcmHra1jfE5B65TAmBpGt1M-VIFlu', 4),
  ('hotel-thuat-hoa', '11VqzSrYKxtdwIMV7Nif4jJcD6r0yH4SS', 0),
  ('hotel-thuat-hoa', '1dZWzySZoyuB7kVsnh_JiMSY9rzHp2cU6', 1),
  ('chelly-hotel', '1g7N5v5840ejum3gVWD7Nf1-MEHRIQS86', 0),
  ('chelly-hotel', '1hGD7vBdDcIuvZ6aZwJHNIpF67QRKq86V', 1),
  ('chelly-hotel', '1j1TYfo-MXfJK1eR-UhrHxpknuDYsPpaj', 2),
  ('chelly-hotel', '1PxZ70yvQxIp_UIfTzFVbHamQCN6E8ZPM', 3),
  ('chelly-hotel', '1indQGDvPBqf9qDEeacsu6GeM22IQWUur', 4),
  ('hanh-phuc-creek-homestay', '1GAy6l3NGnltZ7-CSfaS1eNdCCHv_Zucm', 0),
  ('hanh-phuc-creek-homestay', '11d0A71kmG_mOerclPcjXdwuxFaaII9iL', 1),
  ('hanh-phuc-creek-homestay', '1kSLi5qfLt7wqb5-Sq2DiuO2qOxdc9c5q', 2),
  ('hanh-phuc-creek-homestay', '1KddIAymEOWgTLY5QPavq20Yg0LhJwZKV', 3),
  ('hanh-phuc-creek-homestay', '1WAI5P1EMuHYDzdWkI4s8T88m7ODUCiKI', 4),
  ('hotel-nhat-phuong', '1CtQdMs8KLYcYe77wxoBlcxN8uYydgc6c', 0),
  ('hotel-nhat-phuong', '16rZ6wDOBB0w-Md6IbV7rRucwI2sOzBai', 1),
  ('hotel-nhat-phuong', '1YTJZLHT6qh4RPmBeZeE5JuJXJHBeMsQE', 2),
  ('hotel-nhat-phuong', '1PaR0rrTQspD44r4Yf8iiugAO7ez9y7rP', 3),
  ('hotel-nhat-phuong', '1tOEDUpt7cTPe-DFj5__5gYutvcloOCb4', 4)
) AS v(slug, file_id, sort_order)
JOIN place p ON p.slug = v.slug
JOIN media_asset m ON m.storage_key = 'drive:' || v.file_id
WHERE NOT EXISTS (
  SELECT 1 FROM place_media pm WHERE pm.place_id = p.id AND pm.media_id = m.id
);

COMMIT;

-- Kiểm tra kết quả
SELECT
  p.slug,
  p.name,
  COUNT(pm.id) AS so_anh,
  SUM(CASE WHEN pm.role = 'COVER' THEN 1 ELSE 0 END) AS cover
FROM place p
LEFT JOIN place_media pm ON pm.place_id = p.id
WHERE p.slug IN (
  'homestay-anh-tuc','new-highland-hotel','hoa-son-tra-hotel','nha-nghi-duy-vu',
  'homestay-hoa-thao','homestay-cuong-tu','homestay-bao-lan','win-homestay',
  'pu-nhu-house','co-gai-thai-homestay','moc-homestay','bungalow-xuan-giang',
  'hotel-thuat-hoa','chelly-hotel','hanh-phuc-creek-homestay','hotel-nhat-phuong'
)
GROUP BY p.slug, p.name
ORDER BY p.name;
