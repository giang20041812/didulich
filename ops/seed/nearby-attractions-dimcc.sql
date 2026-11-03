-- Khoảng cách đến điểm vui chơi nổi bật (từ sheet col "Khoảng cách đến điểm vui chơi nổi bật")
-- Run AFTER migration 017-highlight-nearby.sql

DELETE FROM place_highlight
WHERE type = 'NEARBY'
  AND place_id IN (SELECT id FROM place WHERE slug IN (
    'homestay-anh-tuc','new-highland-hotel','homestay-mua-vang','trai-ban-homestay',
    'hoa-son-tra-hotel','nha-nghi-duy-vu','baan-mali-homestay','homestay-hoa-thao',
    'homestay-cuong-tu','homestay-bao-lan','win-homestay','pu-nhu-house',
    'co-gai-thai-homestay','moc-homestay','bungalow-xuan-giang','hotel-thuat-hoa',
    'chelly-hotel','hanh-phuc-creek-homestay','doi-doi-gio','mcc-lu-tre',
    'mai-linh-hotel','sky-motel','nang-hotel','nha-nghi-ngu',
    'chiba-ecolodge','ha-chau-2-homestay','homestay-hien-quang','chai-eco-house',
    'hotel-moon-2','hotel-nhat-phuong'
  ));

WITH nearby_data (slug, content) AS (VALUES
  ('homestay-anh-tuc',         'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('new-highland-hotel',       'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('homestay-mua-vang',        'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('trai-ban-homestay',        'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('hoa-son-tra-hotel',        'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('nha-nghi-duy-vu',          'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('baan-mali-homestay',       'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('homestay-hoa-thao',        'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('homestay-cuong-tu',        'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('homestay-bao-lan',         'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('win-homestay',             'Móng Ngựa 4km · Mâm Xôi 10km · Rừng Trúc 4km · Kim Nọi 7km · Háng Đăng Dê 4km · Sống Lưng KL 8km'),
  ('pu-nhu-house',             'Móng Ngựa 12km · Mâm Xôi 1km · Rừng Trúc 4km · Kim Nọi 17km · Háng Đăng Dê 13km · Sống Lưng KL 8km'),
  ('co-gai-thai-homestay',     'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('moc-homestay',             'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('bungalow-xuan-giang',      'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('hotel-thuat-hoa',          'Móng Ngựa 3km · Mâm Xôi 13km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('chelly-hotel',             'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('hanh-phuc-creek-homestay', 'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('doi-doi-gio',              'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('mcc-lu-tre',               'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('mai-linh-hotel',           'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('sky-motel',                'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('nang-hotel',               'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('nha-nghi-ngu',             'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('chiba-ecolodge',           'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('ha-chau-2-homestay',       'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('homestay-hien-quang',      'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('chai-eco-house',           'Móng Ngựa 3km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km'),
  ('hotel-moon-2',             'Móng Ngựa 4km · Mâm Xôi 14km · Rừng Trúc 6km · Kim Nọi 6km · Háng Đăng Dê 3km · Sống Lưng KL 10km'),
  ('hotel-nhat-phuong',        'Móng Ngựa 4km · Mâm Xôi 12km · Rừng Trúc 5km · Kim Nọi 5km · Háng Đăng Dê 2km · Sống Lưng KL 10km')
)
INSERT INTO place_highlight (place_id, type, content, is_public, sort_order)
SELECT p.id, 'NEARBY', d.content, TRUE, 99
FROM nearby_data d
JOIN place p ON p.slug = d.slug;
