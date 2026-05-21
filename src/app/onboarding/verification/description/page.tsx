"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VerificationLayout } from "@/components/verification-layout";

export default function DescriptionPage() {
  const router = useRouter();
  const [description, setDescription] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = sessionStorage.getItem("verification_description");
    return saved ? JSON.parse(saved).description || "" : "";
  });

  function onNext() {
    sessionStorage.setItem("verification_description", JSON.stringify({ description }));
    router.push("/onboarding/verification/review");
  }

  return (
    <VerificationLayout
      onBack={() => router.push("/onboarding/verification/affiliation")}
      onNext={onNext}
      nextDisabled={description.trim().length < 10}
    >
      <h1 className="text-2xl font-bold text-charcoal-900">Descripción</h1>
      <p className="mt-2 text-sm text-charcoal-500">
        Describe tu negocio para que los viajeros sepan qué ofreces.
      </p>

      <div className="mt-8 space-y-2">
        <label className="block text-sm font-medium text-charcoal-900">
          Descripción
        </label>
        <textarea
          className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3.5 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[180px] resize-y"
          placeholder="Cuéntanos sobre tu negocio, qué experiencias ofreces, qué hace tu lugar especial..."
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end">
          <span className="text-xs text-charcoal-300">{description.length}/1000</span>
        </div>
      </div>
    </VerificationLayout>
  );
}
