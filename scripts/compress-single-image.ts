import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabaseUrl = 'https://tedsezmxctrgghyabjjb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHNlem14Y3RyZ2doeWFiampiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3NjY1NywiZXhwIjoyMDg2ODUyNjU3fQ.uPP06BztLyQWZ1SQBlfQVPoFHWQlxbM5zqw1oilpHI4';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const imageId = 4763;
const vendorId = 222;
const oldPath = 'gallery/vendor-222-img-4763-1778484521953.jpg';
const newPath = 'gallery/vendor-222-img-4763-1778484521953-compressed.jpg';

async function compressAndUpload() {
  console.log('Downloading image...');
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/vendor-assets/${oldPath}`;
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  
  console.log('Compressing image...');
  const compressedBuffer = await sharp(Buffer.from(buffer))
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  
  console.log(`Original: ${buffer.byteLength.toLocaleString()} bytes`);
  console.log(`Compressed: ${compressedBuffer.byteLength.toLocaleString()} bytes`);
  
  if (compressedBuffer.byteLength > 2097152) {
    console.log('Still too large, reducing quality further...');
    const moreCompressed = await sharp(Buffer.from(buffer))
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();
    console.log(`Final: ${moreCompressed.byteLength.toLocaleString()} bytes`);
    
    const { error: uploadError } = await supabase.storage
      .from('vendor-assets')
      .upload(newPath, moreCompressed, { upsert: true });
    
    if (uploadError) throw uploadError;
  } else {
    const { error: uploadError } = await supabase.storage
      .from('vendor-assets')
      .upload(newPath, compressedBuffer, { upsert: true });
    
    if (uploadError) throw uploadError;
  }
  
  const { data: urlData } = supabase.storage.from('vendor-assets').getPublicUrl(newPath);
  const newUrl = urlData.publicUrl;
  
  console.log('Updating database...');
  const { error: updateError } = await supabase
    .from('vendor_images')
    .update({ image_url: newUrl })
    .eq('id', imageId);
  
  if (updateError) throw updateError;
  
  console.log('Deleting old file...');
  await supabase.storage.from('vendor-assets').remove([oldPath]);
  
  console.log('Done!');
  console.log(`New URL: ${newUrl}`);
}

compressAndUpload().catch(console.error);
