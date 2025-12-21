import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  onEnrollClick: () => void;
  onLoginClick?: () => void;
}

export default function Header({ onEnrollClick, onLoginClick }: HeaderProps) {
  const handleEnrollClick = () => {
    console.log('🔴 [HEADER] "Enroll Now" button clicked');
    onEnrollClick();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-crimson-600 to-prune-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">Medicare Mastery</div>
              <div className="text-xs text-gray-500">Professional Certification Program</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-crimson-600 font-medium transition-colors">
              Features
            </a>
            {onLoginClick && (
              <button
                onClick={onLoginClick}
                className="text-gray-700 hover:text-crimson-600 font-semibold transition-colors"
              >
                Log In
              </button>
            )}
            <button
              onClick={handleEnrollClick}
              className="bg-gradient-to-r from-crimson-600 to-prune-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-crimson-700 hover:to-prune-800 transition-all transform hover:scale-105"
            >
              Enroll Now
            </button>
          </nav>

          <div className="md:hidden flex items-center space-x-3">
            {onLoginClick && (
              <button
                onClick={onLoginClick}
                className="text-gray-700 hover:text-crimson-600 font-semibold text-sm transition-colors"
              >
                Log In
              </button>
            )}
            <button
              onClick={handleEnrollClick}
              className="bg-crimson-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Enroll
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
