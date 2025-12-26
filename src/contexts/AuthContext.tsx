import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Entitlement } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  email: string;
  enrollment_status: 'unpaid' | 'paid';
  program_access: 'locked' | 'unlocked';
  payment_amount: number;
  payment_confirmed_at: string | null;
  payment_method: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  enrollment: Enrollment | null;
  entitlement: Entitlement | null;
  loading: boolean;
  hasActiveAccess: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null; user: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshEnrollment: () => Promise<void>;
  refreshEntitlement: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const hasActiveAccess = entitlement?.has_active_access && entitlement?.payment_verified || false;

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchEnrollment = async (userId: string) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setEnrollment(data);
    }
  };

  const fetchEntitlement = async (userId: string) => {
    const { data, error } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setEntitlement(data);
    } else {
      setEntitlement(null);
    }
  };

  const refreshEnrollment = async () => {
    if (user) {
      await fetchEnrollment(user.id);
    }
  };

  const refreshEntitlement = async () => {
    if (user) {
      await fetchEntitlement(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchEnrollment(session.user.id);
        fetchEntitlement(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          await fetchEnrollment(session.user.id);
          await fetchEntitlement(session.user.id);
        } else {
          setProfile(null);
          setEnrollment(null);
          setEntitlement(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No user returned from signup');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            full_name: fullName,
            phone: phone,
          },
        ]);

      if (profileError) throw profileError;

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: data.user.id,
            email: email,
            enrollment_status: 'unpaid',
            program_access: 'locked',
            payment_amount: 97,
          },
        ]);

      if (enrollmentError && enrollmentError.code !== '23505') {
        throw enrollmentError;
      }

      return { error: null, user: data.user };
    } catch (error) {
      return { error: error as Error, user: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setEnrollment(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        enrollment,
        entitlement,
        loading,
        hasActiveAccess,
        signUp,
        signIn,
        signOut,
        refreshEnrollment,
        refreshEntitlement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
