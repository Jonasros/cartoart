/**
 * Supabase service client with admin privileges
 * Uses the service role key to bypass Row Level Security (RLS)
 *
 * IMPORTANT: Only use this for server-side operations that need to bypass RLS,
 * such as webhook handlers or admin operations.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SUPABASE_URL, getRequiredEnv } from '@/lib/utils/env';

/**
 * Create a Supabase client with service role privileges
 * This client bypasses RLS and should only be used server-side
 */
export function createServiceClient() {
  const url = SUPABASE_URL || getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
