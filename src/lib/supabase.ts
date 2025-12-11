import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Read env vars (Vite)
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If not provided, warn but do NOT throw — frontend will fall back to mock when enabled
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables; supabase client disabled. Using mock mode if enabled.');
}

// Export supabase client or null
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;
