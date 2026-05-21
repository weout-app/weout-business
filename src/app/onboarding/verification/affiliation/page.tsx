"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VerificationStepper } from "@/components/verification-stepper";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Check } from "lucide-react";

const affiliations = [
  { id: "independent", label: "Independiente", description: "No pertenezco a ninguna cadena o red" },
  { id: "chain", label: "Cadena hotelera", description: "Parte de una cadena de hoteles/hosteles" },
  { id: "network", label: "Red de turismo", description: "Miembro de una red o asociación turística" },
  { id: "franchise", label: "Franquicia", description: "Operamos bajo una franquicia" },
  { id: "government", label: "Entidad gubernamental", description: "Asociado a un ente de turismo oficial" },
];

export default function AffiliationPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const saved = sessionStorage.getItem("verification_affiliation");
    return saved ? JSON.parse(saved).type : "";
  });
  const [affiliationName, setAffiliationName] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = sessionStorage.getItem("verification_affiliation");
    return saved ? JSON.parse(saved).name : "";
  });

  function onSubmit() {
    sessionStorage.setItem(
      "verification_affiliation",
      JSON.stringify({ type: selected, name: affiliationName })
    );
    router.push("/onboarding/verification/description");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <VerificationStepper currentStep={4} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-charcoal-900">
          Afiliación del negocio
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          ¿Tu negocio pertenece a alguna cadena, red o asociación?
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {affiliations.map((aff) => (
          <button
            key={aff.id}
            type="button"
            onClick={() => setSelected(aff.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              selected === aff.id
                ? "border-primary bg-primary-light/50"
                : "border-charcoal-200 bg-white hover:border-charcoal-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected === aff.id
                  ? "border-primary bg-primary"
                  : "border-charcoal-200"
              }`}
            >
              {selected === aff.id && <Check size={14} className="text-white" />}
            </div>
            <div>
              <p className="font-medium text-sm text-charcoal-900">
                {aff.label}
              </p>
              <p className="text-xs text-charcoal-500">{aff.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && selected !== "independent" && (
        <div className="mt-4">
          <Input
            label="Nombre de la cadena, red o franquicia"
            placeholder="ej. Selina, Colombian Highlands"
            value={affiliationName}
            onChange={(e) => setAffiliationName(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/onboarding/verification/verify")}
        >
          Atrás
        </Button>
        <Button onClick={onSubmit} disabled={!selected}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
