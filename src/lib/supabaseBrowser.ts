import type { SupabaseClient } from "@supabase/supabase-js";

import { createBrowserClient } from "./supabase-ssr";

export function createSupabaseBrowserClient(): SupabaseClient {
  return createBrowserClient();
}
