import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function testWebsiteQuery() {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  // Query what the website homestay catalog query does:
  const homestays = await pool.query(`
    SELECT p.id, p.slug, p.name, p.address,
           m.public_url as cover_image,
           count(DISTINCT r.id) as room_type_count,
           min(r.base_price) as min_price
    FROM place p
    LEFT JOIN place_media pm ON p.id = pm.place_id AND pm.role = 'COVER'
    LEFT JOIN media_asset m ON pm.media_id = m.id
    LEFT JOIN room_type r ON p.id = r.place_id AND r.status = 'ACTIVE'
    WHERE p.kind = 'HOMESTAY' AND p.is_deleted = false
    GROUP BY p.id, p.slug, p.name, p.address, m.public_url
    ORDER BY p.id
    LIMIT 10;
  `);

  console.log('Sample homestays for website frontend:');
  for (const h of homestays.rows) {
    console.log(`- [${h.id}] ${h.name} | Cover: ${h.cover_image ? 'YES' : 'NO'} | Rooms: ${h.room_type_count} | Min price: ${h.min_price || 'N/A'}`);
  }

  await pool.end();
}

testWebsiteQuery().catch(console.error);

