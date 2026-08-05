import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div
      className="h-screen overflow-hidden bg-[#F0F9FF] flex flex-col"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
      data-testid="landing-page"
    >
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-[#0284C7]" />
              <span
                className="text-xl font-bold text-[#0F172A]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                OncoSVM AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button
                  data-testid="landing-login-button"
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-md px-6 transition-colors duration-200"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 overflow-hidden px-4 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-16 left-10 w-72 h-72 bg-[#0284C7] rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-10 w-96 h-96 bg-[#10B981] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full py-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
              <Activity className="w-9 h-9 text-[#0284C7]" />
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] mb-3 tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              data-testid="landing-title"
            >
              OncoSVM AI
            </h1>
            <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto mb-5">
              Breast Cancer Classification Using Support Vector Machine
            </p>
            <Link to="/login">
              <Button
                data-testid="hero-start-button"
                size="lg"
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-md px-8 py-5 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                Start Diagnosis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div
              className="bg-white p-5 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow duration-200"
              data-testid="feature-ai"
            >
              <div className="w-10 h-10 bg-[#E0F2FE] rounded-md flex items-center justify-center mb-3">
                <Brain className="w-5 h-5 text-[#0284C7]" />
              </div>
              <h3
                className="text-base font-semibold text-[#0F172A] mb-1"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                AI-Powered Analysis
              </h3>
              <p className="text-[#475569] text-sm leading-snug">
                Trained SVM classifier over full Wisconsin diagnostic feature set.
              </p>
            </div>

            <div
              className="bg-white p-5 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow duration-200"
              data-testid="feature-accuracy"
            >
              <div className="w-10 h-10 bg-[#D1FAE5] rounded-md flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3
                className="text-base font-semibold text-[#0F172A] mb-1"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                98% Accuracy
              </h3>
              <p className="text-[#475569] text-sm leading-snug">
                Model achieves 98.25% accuracy on held-out biopsy samples.
              </p>
            </div>

            <div
              className="bg-white p-5 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow duration-200"
              data-testid="feature-secure"
            >
              <div className="w-10 h-10 bg-[#E0F2FE] rounded-md flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-[#0284C7]" />
              </div>
              <h3
                className="text-base font-semibold text-[#0F172A] mb-1"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Secure & Private
              </h3>
              <p className="text-[#475569] text-sm leading-snug">
                Encrypted sessions and private record storage per clinician.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
