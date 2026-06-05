import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const supabaseUrl = envStr.match(/NEXT_PUBLIC_SUPABASE_URL="(.+)"/)?.[1]!;
const supabaseKey = envStr.match(/SUPABASE_SERVICE_ROLE_KEY="(.+)"/)?.[1]!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Find the target vendor
  const { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .select("id, business_name")
    .eq("contact_email", "harolddelapena.11@gmail.com")
    .single();

  if (vendorErr || !vendor) {
    console.log("Could not find vendor by email. Let's try by name...");
    const { data: altVendor, error: altErr } = await supabase
      .from("vendors")
      .select("id, business_name")
      .ilike("business_name", "%cake test%")
      .single();
      
    if (altErr || !altVendor) {
      console.error("Could not find Harold's Cake Test vendor either.");
      return;
    }
    
    console.log("Found vendor:", altVendor.business_name, "ID:", altVendor.id);
    await reassignImages(altVendor.id);
  } else {
    console.log("Found vendor:", vendor.business_name, "ID:", vendor.id);
    await reassignImages(vendor.id);
  }
}

async function reassignImages(vendorId: number) {
  console.log(`Reassigning all Unsplash mock images to vendor_id: ${vendorId}...`);
  const { data, error } = await supabase
    .from("vendor_images")
    .update({ vendor_id: vendorId })
    .like("image_url", "%unsplash.com%")
    .select("id");
    
  if (error) {
    console.error("Failed to update images:", error);
  } else {
    console.log(`Successfully reassigned ${data.length} mock images to Harold's Cake Test vendor!`);
  }
}

run();
