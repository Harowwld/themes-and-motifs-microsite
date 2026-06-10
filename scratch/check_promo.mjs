import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: vendors, error: vErr } = await supabase
    .from('vendors')
    .select('id, business_name, plan')
    .ilike('business_name', '%Admiral Hotel%');
  
  if (vErr) console.error(vErr);
  console.log('Vendors:', vendors);

  if (vendors && vendors.length > 0) {
    const { data: promos, error: pErr } = await supabase
      .from('promos')
      .select('*')
      .in('vendor_id', vendors.map(v => v.id));
      
    if (pErr) console.error(pErr);
    console.log('Promos:', promos);
  }
}
run();
