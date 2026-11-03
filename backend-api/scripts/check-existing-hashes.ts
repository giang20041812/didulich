import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fnkcwfshexmsmzlncbvd:Huutuyen123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  const hashes = [
    '675ba50952fbf11ff7c5ecd3a70536975650d249c19aea480840dce409ba6638',
    '81b08a00548e32bd12aee6cc946febfc2d1a8bb78900987528a4a8993ce711e7',
    '101e48c74cbaa98d7d3fa49c4186f68c3311e064aefcc8430304269693cfd9c9',
    'd55512db1290951a1deb714b36d91b9bd62727db109231609d59a219300e29f0',
    '497211fb4043ebf1a5dc842161160399e0606ddfd7b0b7863c8003d29765ae22',
    'af24e067703573f9ca0c4451a6ec507f40032eedbf35013965dc8864e182d736',
    'e895cf1ff91cf2c3a72cd13c8671a8187fe7287d0cba11b04b8e39621781349c',
    'fb1a1ccce625a554f876acd81cbf6e9ae08d085e427ea9a30ebcfb0eab37afd1',
    'd90fff5ee41be4c3613771dfb6bd419220b8176426097524517f4cc27fb579ae',
    'f1963ac1e63c8935582b481ae4b94c3eabea515c9b77b18bbf91c4763769329f',
    '2cb30e19237436d4c3f25c6fe6f872e243192e96144039af1d98d13e6b961ff7',
    '46fca0e93167dae848d04b952a667e93a71090e1517deb3c7ca0b5e58e7e8f7f',
    'b765eab25837b5e435ebf9e5ea18355f3c8af0c3e4595169c4bc9a31236e2f16'
  ];

  const res = await pool.query(`
    SELECT * FROM media_asset WHERE checksum_sha256 = ANY($1)
  `, [hashes]);

  console.log('Matches in media_asset:', res.rows.length);

  // Also check if storage_key like '%homestay-anh-tuc%' exists
  const keyRes = await pool.query(`
    SELECT * FROM media_asset WHERE storage_key ILIKE '%homestay-anh-tuc%'
  `);
  console.log('Matches for storage_key homestay-anh-tuc:', keyRes.rows.length);

  await pool.end();
}

main().catch(console.error);

