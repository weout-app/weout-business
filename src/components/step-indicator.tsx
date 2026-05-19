import { Check } from "lucide-react";

const steps = ["Datos", "Contraseña", "Verificar"];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-initial">
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCompleted || isCurrent
                    ? "bg-primary text-white"
                    : "bg-charcoal-100 text-charcoal-300"
                }`}
              >
                {isCompleted ? <Check size={14} /> : step}
              </div>
              <span
                className={`text-xs ${
                  isCurrent
                    ? "font-medium text-charcoal-900"
                    : "text-charcoal-300"
                }`}
              >
                {label}
              </span>
            </div>
            {step < steps.length && (
              <div
                className={`flex-1 h-px ${
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
