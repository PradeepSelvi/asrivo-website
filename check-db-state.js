require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkDbState() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('Checking database state...\n');

  // Check admin_profiles
  const { data: ap, error: apErr } = await supabase
    .from('admin_profiles')
    .select('id, email, role')
    .limit(10);

  if (apErr) {
    console.log('❌ admin_profiles:', apErr.message);
  } else {
    console.log(`✅ admin_profiles exists — rows: ${ap.length}`);
    ap.forEach(r => console.log(`   ${r.email} (${r.role})`));
  }

  // Check auth users for our emails
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.log('❌ Auth users list:', authErr.message);
  } else {
    const targets = ['pradeepselvi126@gmail.com', 'idnumberselect@gmail.com'];
    const found = authUsers.users.filter(u => targets.includes(u.email));
    console.log(`\n Auth users found (${found.length}/2):`);
    found.forEach(u => console.log(`   ${u.email} — confirmed: ${u.email_confirmed_at ? 'yes' : 'no'}`));
  }
}

checkDbState().catch(console.error);
