import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  const res = await pool.query(`
    SELECT p.id, p.name, p.slug, pm.role, m.storage_key, m.public_url
    FROM place p
    LEFT JOIN place_media pm ON p.id = pm.place_id
    LEFT JOIN media_asset m ON pm.media_id = m.id
    WHERE p.id IN (1, 4, 13, 15) OR p.slug IN ('bungalow-xuan-giang', 'co-gai-thai-homestay', 'homestay-anh-tuc', 'trai-ban-homestay')
    ORDER BY p.id, pm.sort_order;
  `);

  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main().catch(console.error);

