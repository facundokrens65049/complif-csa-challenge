import { createClient } from "@supabase/supabase-js";

export function createDatabaseClient() {
  const url = process.env.NEXT_PUBLIC_DATABASE_URL;
  const key = process.env.NEXT_PUBLIC_DATABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
