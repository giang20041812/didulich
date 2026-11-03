import pg from 'pg';
import fs from 'fs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function inspectSchema() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const report: Record<string, any> = {};

  const tablesToInspect = ['place', 'homestay_profile', 'room_type', 'room_bed', 'media_asset', 'place_media', 'room_type_media'];

  for (const table of tablesToInspect) {
    const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);

    const constraints = await pool.query(`
      SELECT tc.constraint_type, tc.constraint_name, kcu.column_name,
             ccu.table_name AS foreign_table_name,
             ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public' AND tc.table_name = $1;
    `, [table]);

    report[table] = {
      columns: cols.rows,
      constraints: constraints.rows
    };
  }

  // Get current places
  const existingPlaces = await pool.query(`
    SELECT *
    FROM place
    WHERE kind = 'HOMESTAY'
    ORDER BY name;
  `);

  // Get current room types
  const existingRooms = await pool.query(`
    SELECT r.*, p.name as place_name
    FROM room_type r
    JOIN place p ON r.place_id = p.id
    ORDER BY p.name, r.name;
  `);

  // Get current media
  const existingMedia = await pool.query(`
    SELECT *
    FROM media_asset
    ORDER BY id;
  `);

  fs.writeFileSync('C:/Users/TUYEN/.gemini/antigravity/brain/1d733f9a-ea9c-43d4-b0db-c61bda9f7f93/scratch/supabase_schema_audit.json', JSON.stringify({
    schema: report,
    existingPlacesCount: existingPlaces.rows.length,
    existingPlaces: existingPlaces.rows,
    existingRoomsCount: existingRooms.rows.length,
    existingRooms: existingRooms.rows,
    existingMediaCount: existingMedia.rows.length,
    existingMedia: existingMedia.rows
  }, null, 2), 'utf8');

  console.log('Inspection complete. Total existing homestays:', existingPlaces.rows.length);
  console.log('Total existing room types:', existingRooms.rows.length);
  console.log('Total existing media assets:', existingMedia.rows.length);

  await pool.end();
}

inspectSchema().catch(console.error);
