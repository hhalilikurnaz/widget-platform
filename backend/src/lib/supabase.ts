import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '../config/env.js';

let supabaseAdminClient: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  supabaseAdminClient ??= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
}

export const supabaseAdmin = getSupabaseAdmin();
