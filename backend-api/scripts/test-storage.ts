import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fnkcwfshexmsmzlncbvd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_2yHDNUqkgR-RR463ER4sFA_JYH-mhh0';

async function testStorage() {
  console.log('Testing Supabase Storage at:', SUPABASE_URL);
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    console.log('Bucket list HTTP status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Buckets:', data);
  } catch (err) {
    console.error('Storage test failed:', err);
  }
}

testStorage();

