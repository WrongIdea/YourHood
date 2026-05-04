import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Singleton prevents multiple instances competing for the auth lock during HMR.
// Typed as `any` to avoid incompatible SupabaseClient generic parameters between
// the unparameterised ReturnType<typeof createClient> and the actual instantiation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForSupabase = globalThis as unknown as { supabase: any };

function makeClient() {
  // During SSR prerendering at build time, env vars may be absent.
  // All Supabase calls are in useEffect/event handlers (client-only) so the
  // placeholder is never used to make real requests.
  if (!supabaseUrl || !supabaseKey) {
    return {} as ReturnType<typeof createClient>;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Bypass the Web Lock API — eliminates lock-contention errors caused by
      // HMR creating multiple client instances that fight over the same lock.
      lock: (_name, _acquireTimeout, fn) => fn(),
    },
  });
}

export const supabase = globalForSupabase.supabase ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
