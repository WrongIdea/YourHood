import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Singleton prevents multiple instances competing for the auth lock during HMR
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Bypass the Web Lock API — eliminates lock-contention errors caused by
      // HMR creating multiple client instances that fight over the same lock.
      lock: (_name, _acquireTimeout, fn) => fn(),
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
