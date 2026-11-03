import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fnkcwfshexmsmzlncbvd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_2yHDNUqkgR-RR463ER4sFA_JYH-mhh0';

async function testUpload() {
  const testKey = '_test/connectivity_check.txt';
  const fileContent = Buffer.from('Supabase storage connectivity test ' + new Date().toISOString(), 'utf8');

  console.log('Uploading test file to:', testKey);
  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/viettrek-media/${testKey}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'text/plain',
      'x-upsert': 'true'
    },
    body: fileContent
  });

  console.log('Upload status:', uploadRes.status, uploadRes.statusText);
  const resText = await uploadRes.text();
  console.log('Upload response:', resText);

  // If successful, delete the test file
  if (uploadRes.ok) {
    const delRes = await fetch(`${SUPABASE_URL}/storage/v1/object/viettrek-media`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefixes: [testKey] })
    });
    console.log('Cleanup test file status:', delRes.status);
  }
}

testUpload().catch(console.error);

