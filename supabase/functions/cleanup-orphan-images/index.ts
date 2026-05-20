// @ts-nocheck
/// <reference types="https://deno.land/x/supabase/functions/_dev_deps.ts" />

import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment configurations (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get input parameters
    const { bucket = 'vendor-assets', dry_run = false, limit = 1000 } = await req.json().catch(() => ({}));

    console.log(`Starting cleanup scan on bucket "${bucket}" (dry_run: ${dry_run}, limit: ${limit})...`);

    // Call our database RPC function to retrieve unreferenced files
    const { data: orphanObjects, error: rpcError } = await supabase
      .rpc('get_orphan_images', { p_bucket_id: bucket });

    if (rpcError) {
      console.error('Error invoking get_orphan_images RPC:', rpcError);
      return new Response(
        JSON.stringify({ error: `Database RPC failed: ${rpcError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orphanObjects || orphanObjects.length === 0) {
      console.log('No orphan images found! Storage is clean.');
      return new Response(
        JSON.stringify({ success: true, message: 'No orphan images found! Storage is clean.', deleted_count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract paths from returned objects
    // The RPC returns rows of object_name (which maps directly to storage o.name)
    const orphanPaths = orphanObjects.map((obj: any) => typeof obj === 'string' ? obj : obj.object_name);

    // Limit the number of deletions in a single run to prevent timeouts
    const toDelete = orphanPaths.slice(0, limit);
    console.log(`Found ${orphanPaths.length} total orphans. Proceeding to process first ${toDelete.length} assets.`);

    if (dry_run) {
      console.log('[Dry Run] Orphan files that would be deleted:', toDelete);
      return new Response(
        JSON.stringify({
          success: true,
          dry_run: true,
          message: `Dry run completed. Found ${orphanPaths.length} total orphan assets. Listed first ${toDelete.length} files.`,
          files: toDelete,
          total_orphans: orphanPaths.length,
          to_delete_count: toDelete.length,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete in chunks of 50 using Storage API
    const chunkSize = 50;
    let deletedCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      console.log(`Deleting chunk ${i / chunkSize + 1} (${chunk.length} items)...`);

      const { data, error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(chunk);

      if (deleteError) {
        console.error('Failed to delete chunk:', deleteError);
        errors.push({ chunk, error: deleteError.message });
      } else {
        deletedCount += chunk.length;
        console.log(`Successfully deleted chunk of ${chunk.length} items.`);
      }
      
      // Small pause between chunks to preserve Deno event loops
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Cleanup run completed. Successfully deleted ${deletedCount} assets.`);

    // 5. Update system_settings with execution logs
    try {
      const { data: configData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "storage_cleanup_schedule")
        .maybeSingle();

      const existingConfig = configData?.value ?? {};
      
      await supabase
        .from("system_settings")
        .upsert({
          key: "storage_cleanup_schedule",
          value: {
            ...existingConfig,
            last_run: {
              timestamp: new Date().toISOString(),
              status: errors.length === 0 ? "success" : "partial_error",
              deleted_count: deletedCount,
              total_orphans_found: orphanPaths.length,
              errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
            },
          },
          updated_at: new Date().toISOString(),
        });
      console.log("Logged cleanup execution stats to database.");
    } catch (dbErr) {
      console.error("Failed to write cleanup logs to system_settings:", dbErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: false,
        deleted_count: deletedCount,
        total_orphans_found: orphanPaths.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Unhandled exception in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown exception occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
