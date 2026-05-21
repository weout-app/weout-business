"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Check } from "lucide-react";

const steps = [
  { label: "Datos del negocio", path: "/onboarding/verification" },
  { label: "Ubicación", path: "/onboarding/verification/location" },
  { label: "Verificar negocio", path: "/onboarding/verification/verify" },
  { label: "Afiliación", path: "/onboarding/verification/affiliation" },
  { label: "Descripción", path: "/onboarding/verification/description" },
  { label: "Revisar y enviar", path: "/onboarding/verification/review" },
];

export function VerificationLayout({
  children,
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled = false,
  loading = false,
}: {
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentIdx = steps.findIndex((s) => s.path === pathname);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FBFCFF" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <Link href="/dashboard" className="text-charcoal-900">
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 4L16 24L23.5 4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 16C24 20.4183 28.0294 24 33 24C37.9706 24 42 20.4183 42 16C42 11.5817 37.9706 8 33 8C28.0294 8 24 11.5817 24 16Z" stroke="currentColor" strokeWidth="3.5"/>
          </svg>
        </Link>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
        >
          Guardar y salir
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 flex px-8 pb-24">
        {/* Sidebar stepper */}
        <nav className="w-52 shrink-0 pt-8 pr-8">
          <ul className="space-y-1">
            {steps.map((step, i) => {
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;

              return (
                <li key={step.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isCurrent
                        ? "bg-primary-light/60 font-medium text-charcoal-900"
                        : isCompleted
                        ? "text-charcoal-700"
                        : "text-charcoal-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isCurrent
                          ? "border-2 border-primary text-primary"
                          : isCompleted
                          ? "bg-primary text-white"
                          : "border border-charcoal-200 text-charcoal-300"
                      }`}
                    >
                      {isCompleted ? <Check size={12} /> : i + 1}
                    </div>
                    <span>{step.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-xl pt-8 pl-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur border-t border-charcoal-100">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
          >
            Atrás
          </button>
        ) : (
          <div />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Espera..." : nextLabel}
          </button>
        )}
      </footer>
    </div>
  );
}
