import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Comparison from './components/Comparison';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import AuthModal from './components/AuthModal';
import EnrollmentModal from './components/EnrollmentModal';
import RoadmapModal from './components/RoadmapModal';
import PaymentRequired from './components/PaymentRequired';
import ProgramDashboard from './components/ProgramDashboard';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';

function AppContent() {
  const { user, hasActiveAccess, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'payment' | 'admin' | 'login' | 'success' | 'cancel'>('landing');

  useEffect(() => {
    const path = window.location.pathname;
    const hostname = window.location.hostname;

    if (path === '/admin') {
      setCurrentView('admin');
      return;
    }

    if (path === '/success') {
      setCurrentView('success');
      return;
    }

    if (path === '/cancel') {
      setCurrentView('cancel');
      return;
    }

    if (loading) return;

    const isLocalDev = hostname === 'localhost';
    const isAppDomain = hostname === 'app.medicaremastery.app' || isLocalDev;
    const isRootRoute = path === '/';

    // For local development, show landing page by default
    if (isLocalDev) {
      if (hasActiveAccess) {
        console.log('✅ [APP] User has active access, showing dashboard');
        setCurrentView('dashboard');
      } else {
        console.log('🔵 [APP] Showing landing page');
        setCurrentView('landing');
      }
      return;
    }

    if (isAppDomain && isRootRoute) {
      if (!user) {
        console.log('🔵 [APP] No user session on app root, showing login');
        setCurrentView('login');
      } else if (hasActiveAccess) {
        console.log('✅ [APP] User has active access, showing dashboard');
        setCurrentView('dashboard');
      } else {
        console.log('❌ [APP] User has no active access, redirecting to site');
        window.location.href = import.meta.env.VITE_SITE_URL;
      }
      return;
    }

    const isProtectedRoute = path === '/dashboard' || path === '/program' || path.startsWith('/program/');
    const isPublicRoute = path === '/' || !isProtectedRoute;

    if (isProtectedRoute) {
      if (!user) {
        window.location.href = import.meta.env.VITE_APP_URL;
      } else if (hasActiveAccess) {
        setCurrentView('dashboard');
      } else {
        window.location.href = import.meta.env.VITE_SITE_URL;
      }
    } else if (isPublicRoute) {
      setCurrentView('landing');
    }
  }, [user, hasActiveAccess, loading]);

  const handleEnrollClick = () => {
    console.log('🟢 [APP] Enroll button clicked, redirecting to app');
    window.location.href = 'https://app.medicaremastery.app/';
  };

  const handleLoginClick = () => {
    console.log('🔵 [APP] Login button clicked, redirecting to app');
    window.location.href = 'https://app.medicaremastery.app/';
  };

  const handleAuthSuccess = () => {
    setIsEnrollmentModalOpen(true);
  };

  const handleLoginSuccess = () => {
    if (hasActiveAccess) {
      console.log('✅ [APP] Login successful with active access, redirecting to dashboard');
      window.location.href = import.meta.env.VITE_APP_URL;
    } else {
      console.log('⚠️ [APP] Login successful but no active access, staying on landing');
      setCurrentView('landing');
    }
  };

  const handleRoadmapClick = () => {
    setIsRoadmapModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-crimson-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return <AdminPanel />;
  }

  if (currentView === 'login') {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'dashboard') {
    return <ProgramDashboard />;
  }

  if (currentView === 'payment') {
    return <PaymentRequired />;
  }

  if (currentView === 'success') {
    return <SuccessPage />;
  }

  if (currentView === 'cancel') {
    return <CancelPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onEnrollClick={handleEnrollClick}
        onLoginClick={handleLoginClick}
      />

      <div className="pt-20">
        <Hero onEnrollClick={handleEnrollClick} onRoadmapClick={handleRoadmapClick} />

        <div id="features">
          <Features />
        </div>

        <Comparison />

        <div id="testimonials">
          <Testimonials />
        </div>

        <div id="faq">
          <FAQ />
        </div>

        <FinalCTA onEnrollClick={handleEnrollClick} />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
      />

      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
      />

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Medicare Mastery</h3>
              <p className="text-sm leading-relaxed">
                The leading Medicare certification program trusted by thousands of professionals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Program</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Curriculum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Certification</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medicare Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@medicaremastery.com</li>
                <li>(555) 123-4567</li>
                <li>Mon-Fri 9am-6pm EST</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Medicare Mastery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
