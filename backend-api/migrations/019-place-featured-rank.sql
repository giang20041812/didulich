--liquibase formatted sql

--changeset viettrek:v2-019-place-featured-rank
--comment: Thứ tự ưu tiên do Admin ghim cho địa điểm (1 = đầu tiên) trong danh sách công khai của cùng loại (homestay, nhà hàng, điểm tham quan...). NULL = không ghim, xếp theo đánh giá. Không đặt UNIQUE vì Admin đổi chỗ nhiều mục trong một lần lưu.
ALTER TABLE place ADD COLUMN featured_rank integer;
ALTER TABLE place ADD CONSTRAINT ck_place_featured_rank CHECK (featured_rank IS NULL OR featured_rank > 0);
CREATE INDEX idx_place_featured_rank ON place (kind, featured_rank) WHERE featured_rank IS NOT NULL AND is_deleted = FALSE;
