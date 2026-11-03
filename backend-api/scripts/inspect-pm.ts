import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  const res = await pool.query(`
    SELECT pm.place_id, p.name, p.slug, pm.role, m.storage_key, m.checksum_sha256
    FROM place_media pm
    JOIN place p ON pm.place_id = p.id
    JOIN media_asset m ON pm.media_id = m.id
    ORDER BY p.id, pm.sort_order;
  `);

  console.log('Total place_media rows:', res.rows.length);
  const byPlace = {};
  for (const r of res.rows) {
    byPlace[r.name] = (byPlace[r.name] || 0) + 1;
  }
  for (const [name, count] of Object.entries(byPlace)) {
    console.log(`- ${name}: ${count} media`);
  }

  // Also check checksums in media_asset
  const checksums = await pool.query(`
    SELECT checksum_sha256, storage_key FROM media_asset WHERE checksum_sha256 IS NOT NULL;
  `);
  console.log('Total media with checksum:', checksums.rows.length);

  await pool.end();
}

main().catch(console.error);

