import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const supabaseUrl = envStr.match(/NEXT_PUBLIC_SUPABASE_URL="(.+)"/)?.[1]!;
const supabaseKey = envStr.match(/SUPABASE_SERVICE_ROLE_KEY="(.+)"/)?.[1]!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching vendors and themes...");
  
  const { data: vendors, error: vendorsError } = await supabase
    .from("vendors")
    .select("id")
    .eq("is_active", true)
    .limit(10);
    
  if (vendorsError || !vendors?.length) {
    console.error("Failed to fetch vendors", vendorsError);
    return;
  }
  
  const { data: themes, error: themesError } = await supabase
    .from("themes")
    .select("id, name");
    
  if (themesError || !themes?.length) {
    console.error("Failed to fetch themes", themesError);
    return;
  }
  
  const mockImagesByTheme: Record<string, string[]> = {
    "Rustic Elegance": [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=2070&auto=format&fit=crop",
    ],
    "Modern Minimalist": [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop"
    ],
    "Classic Romantic": [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop"
    ]
  };
  
  // Generic wedding images for fallback
  const genericImages = [
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop"
  ];
  
  const inserts = [];
  
  for (const theme of themes) {
    const urls = mockImagesByTheme[theme.name] || genericImages;
    
    // Assign each image to a random vendor
    for (const url of urls) {
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
      
      inserts.push({
        vendor_id: randomVendor.id,
        theme_id: theme.id,
        image_url: url,
        caption: `A beautiful moment captured perfectly for the ${theme.name} aesthetic.`,
        is_cover: false,
        display_order: 1
      });
    }
  }
  
  console.log(`Inserting ${inserts.length} mock photos...`);
  
  const { data, error } = await supabase
    .from("vendor_images")
    .insert(inserts)
    .select();
    
  if (error) {
    console.error("Failed to insert mock images:", error);
  } else {
    console.log("Successfully inserted mock images!");
  }
}

run();
