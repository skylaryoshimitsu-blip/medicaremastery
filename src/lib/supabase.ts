import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storageKey: 'medicare-mastery-auth',
  }
});

export interface Enrollment {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_amount: number;
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  has_active_access: boolean;
  payment_verified: boolean;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}
