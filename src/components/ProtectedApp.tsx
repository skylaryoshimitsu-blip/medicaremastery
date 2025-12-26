import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import ProgramDashboard from './ProgramDashboard';

export default function ProtectedApp() {
  const { user, loading, hasActiveAccess, entitlement } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      console.log('❌ [PROTECTED] No user session found, redirecting to login');
      window.location.href = 'https://medicaremastery.app/login';
      return;
    }

    if (!hasActiveAccess) {
      console.log('❌ [PROTECTED] User does not have active access, redirecting to pricing');
      window.location.href = 'https://medicaremastery.app/pricing';
      return;
    }

    console.log('✅ [PROTECTED] User has active access, showing dashboard');
  }, [user, loading, hasActiveAccess]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-prune-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-crimson-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasActiveAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-prune-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-crimson-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <ProgramDashboard />;
}
