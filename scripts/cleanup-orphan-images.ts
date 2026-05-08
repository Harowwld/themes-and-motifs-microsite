/**
 * Cleanup orphan images from vendor-assets bucket
 * Run with: npx tsx scripts/cleanup-orphan-images.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const orphanPaths = [
  "gallery/939/1777267329409-y6uwcl.jpg",
  "logos/385/1778216036502-66ac6k.jpg",
  "gallery/717/1778206046876-gmmxj3.jpg",
  "gallery/925/1778204210218-ed80lp.jpg",
  "gallery/362/1778215608243-tegw5g.jpg",
  "gallery/830/1778201628324-ex7xrz.jpg",
  "pending/covers/1778126834565-i0xpdw.jpg",
  "covers/1778126288186-wt1hyp.jpg",
  "gallery/859/1778207822880-crtb43.jpg",
  "gallery/508/1778140963095-ujvfi1.jpg",
  "logos/217/1778216259525-ze7gzv.jpg",
  "gallery/239/1778206552334-lzpxhn.jpg",
  "gallery/903/1778203783853-kctytk.jpg",
  "logos/717/1778206038770-ithum7.jpg",
  "logos/731/1778206345057-9eh4gj.jpg",
  "logos/196/1778201166071-hzeaat.jpg",
  "gallery/903/1778203786913-iiwivi.jpg",
  "gallery/389/1778208441375-6xjacs.jpg",
  "gallery/789/1778141612886-ntw4sz.jpg",
  "logos/789/1778141588926-iihyvw.jpg",
  "promos/768/1778028737367-2sj5ro.jpg",
  "gallery/646/1778139216747-o637tx.jpg",
  "logos/495/1778200095042-mp9bbn.jpg",
  "logos/508/1778140950599-c1xi8g.jpg",
  "logos/550/1778203398175-75f3nm.png",
  "logos/558/1778216202601-f1ojsm.jpg",
  "gallery/583/1778138956541-uh85p0.jpg",
  "gallery/583/1778139090640-epoc1f.jpg",
  "gallery/583/1778139117929-38mj6m.jpg",
  "gallery/768/1778139124522-srdwcr.jpg",
  "logos/287/1778204215237-a4xlvq.jpg",
  "gallery/768/1778139091956-zvncff.jpg",
  "gallery/927/1778207594279-jyzf9t.jpg",
  "gallery/907/1778207693302-ohpwzc.jpg",
  "gallery/789/1778141627702-tm35er.jpg",
  "gallery/789/1778141654703-40uupm.jpg",
  "gallery/768/1778139082694-ongx25.jpg",
  "gallery/768/1778139043083-ecpz70.jpg",
  "gallery/768/1778139071703-qovoyk.jpg",
  "gallery/789/1778141619318-m8jko6.jpg",
  "gallery/789/1778141648624-k29hlj.jpg",
  "gallery/789/1778141660382-mmtr0t.jpg",
  "gallery/789/1778141642912-lthc8s.jpg",
  "gallery/870/1778143097263-mlabyr.jpg",
  "gallery/260/1778140395483-ym74mh.jpg",
  "logos/356/1778143223621-jsr5wj.jpg",
  "logos/859/1778207789825-xhbhlu.jpg",
  "gallery/.emptyFolderPlaceholder"
];

async function cleanupOrphanImages() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`Deleting ${orphanPaths.length} orphan images...\n`);

  let deleted = 0;
  let failed = 0;

  for (const path of orphanPaths) {
    const { error } = await supabase.storage.from("vendor-assets").remove([path]);
    
    if (error) {
      console.error(`❌ Failed: ${path} - ${error.message}`);
      failed++;
    } else {
      console.log(`✅ Deleted: ${path}`);
      deleted++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total: ${orphanPaths.length}`);
  console.log(`Deleted: ${deleted}`);
  console.log(`Failed: ${failed}`);
}

cleanupOrphanImages().catch(console.error);
