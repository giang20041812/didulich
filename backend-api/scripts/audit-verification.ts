import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function auditCheck() {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  console.log('=== RUNNING POST-SYNC AUDIT VERIFICATION ===');

  // Check Homestay Anh Túc place and media
  const anhTucMedia = await pool.query(`
    SELECT pm.place_id, p.name, pm.role, m.storage_key, m.public_url, m.checksum_sha256
    FROM place_media pm
    JOIN place p ON pm.place_id = p.id
    JOIN media_asset m ON pm.media_id = m.id
    WHERE p.id = 1
    ORDER BY pm.sort_order;
  `);
  console.log(`\nHomestay Anh Túc (ID 1) Media Assets (${anhTucMedia.rows.length}):`);
  anhTucMedia.rows.forEach(r => console.log(`  - [${r.role}] ${r.storage_key} | URL: ${r.public_url.slice(0, 75)}...`));

  // Check Homestay Anh Túc rooms and room media
  const anhTucRooms = await pool.query(`
    SELECT r.id, r.name, r.total_room_count, r.max_occupancy, r.base_price, r.status,
           b.bed_type, b.quantity as bed_qty,
           m.storage_key as room_photo
    FROM room_type r
    LEFT JOIN room_bed b ON r.id = b.room_type_id
    LEFT JOIN room_type_media rtm ON r.id = rtm.room_type_id
    LEFT JOIN media_asset m ON rtm.media_id = m.id
    WHERE r.place_id = 1
    ORDER BY r.id;
  `);
  console.log(`\nHomestay Anh Túc (ID 1) Rooms & Media:`);
  anhTucRooms.rows.forEach(r => console.log(`  - Room ${r.id}: '${r.name}' (rooms: ${r.total_room_count}, beds: ${r.bed_qty} ${r.bed_type}) | Photo: ${r.room_photo || 'none'}`));

  // Check foreign key orphan integrity
  const fkOrphanMedia = await pool.query(`
    SELECT count(*) FROM place_media pm LEFT JOIN place p ON pm.place_id = p.id WHERE p.id IS NULL;
  `);
  const fkOrphanAsset = await pool.query(`
    SELECT count(*) FROM place_media pm LEFT JOIN media_asset m ON pm.media_id = m.id WHERE m.id IS NULL;
  `);
  const fkOrphanRooms = await pool.query(`
    SELECT count(*) FROM room_type r LEFT JOIN place p ON r.place_id = p.id WHERE p.id IS NULL;
  `);
  const fkOrphanBeds = await pool.query(`
    SELECT count(*) FROM room_bed b LEFT JOIN room_type r ON b.room_type_id = r.id WHERE r.id IS NULL;
  `);

  console.log('\n--- Foreign Key Integrity Check ---');
  console.log('Orphan place_media -> place:', fkOrphanMedia.rows[0].count);
  console.log('Orphan place_media -> media_asset:', fkOrphanAsset.rows[0].count);
  console.log('Orphan room_type -> place:', fkOrphanRooms.rows[0].count);
  console.log('Orphan room_bed -> room_type:', fkOrphanBeds.rows[0].count);

  // Check public accessibility of an uploaded image via HTTP HEAD
  const sampleUrl = anhTucMedia.rows[0].public_url;
  console.log('\nChecking public HTTP accessibility of sample URL:', sampleUrl);
  try {
    const headRes = await fetch(sampleUrl, { method: 'HEAD' });
    console.log('HTTP Status:', headRes.status, headRes.statusText);
    console.log('Content-Type:', headRes.headers.get('content-type'));
    console.log('Content-Length:', headRes.headers.get('content-length'));
  } catch (err: any) {
    console.error('HTTP check error:', err.message);
  }

  await pool.end();
}

auditCheck().catch(console.error);

