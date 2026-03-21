"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [1, 2, 3, 4];

  return (
    <nav className="relative flex items-center justify-between w-full max-w-sm mx-auto px-4 py-8">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            {/* --- STEP COIN --- */}
            <div className="relative group">
              {/* Volumetric Glow (Only for Active Step) */}
              {isActive && (
                <div
                  className="absolute inset-0 bg-glass-emerald/20 blur-xl rounded-full animate-pulse"
                  style={{ animationDuration: "4s" }}
                />
              )}

              <div
                className={`
                  relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-700 ease-out
                  ${
                    isActive
                      ? "bg-glass-emerald/20 border-glass-emerald/50 text-white shadow-[0_0_25px_rgba(74,222,128,0.25)] scale-110"
                      : isCompleted
                        ? "bg-glass-emerald/5 border-glass-emerald/20 text-glass-emerald/60"
                        : "bg-white/[0.03] border-white/10 text-white/20 backdrop-blur-md"
                  }
                  border
                `}
              >
                {/* Number or Checkmark */}
                <span className="text-[11px] font-mono font-bold tracking-tighter">
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    `0${step}`
                  )}
                </span>

                {/* Specular Highlight (The 1px light catch on the top edge) */}
                <div className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
              </div>
            </div>

            {/* --- CONNECTOR LINE --- */}
            {index < steps.length - 1 && (
              <div className="relative flex-1 h-[1px] mx-2">
                {/* Trace Line */}
                <div className="absolute inset-0 bg-white/5" />
                {/* Progress Fill */}
                <div
                  className="absolute inset-0 bg-glass-emerald/40 transition-all duration-1000 ease-in-out origin-left"
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
