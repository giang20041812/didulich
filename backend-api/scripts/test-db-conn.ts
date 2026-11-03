import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT current_database(), current_user, version()');
    console.log('Postgres connection SUCCESSFUL!');
    console.log('DB Info:', res.rows[0]);

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Public tables count:', tables.rows.length);
    console.log('Public tables:', tables.rows.map(r => r.table_name).join(', '));

    const checkTables = ['place', 'homestay_profile', 'room_type', 'room_bed', 'media_asset', 'place_media', 'room_type_media'];
    for (const t of checkTables) {
      try {
        const c = await pool.query(`SELECT count(*) FROM "${t}"`);
        console.log(`Table ${t}: ${c.rows[0].count} rows`);
      } catch (err: any) {
        console.log(`Table ${t}: ERROR ${err.message}`);
      }
    }

    await pool.end();
  } catch (err: any) {
    console.error('Connection test failed:', err);
    process.exit(1);
  }
}

main();
