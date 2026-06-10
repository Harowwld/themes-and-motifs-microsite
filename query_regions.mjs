import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: regions } = await supabase.from('regions').select('*').limit(50);
  console.log("Regions:");
  console.log(regions);
  
  const { data: cities } = await supabase.from('cities').select('*').limit(5);
  console.log("\nCities:");
  console.log(cities);
}
main();
