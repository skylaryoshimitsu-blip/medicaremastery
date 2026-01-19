import { Clock, TrendingUp, Award } from 'lucide-react';

interface FinalCTAProps {
  onEnrollClick: () => void;
}

export default function FinalCTA({ onEnrollClick }: FinalCTAProps) {
  const handleClick = () => {
    console.log('🟠 [FINAL CTA] "Launch My New Career" button clicked');
    onEnrollClick();
  };

  return (
    <section className="py-20 bg-gradient-to-r from-crimson-600 via-crimson-700 to-prune-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Ready to Transform Your Career?
        </h2>

        <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join successful Medicare agents who started exactly where you are now.
          The only difference? They took action.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleClick}
            className="bg-white text-crimson-700 px-10 py-5 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl"
          >
            Launch My New Career
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Award className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Complete</div>
            <div className="text-sm text-gray-200">Comprehensive Curriculum</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <TrendingUp className="w-10 h-10 text-green-300 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">Career</div>
            <div className="text-sm text-gray-200">Job Placement Support</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Clock className="w-10 h-10 text-blue-300 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">44 Days</div>
            <div className="text-sm text-gray-200">Average Time to Certified</div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-200">
          <p className="mb-2">70-Day Program Access • Expert Mentorship • Job Placement Support</p>
          <p>Questions? Email support@medicaremastery.com or call (555) 123-4567</p>
        </div>
      </div>
    </section>
  );
}
