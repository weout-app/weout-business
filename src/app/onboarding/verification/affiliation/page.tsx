"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VerificationLayout } from "@/components/verification-layout";

export default function AffiliationPage() {
  const router = useRouter();

  const [isAffiliated, setIsAffiliated] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = sessionStorage.getItem("verification_affiliation");
    if (!saved) return null;
    return JSON.parse(saved).isAffiliated;
  });

  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = sessionStorage.getItem("verification_affiliation");
    return saved ? JSON.parse(saved).name || "" : "";
  });

  function onNext() {
    sessionStorage.setItem(
      "verification_affiliation",
      JSON.stringify({ isAffiliated, name: isAffiliated ? name : "" })
    );
    router.push("/onboarding/verification/description");
  }

  return (
    <VerificationLayout
      onBack={() => router.push("/onboarding/verification/verify")}
      onNext={onNext}
      nextDisabled={isAffiliated === null || (isAffiliated === true && !name.trim())}
    >
      <h1 className="text-2xl font-bold text-charcoal-900">
        Afiliación del negocio
      </h1>
      <p className="mt-2 text-sm text-charcoal-500">
        ¿Tu negocio pertenece a alguna cadena, red o asociación?
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => setIsAffiliated(true)}
          className={`flex-1 rounded-xl border py-4 text-sm font-semibold transition-all ${
            isAffiliated === true
              ? "border-primary bg-primary text-white"
              : "border-charcoal-100 bg-white text-charcoal-500 hover:border-charcoal-300"
          }`}
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => setIsAffiliated(false)}
          className={`flex-1 rounded-xl border py-4 text-sm font-semibold transition-all ${
            isAffiliated === false
              ? "border-primary bg-primary text-white"
              : "border-charcoal-100 bg-white text-charcoal-500 hover:border-charcoal-300"
          }`}
        >
          No
        </button>
      </div>

      {isAffiliated && (
        <div className="mt-5 space-y-2">
          <label className="block text-sm font-medium text-charcoal-900">
            Nombre de la cadena, red o asociación
          </label>
          <input
            className="w-full rounded-xl border border-charcoal-100 bg-white px-4 py-3.5 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="ej. Selina, Colombian Highlands"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}
    </VerificationLayout>
  );
}
