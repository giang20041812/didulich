const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fnkcwfshexmsmzlncbvd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_2yHDNUqkgR-RR463ER4sFA_JYH-mhh0';

async function listFiles(prefix = 'homestays/homestay-anh-tuc') {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/viettrek-media`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prefix,
      limit: 100,
      offset: 0
    })
  });

  const data = await res.json();
  console.log(`Files in ${prefix}:`, data);
}

listFiles();

