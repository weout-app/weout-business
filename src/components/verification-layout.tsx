"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Check } from "lucide-react";

const steps = [
  { label: "Datos del negocio", short: "Datos", path: "/onboarding/verification" },
  { label: "Ubicación", short: "Ubicación", path: "/onboarding/verification/location" },
  { label: "Verificar negocio", short: "Verificar", path: "/onboarding/verification/verify" },
  { label: "Afiliación", short: "Afiliación", path: "/onboarding/verification/affiliation" },
  { label: "Descripción", short: "Descripción", path: "/onboarding/verification/description" },
  { label: "Revisar y enviar", short: "Revisar", path: "/onboarding/verification/review" },
];

async function saveProgress(router: ReturnType<typeof useRouter>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (!token) {
    router.push("/dashboard");
    return;
  }

  const details = JSON.parse(sessionStorage.getItem("verification_details") || "null");
  const location = JSON.parse(sessionStorage.getItem("verification_location") || "null");
  const affiliation = JSON.parse(sessionStorage.getItem("verification_affiliation") || "null");
  const description = JSON.parse(sessionStorage.getItem("verification_description") || "null");

  // Only save if we have at least business details
  if (details?.businessName) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/v1";
    try {
      await fetch(`${API_URL}/business/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-device-id": localStorage.getItem("weout_device_id") ?? "web",
        },
        body: JSON.stringify({
          businessName: details.businessName ?? "",
          businessType: details.businessType ?? "",
          street: location?.street || location?.address,
          apt: location?.apt,
          city: location?.city,
          state: location?.state,
          postalCode: location?.postalCode,
          country: location?.country,
          lat: location?.lat ? Number(location.lat) : undefined,
          lng: location?.lng ? Number(location.lng) : undefined,
          isAffiliated: affiliation?.isAffiliated ?? false,
          affiliationName: affiliation?.name,
          description: description?.description,
        }),
      });
    } catch {
      // Save failed silently — data stays in sessionStorage
    }
  }

  router.push("/dashboard");
}

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
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <Link href="/dashboard" className="text-charcoal-900">
          <img src="/logo.png" alt="WeOut" className="h-7 sm:h-8" />
        </Link>
        <button
          onClick={() => saveProgress(router)}
          className="px-4 sm:px-5 py-2 rounded-full border border-charcoal-200 text-xs sm:text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
        >
          Guardar y salir
        </button>
      </header>

      {/* Mobile stepper - numbered circles */}
      <div className="lg:hidden px-4 sm:px-8 pb-4 overflow-x-auto">
        <div className="flex items-center min-w-0">
          {steps.map((step, i) => {
            const isCompleted = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isCurrent
                        ? "border-2 border-primary text-primary"
                        : "border border-charcoal-200 text-charcoal-300"
                    }`}
                  >
                    {isCompleted ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`text-[10px] whitespace-nowrap ${isCurrent ? "font-medium text-charcoal-900" : isCompleted ? "text-primary" : "text-charcoal-300"}`}>
                    {step.short}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-1 mt-[-14px] ${isCompleted ? "bg-primary" : "bg-charcoal-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex px-4 sm:px-8 pb-24">
        {/* Sidebar stepper - desktop only */}
        <nav className="hidden lg:block w-52 shrink-0 pt-8 pr-8">
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
        <div className="flex-1 max-w-xl lg:pt-8 lg:pl-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur border-t border-charcoal-100">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 sm:px-6 py-2.5 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
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
            className="px-5 sm:px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Espera..." : nextLabel}
          </button>
        )}
      </footer>
    </div>
  );
}
