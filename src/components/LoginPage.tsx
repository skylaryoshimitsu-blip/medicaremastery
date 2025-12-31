import { Lock, Mail, GraduationCap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onSuccess?: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) throw signInError;

      console.log('✅ [LOGIN] Sign in successful, checking entitlement...');

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No user found after login');
      }

      const { data: entitlement, error: entitlementError } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (entitlementError) {
        console.error('❌ [LOGIN] Error fetching entitlement:', entitlementError);
        throw new Error('Failed to check access status');
      }

      const isLocalDev = window.location.hostname === 'localhost';

      if (entitlement && entitlement.has_active_access && entitlement.payment_verified) {
        console.log('✅ [LOGIN] User has active access, redirecting to dashboard');
        if (isLocalDev) {
          window.location.reload(); // Reload to show dashboard view
        } else {
          window.location.href = import.meta.env.VITE_APP_URL;
        }
      } else {
        console.log('❌ [LOGIN] User does not have active access');
        if (isLocalDev) {
          window.location.reload(); // Reload to show landing view
        } else {
          window.location.href = import.meta.env.VITE_SITE_URL;
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-prune-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-crimson-600 to-prune-700 rounded-xl mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to access your Medicare Mastery program
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            Don't have an account?
          </p>
          <a
            href={import.meta.env.VITE_SITE_URL}
            className="text-crimson-600 hover:text-crimson-700 font-semibold text-sm"
          >
            Enroll in Medicare Mastery
          </a>
        </div>

        <div className="mt-6 text-center">
          <a
            href={import.meta.env.VITE_SITE_URL}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
