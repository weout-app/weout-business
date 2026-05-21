"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VerificationStepper } from "@/components/verification-stepper";
import { Button } from "@/components/button";
import {
  Building2,
  MapPin,
  FileCheck,
  Users,
  FileText,
  Pencil,
} from "lucide-react";

interface SectionData {
  details: Record<string, string> | null;
  location: Record<string, string> | null;
  docs: { name: string; type: string }[] | null;
  affiliation: { type: string; name: string } | null;
  description: Record<string, string> | null;
}

function ReviewSection({
  icon,
  title,
  editHref,
  children,
  router,
}: {
  icon: React.ReactNode;
  title: string;
  editHref: string;
  children: React.ReactNode;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="rounded-xl border border-charcoal-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-charcoal-50/50 border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h3 className="font-semibold text-sm text-charcoal-900">{title}</h3>
        </div>
        <button
          onClick={() => router.push(editHref)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
        >
          <Pencil size={12} />
          Editar
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-charcoal-700 space-y-1">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-charcoal-500">{label}:</span> {value}
    </p>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<SectionData>({
    details: null,
    location: null,
    docs: null,
    affiliation: null,
    description: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setData({
      details: JSON.parse(sessionStorage.getItem("verification_details") || "null"),
      location: JSON.parse(sessionStorage.getItem("verification_location") || "null"),
      docs: JSON.parse(sessionStorage.getItem("verification_docs") || "null"),
      affiliation: JSON.parse(sessionStorage.getItem("verification_affiliation") || "null"),
      description: JSON.parse(sessionStorage.getItem("verification_description") || "null"),
    });
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    // TODO: send all verification data to backend
    console.log("Submitting verification:", data);

    // Clear session storage
    ["verification_details", "verification_location", "verification_docs", "verification_affiliation", "verification_description"].forEach(
      (key) => sessionStorage.removeItem(key)
    );

    // Go back to dashboard
    router.push("/dashboard");
  }

  const affiliationLabels: Record<string, string> = {
    independent: "Independiente",
    chain: "Cadena hotelera",
    network: "Red de turismo",
    franchise: "Franquicia",
    government: "Entidad gubernamental",
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <VerificationStepper currentStep={6} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-charcoal-900">
          Revisar y enviar
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Revisa tu información antes de enviar la solicitud de verificación.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {/* Business Details */}
        <ReviewSection
          icon={<Building2 size={16} />}
          title="Datos del negocio"
          editHref="/onboarding/verification"
          router={router}
        >
          <Field label="Nombre" value={data.details?.businessName} />
          <Field label="Tipo" value={data.details?.businessType} />
          <Field label="Contacto" value={data.details?.contactName} />
          <Field label="Email" value={data.details?.email} />
          <Field label="Teléfono" value={data.details?.phone} />
          <Field label="Sitio web" value={data.details?.website} />
        </ReviewSection>

        {/* Location */}
        <ReviewSection
          icon={<MapPin size={16} />}
          title="Ubicación"
          editHref="/onboarding/verification/location"
          router={router}
        >
          <Field label="Dirección" value={data.location?.address} />
          <Field label="Ciudad" value={data.location?.city} />
          <Field label="Departamento" value={data.location?.state} />
          <Field label="País" value={data.location?.country} />
        </ReviewSection>

        {/* Documents */}
        <ReviewSection
          icon={<FileCheck size={16} />}
          title="Documentos"
          editHref="/onboarding/verification/verify"
          router={router}
        >
          {data.docs && data.docs.length > 0 ? (
            <p>{data.docs.length} archivo(s) subido(s)</p>
          ) : (
            <p className="text-charcoal-300">Ningún documento subido</p>
          )}
        </ReviewSection>

        {/* Affiliation */}
        <ReviewSection
          icon={<Users size={16} />}
          title="Afiliación"
          editHref="/onboarding/verification/affiliation"
          router={router}
        >
          <Field
            label="Tipo"
            value={affiliationLabels[data.affiliation?.type ?? ""] ?? data.affiliation?.type}
          />
          {data.affiliation?.name && (
            <Field label="Nombre" value={data.affiliation.name} />
          )}
        </ReviewSection>

        {/* Description */}
        <ReviewSection
          icon={<FileText size={16} />}
          title="Descripción"
          editHref="/onboarding/verification/description"
          router={router}
        >
          <Field label="Corta" value={data.description?.shortDescription} />
          {data.description?.fullDescription && (
            <p className="mt-1 text-charcoal-500 text-xs line-clamp-3">
              {data.description.fullDescription}
            </p>
          )}
          <Field label="Idiomas" value={data.description?.languages} />
          <Field label="Especialidades" value={data.description?.specialties} />
        </ReviewSection>
      </div>

      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/onboarding/verification/description")}
        >
          Atrás
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          Enviar solicitud
        </Button>
      </div>
    </div>
  );
}
