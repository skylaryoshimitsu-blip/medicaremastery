import { X, Lock, CreditCard, Shield, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) return null;

  const handleEnroll = async () => {
    console.log('🔵 [ENROLL] Button clicked - Starting enrollment process');

    if (!user) {
      console.error('❌ [ENROLL] No user found - aborting');
      return;
    }

    console.log('🔵 [ENROLL] User authenticated:', user.email);
    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔵 [ENROLL] Creating enrollment record in database...');

      const { error: dbError } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            enrollment_status: 'unpaid',
            program_access: 'locked',
            payment_amount: 97,
          },
        ]);

      if (dbError) {
        if (dbError.code === '23505') {
          console.log('⚠️ [ENROLL] User already enrolled');
          setError('You are already enrolled in this program.');
        } else {
          console.error('❌ [ENROLL] Database error:', dbError);
          throw dbError;
        }
        setIsSubmitting(false);
        return;
      }

      console.log('✅ [ENROLL] Enrollment record created successfully');
      console.log('🔵 [ENROLL] Redirecting to Stripe Payment Link...');

      const stripePaymentUrl = 'https://buy.stripe.com/eVqaERa8Fah48ri99Q8k800';

      setIsRedirecting(true);

      window.open(stripePaymentUrl, '_blank');

      console.log('✅ [ENROLL] Payment link opened in new tab');

      setTimeout(() => {
        setIsRedirecting(false);
        setIsSubmitting(false);
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('❌ [ENROLL] Error during enrollment:', err);
      setError(err.message || 'Something went wrong. Please try again or contact support.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={isRedirecting ? undefined : onClose}></div>

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          {!isRedirecting && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {isRedirecting ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-crimson-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CreditCard className="w-10 h-10 text-crimson-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Opening Payment Page...</h3>
              <p className="text-gray-600 text-lg">
                A new tab has opened with your secure payment page.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                If the tab didn't open, please check your pop-up blocker settings.
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-crimson-100 text-crimson-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <Lock className="w-4 h-4" />
                  <span>Secure Enrollment</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Enrollment</h2>
                <p className="text-gray-600">You're one step away from accessing the program</p>
              </div>

              <div className="bg-gradient-to-br from-crimson-50 to-prune-50 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Medicare Mastery Program</h3>
                    <p className="text-gray-600 text-sm">Complete certification package</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-crimson-600">$97</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-crimson-600 rounded-full"></div>
                    <span>50+ hours of expert training</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-crimson-600 rounded-full"></div>
                    <span>Personal mentor assignment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-crimson-600 rounded-full"></div>
                    <span>Exam support & extended access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-crimson-600 rounded-full"></div>
                    <span>70-day program access</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <button
                onClick={handleEnroll}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment - $97</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-6">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
