import request from 'supertest';
import type { Express } from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { exec } from '../src/db/pool.js';
import { bearer, createAdmin, createPlace, resetData, setupDatabase, teardownDatabase } from './helpers.js';

let app: Express;

beforeAll(async () => {
  app = await setupDatabase('viettrek_test_featured');
});
afterAll(async () => {
  await teardownDatabase();
});
beforeEach(async () => {
  await resetData();
});

const FEATURED = '/api/v1/admin/featured-places';

async function homestay(name: string, rating: number, kind = 'HOMESTAY') {
  const id = await createPlace({ name, kind });
  await exec('UPDATE place SET rating_avg = $2, rating_count = 10 WHERE id = $1', [id, rating]);
  return id;
}

const publicNames = async (kind = 'HOMESTAY', sort?: string) => {
  const res = await request(app).get(`/api/public/places?kind=${kind}${sort ? `&sort=${sort}` : ''}`);
  expect(res.status).toBe(200);
  return (res.body.content as { name: string }[]).map((p) => p.name);
};

describe('địa điểm nổi bật', () => {
  it('đưa địa điểm ghim lên đầu theo đúng thứ tự, phần còn lại xếp theo đánh giá', async () => {
    const admin = await createAdmin(2);
    const a = await homestay('Nhà A', 4.9);
    const b = await homestay('Nhà B', 4.5);
    const c = await homestay('Nhà C', 4.0);
    const quan = await homestay('Quán X', 3.0, 'RESTAURANT');

    expect(await publicNames()).toEqual(['Nhà A', 'Nhà B', 'Nhà C']);

    const saved = await request(app).put(`${FEATURED}/HOMESTAY`).set(bearer(admin.token)).send({ ids: [c, b] });
    expect(saved.status).toBe(200);
    expect(saved.body.map((p: { id: number; featuredRank: number }) => [p.id, p.featuredRank])).toEqual([[c, 1], [b, 2]]);

    expect(await publicNames()).toEqual(['Nhà C', 'Nhà B', 'Nhà A']);
    // Mục "Đề xuất" của giao diện gửi ratingAvg,desc — cũng phải ưu tiên địa điểm ghim.
    expect(await publicNames('HOMESTAY', 'ratingAvg,desc')).toEqual(['Nhà C', 'Nhà B', 'Nhà A']);
    // Sắp theo giá thì không bị ghim chi phối.
    expect((await publicNames('HOMESTAY', 'price_asc')).sort()).toEqual(['Nhà A', 'Nhà B', 'Nhà C']);
    // Loại khác không bị ảnh hưởng.
    expect(await publicNames('RESTAURANT')).toEqual(['Quán X']);

    // Đổi thứ tự và bớt một địa điểm: hạng luôn liền 1..n.
    const reordered = await request(app).put(`${FEATURED}/HOMESTAY`).set(bearer(admin.token)).send({ ids: [b, a] });
    expect(reordered.status).toBe(200);
    expect(await publicNames()).toEqual(['Nhà B', 'Nhà A', 'Nhà C']);

    const listed = await request(app).get(`${FEATURED}?kind=HOMESTAY`).set(bearer(admin.token));
    expect(listed.body.map((p: { name: string }) => p.name)).toEqual(['Nhà B', 'Nhà A']);

    const cleared = await request(app).put(`${FEATURED}/HOMESTAY`).set(bearer(admin.token)).send({ ids: [] });
    expect(cleared.body).toEqual([]);
    expect(await publicNames()).toEqual(['Nhà A', 'Nhà B', 'Nhà C']);
    void quan;
  });

  it('chỉ gợi ý địa điểm chưa ghim khi tìm để thêm, không phân biệt dấu', async () => {
    const admin = await createAdmin(2);
    const a = await homestay('Nhà Sàn Mù Cang Chải', 4.5);
    await homestay('Homestay Tú Lệ', 4.0);
    await request(app).put(`${FEATURED}/HOMESTAY`).set(bearer(admin.token)).send({ ids: [a] });

    const all = await request(app).get(`${FEATURED}/candidates?kind=HOMESTAY`).set(bearer(admin.token));
    expect(all.body.map((p: { name: string }) => p.name)).toEqual(['Homestay Tú Lệ']);
    const found = await request(app).get(`${FEATURED}/candidates?kind=HOMESTAY&keyword=tu%20le`).set(bearer(admin.token));
    expect(found.body).toHaveLength(1);
  });

  it('từ chối id trùng, sai loại hoặc không tồn tại', async () => {
    const admin = await createAdmin(2);
    const a = await homestay('Nhà A', 4.5);
    const quan = await homestay('Quán X', 4.0, 'RESTAURANT');
    const put = (ids: number[]) => request(app).put(`${FEATURED}/HOMESTAY`).set(bearer(admin.token)).send({ ids });
    expect((await put([a, a])).status).toBe(400);
    expect((await put([quan])).status).toBe(400);
    expect((await put([999999])).status).toBe(400);
  });

  it('cấp 3 chỉ được xem, không được sắp xếp', async () => {
    const l3 = await createAdmin(3);
    const a = await homestay('Nhà A', 4.5);
    expect((await request(app).get(`${FEATURED}?kind=HOMESTAY`).set(bearer(l3.token))).status).toBe(200);
    expect((await request(app).put(`${FEATURED}/HOMESTAY`).set(bearer(l3.token)).send({ ids: [a] })).status).toBe(403);
    expect((await request(app).get(`${FEATURED}?kind=HOMESTAY`)).status).toBe(403);
  });
});
