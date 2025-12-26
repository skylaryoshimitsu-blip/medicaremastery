import { X, Lock, Shield } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

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

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg text-center">
            <p className="text-sm font-medium">
              Payment is completed automatically during signup. If you need to complete your payment, please check your email for the payment link.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-6">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
