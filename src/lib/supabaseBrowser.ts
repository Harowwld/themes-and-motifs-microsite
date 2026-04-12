import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, expires: number) {
  if (typeof document === "undefined") return;
  const d = new Date(expires);
  document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/;SameSite=lax";
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

export function createSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key: string) => {
          const prefix = "sb-";
          const cookieName = key.startsWith(prefix) ? key : prefix + key.split("-")[0] + "-auth";
          return Promise.resolve(getCookie(cookieName));
        },
        setItem: (key: string, value: string) => {
          const prefix = "sb-";
          const cookieName = key.startsWith(prefix) ? key : prefix + key.split("-")[0] + "-auth";
          const { data } = JSON.parse(value);
          if (data?.expires_at) {
            const expires = data.expires_at * 1000;
            setCookie(cookieName, value, expires);
          } else {
            const oneWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
            setCookie(cookieName, value, oneWeek);
          }
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          const prefix = "sb-";
          const cookieName = key.startsWith(prefix) ? key : prefix + key.split("-")[0] + "-auth";
          deleteCookie(cookieName);
          return Promise.resolve();
        },
      },
    },
  });
}
