import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://xtcxafjfldtxzydqesfc.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_MH-8a2gBNcs3KCQdJAwsUA_xPBObXYz';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
).trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-ref')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
