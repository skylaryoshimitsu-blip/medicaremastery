import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function SuccessPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'verified' | 'timeout'>('processing');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!user) {
      console.error('No user found on success page');
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;

    const checkEntitlement = async () => {
      console.log(`🔍 [SUCCESS] Checking entitlement (attempt ${attempts + 1}/${maxAttempts})`);

      const { data, error } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', user.id)
        .eq('has_active_access', true)
        .eq('payment_verified', true)
        .maybeSingle();

      if (error) {
        console.error('❌ [SUCCESS] Error checking entitlement:', error);
        return false;
      }

      if (data) {
        console.log('✅ [SUCCESS] Entitlement verified!', data);
        setStatus('verified');
        return true;
      }

      attempts++;

      if (attempts >= maxAttempts) {
        console.warn('⏱️ [SUCCESS] Timeout waiting for entitlement');
        setStatus('timeout');
        return true;
      }

      return false;
    };

    const pollInterval = setInterval(async () => {
      const done = await checkEntitlement();
      if (done) {
        clearInterval(pollInterval);
      }
    }, 2000);

    checkEntitlement();

    return () => clearInterval(pollInterval);
  }, [user]);

  useEffect(() => {
    if (status === 'verified') {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            console.log('🔵 [SUCCESS] Redirecting to app.medicaremastery.app');
            window.location.href = 'https://app.medicaremastery.app';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [status]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-prune-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 animate-pulse">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Processing Your Payment
            </h1>

            <p className="text-gray-600 mb-6">
              Please wait while we confirm your payment and set up your account. This usually takes just a few seconds.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Do not close this window or refresh the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-prune-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>

            <p className="text-xl text-gray-600 mb-2">
              Welcome to Medicare Mastery
            </p>

            <p className="text-gray-500 mb-6">
              Your enrollment is complete. You now have full access to the program.
            </p>

            <div className="bg-gradient-to-br from-crimson-50 to-prune-50 rounded-xl p-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Redirecting to your dashboard...
              </p>
              <p className="text-3xl font-bold text-crimson-600">
                {countdown}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-prune-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Processing
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment is still being processed. Please check your email for confirmation, or contact support if you have any questions.
          </p>

          <a
            href="https://app.medicaremastery.app"
            className="inline-block bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            Continue to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
