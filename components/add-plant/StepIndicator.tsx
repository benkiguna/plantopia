"use client";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

const steps = [
  { num: 1, label: "Photo" },
  { num: 2, label: "Identify" },
  { num: 3, label: "Light" },
  { num: 4, label: "Name" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => (
        <div key={step.num} className="flex items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              transition-all duration-300
              ${
                step.num < currentStep
                  ? "bg-green text-cream"
                  : step.num === currentStep
                  ? "bg-green text-cream ring-4 ring-green/20"
                  : "bg-forest/10 text-forest/40"
              }
            `}
          >
            {step.num < currentStep ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              step.num
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
                w-8 h-0.5 mx-1 transition-colors duration-300
                ${step.num < currentStep ? "bg-green" : "bg-forest/10"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
