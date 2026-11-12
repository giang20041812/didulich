import { exec, query, tx } from '../db/pool.js';
import type { CategoryKind } from '../domain/enums.js';
import { IllegalArgumentError } from '../lib/errors.js';
import { containsPattern, likeSql } from '../lib/vietnamese.js';
import * as audit from './auditLogService.js';

/**
 * Admin ghim địa điểm lên đầu danh sách công khai theo từng loại (homestay, nhà hàng, điểm tham quan...) và sắp thứ tự: địa
 * điểm có featured_rank nhỏ hơn hiện trước, phần không ghim xếp sau theo đánh giá (xem placeRepo.orderByForSort). Mỗi lần lưu
 * ghi đè toàn bộ danh sách ghim của loại đó nên thứ tự luôn liền 1..n, không bao giờ trùng.
 */

export const MAX_PINNED_PER_KIND = 50;
const CANDIDATE_LIMIT = 20;

export interface FeaturedPlaceDto {
  id: number;
  name: string;
  kind: CategoryKind;
  address: string | null;
  regionName: string | null;
  visibility: string;
  operationStatus: string;
  ratingAvg: number | null;
  ratingCount: number;
  featuredRank: number | null;
  coverImageUrl: string | null;
}

const SELECT_PLACE = `SELECT p.id, p.name, p.kind, p.address, r.name AS region_name, p.visibility, p.operation_status,
       p.rating_avg, p.rating_count, p.featured_rank,
       (SELECT ma.public_url FROM place_media pm JOIN media_asset ma ON ma.id = pm.media_id
         WHERE pm.place_id = p.id AND pm.role = 'COVER' ORDER BY pm.sort_order LIMIT 1) AS cover_image_url
  FROM place p LEFT JOIN region r ON r.id = p.region_id`;

/** Các địa điểm đã ghim của một loại, đúng thứ tự Admin đã sắp. */
export function listPinned(kind: CategoryKind): Promise<FeaturedPlaceDto[]> {
  return query<FeaturedPlaceDto>(`${SELECT_PLACE} WHERE p.kind = $1 AND p.is_deleted = FALSE AND p.featured_rank IS NOT NULL ORDER BY p.featured_rank, p.id`, [kind]);
}

/** Địa điểm chưa ghim để Admin chọn thêm: đang xuất bản, tìm theo tên / địa chỉ (không phân biệt dấu), đánh giá cao trước. */
export function listCandidates(kind: CategoryKind, keyword: string | undefined): Promise<FeaturedPlaceDto[]> {
  const params: unknown[] = [kind];
  let extra = '';
  const pattern = containsPattern(keyword);
  if (pattern) {
    params.push(pattern);
    extra = ` AND (${likeSql('p.name', '$2')} OR ${likeSql('p.address', '$2')})`;
  }
  return query<FeaturedPlaceDto>(
    `${SELECT_PLACE} WHERE p.kind = $1 AND p.is_deleted = FALSE AND p.visibility = 'PUBLISHED' AND p.featured_rank IS NULL${extra}
      ORDER BY p.rating_avg DESC NULLS LAST, p.rating_count DESC NULLS LAST, p.name LIMIT ${CANDIDATE_LIMIT}`,
    params,
  );
}

/**
 * Lưu danh sách ghim của một loại theo đúng thứ tự `ids` (phần tử đầu = hạng 1). Địa điểm không còn trong danh sách bị bỏ ghim.
 * Mọi id phải là địa điểm chưa xóa thuộc đúng loại; danh sách rỗng = bỏ ghim hết.
 */
export function savePinned(kind: CategoryKind, ids: number[], callerAccountId: number | null): Promise<FeaturedPlaceDto[]> {
  const unique = [...new Set(ids)];
  if (unique.length !== ids.length) throw new IllegalArgumentError('Danh sách có địa điểm bị trùng.');
  if (unique.length > MAX_PINNED_PER_KIND) throw new IllegalArgumentError(`Chỉ ghim tối đa ${MAX_PINNED_PER_KIND} địa điểm mỗi loại.`);

  return tx(async () => {
    if (unique.length > 0) {
      const found = await query<{ id: number }>('SELECT id FROM place WHERE id = ANY($1) AND kind = $2 AND is_deleted = FALSE', [unique, kind]);
      if (found.length !== unique.length) throw new IllegalArgumentError('Có địa điểm không tồn tại, đã bị xóa hoặc không thuộc loại này.');
    }
    const before = (await listPinned(kind)).map((p) => p.id);
    await exec('UPDATE place SET featured_rank = NULL WHERE kind = $1 AND featured_rank IS NOT NULL', [kind]);
    if (unique.length > 0) {
      await exec(
        `UPDATE place p SET featured_rank = v.rank FROM unnest($1::bigint[]) WITH ORDINALITY AS v(id, rank) WHERE p.id = v.id`,
        [unique],
      );
    }
    if (before.join(',') !== unique.join(',')) {
      await audit.record(callerAccountId, 'UPDATE_PLACE_FEATURED', 'Place', null, `Admin sắp thứ tự địa điểm nổi bật (${kind})`, { kind, placeIds: before.join(',') }, { kind, placeIds: unique.join(',') });
    }
    return listPinned(kind);
  });
}
