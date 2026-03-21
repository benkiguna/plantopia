"use client";

import React from "react";

export function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4];

  return (
    <nav className="flex items-center justify-center gap-3 py-8">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <div className="relative group">
              {/* 1. ATMOSPHERIC GLOW: Only for active step */}
              {isActive && (
                <div className="absolute inset-0 bg-glass-emerald/20 blur-xl rounded-full animate-pulse" />
              )}
              {/* 2. THE GLASS COIN */}
              <div
                className={`
                  relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-700
                  ${
                    isActive
                      ? "bg-glass-emerald/20 border-glass-emerald/50 text-white shadow-[0_0_20px_rgba(74,222,128,0.2)] scale-110"
                      : isCompleted
                        ? "bg-glass-emerald/5 border-glass-emerald/20 text-glass-emerald/60"
                        : "bg-white/[0.03] border-white/10 text-white/10 backdrop-blur-md"
                  }
                  border
                `}
              >
                {/* 3. SPECULAR HIGHLIGHT: The 'Horse' detail */}
                <div className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40 rounded-full" />

                <span className="text-[11px] font-mono font-bold tracking-tighter">
                  {isCompleted ? "✓" : `0${step}`}
                </span>
              </div>
            </div>

            {/* 4. PROGRESS LINE */}
            {index < steps.length - 1 && (
              <div className="w-6 h-[1px] bg-white/5 relative">
                <div
                  className="absolute inset-0 bg-glass-emerald/40 transition-all duration-1000 origin-left"
                  style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
