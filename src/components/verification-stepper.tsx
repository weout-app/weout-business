"use client";

import { Check } from "lucide-react";

const steps = [
  { label: "Datos", short: "1" },
  { label: "Ubicación", short: "2" },
  { label: "Verificación", short: "3" },
  { label: "Afiliación", short: "4" },
  { label: "Descripción", short: "5" },
  { label: "Revisión", short: "6" },
];

export function VerificationStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const num = i + 1;
        const isCompleted = num < currentStep;
        const isCurrent = num === currentStep;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted || isCurrent
                    ? "bg-primary text-white"
                    : "bg-charcoal-100 text-charcoal-300"
                }`}
              >
                {isCompleted ? <Check size={16} /> : step.short}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  isCurrent
                    ? "font-medium text-charcoal-900"
                    : isCompleted
                    ? "text-primary"
                    : "text-charcoal-300"
                }`}
              >
                {step.label}
              </span>
            </div>
            {num < steps.length && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-18px] ${
                  isCompleted ? "bg-primary" : "bg-charcoal-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
