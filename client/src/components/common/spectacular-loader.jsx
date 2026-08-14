// client/src/components/common/luxury-loader.jsx
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react';

const LuxuryLoader = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('loading'); // loading, transitioning, complete

  useEffect(() => {
    // Smooth progress animation
    const duration = 2500;
    const steps = 60;
    const increment = 100 / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setStage('transitioning'), 200);
          setTimeout(() => setStage('complete'), 800);
          return 100;
        }
        return next;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  if (stage === 'complete') return null;

  return (
    <div className={`fixed inset-0 z-[9999] transition-all duration-700 ${
      stage === 'transitioning' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
    }`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950 to-slate-950">
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        {/* Logo with 3D effect */}
        <div className="relative mb-12 group">
          {/* Glow effect */}
          <div className="absolute inset-0 -m-8 bg-gradient-to-r from-red-500/30 via-rose-500/30 to-red-500/30 rounded-full blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
          
          {/* Rotating rings */}
          <div className="absolute inset-0 -m-12">
            <div className="w-full h-full border-2 border-red-500/30 rounded-full animate-spin-slow" />
          </div>
          <div className="absolute inset-0 -m-10">
            <div className="w-full h-full border-2 border-rose-500/40 rounded-full animate-spin-reverse" />
          </div>
          
          {/* Main logo */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/50 transform transition-transform duration-500 group-hover:scale-110">
            <span className="text-white font-bold text-6xl tracking-wider">R</span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shine" />
            
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>
        </div>

        {/* Brand name with letter animation */}
        <div className="mb-8 overflow-hidden">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-400 tracking-widest">
            {'REKKER'.split('').map((letter, i) => (
              <span
                key={i}
                className="inline-block animate-wave"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-red-200/80 text-xl font-light tracking-wider mb-12 animate-fade-in-up">
          Quality · Trust · Excellence
        </p>

        {/* Progress bar container */}
        <div className="w-full max-w-md space-y-4">
          {/* Circular progress indicator */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Linear progress bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-white/50 animate-pulse" />
            </div>
          </div>

          {/* Loading text with dots animation */}
          <div className="text-center text-red-200/80 text-sm font-medium tracking-wider">
            Loading your experience
            <span className="inline-flex ml-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex space-x-2 mt-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-red-400 to-rose-400 animate-bounce"
              style={{
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-950/50 pointer-events-none" />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) rotate(45deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        .bg-radial-gradient {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default LuxuryLoader;