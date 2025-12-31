import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.log('✅ [SUCCESS] Payment completed, redirecting to app');

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          console.log('🔵 [SUCCESS] Redirecting to app');
          const isLocalDev = window.location.hostname === 'localhost';
          window.location.href = isLocalDev ? '/' : import.meta.env.VITE_APP_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

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
            Your payment has been processed. Please log in to access the program.
          </p>

          <div className="bg-gradient-to-br from-crimson-50 to-prune-50 rounded-xl p-6">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Redirecting to login...
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
