"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VerificationLayout } from "@/components/verification-layout";
import { useRef } from "react";
import { X, FileText, AlertCircle } from "lucide-react";
import { submitVerification, uploadDocument } from "@/lib/api";

interface AllData {
  details: Record<string, any> | null;
  location: Record<string, string> | null;
  docs: { name: string }[] | null;
  affiliation: { isAffiliated: boolean; name: string } | null;
  description: Record<string, string> | null;
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="px-4 py-3 border-b border-charcoal-100 last:border-b-0">
      <p className="text-xs text-charcoal-500">{label}</p>
      <p className="text-sm font-medium text-charcoal-900 mt-0.5">{value}</p>
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<AllData>({ details: null, location: null, docs: null, affiliation: null, description: null });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      await submitVerification({
        businessName: data.details?.businessName ?? "",
        businessType: data.details?.businessType ?? "",
        street: data.location?.street || data.location?.address,
        apt: data.location?.apt,
        city: data.location?.city,
        state: data.location?.state,
        postalCode: data.location?.postalCode,
        country: data.location?.country,
        lat: data.location?.lat ? Number(data.location.lat) : undefined,
        lng: data.location?.lng ? Number(data.location.lng) : undefined,
        isAffiliated: data.affiliation?.isAffiliated ?? false,
        affiliationName: data.affiliation?.name,
        description: data.description?.description,
      });

      setHasDocuments(!!(data.docs && data.docs.length > 0));
      ["verification_details", "verification_location", "verification_docs", "verification_affiliation", "verification_description"].forEach(
        (key) => sessionStorage.removeItem(key)
      );
      setSubmitting(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      setSubmitting(false);
      console.error("Submit failed:", err.message);
    }
  }

  const businessName = data.details?.businessName || "tu negocio";

  return (
    <VerificationLayout
      onBack={() => router.push("/onboarding/verification/description")}
      onNext={handleSubmit}
      nextLabel="Enviar"
      loading={submitting}
    >
      <h1 className="text-2xl font-bold text-charcoal-900">
        Confirma tu información
      </h1>
      <p className="mt-2 text-sm text-charcoal-500">
        Revisa que toda tu información sea correcta antes de enviar.
      </p>

      {/* Business Details */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-charcoal-900">Datos del negocio</h3>
        <div className="mt-2 rounded-xl border border-charcoal-100 bg-white overflow-hidden">
          <ReadOnlyField label="Nombre del negocio" value={data.details?.businessName} />
          <ReadOnlyField label="Tipo de negocio" value={data.details?.businessType} />
        </div>
      </div>

      {/* Location */}
      {data.location && (
        <div className="mt-2 rounded-xl border border-charcoal-100 bg-white overflow-hidden">
          <ReadOnlyField label="País" value={data.location.country} />
          <ReadOnlyField label="Dirección" value={data.location.street || data.location.address} />
          <ReadOnlyField label="Código postal" value={data.location.postalCode} />
          <ReadOnlyField label="Ciudad" value={data.location.city} />
          <ReadOnlyField label="Departamento / Estado" value={data.location.state} />
        </div>
      )}

      {/* Documents */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal-900">Documentos</h3>
          <span className="text-xs text-charcoal-500">
            {data.docs && data.docs.length > 0 ? `${data.docs.length} subido(s)` : "Sin subir"}
          </span>
        </div>

        {data.docs && data.docs.length > 0 ? (
          <div className="mt-2 space-y-2">
            {data.docs.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-charcoal-100 bg-white">
                <div className="w-10 h-10 rounded-lg bg-charcoal-50 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-charcoal-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-900 truncate">{f.name}</p>
                </div>
                <X size={16} className="text-charcoal-300 shrink-0 cursor-pointer" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Warning */}
            <div className="mt-2 flex items-start gap-2.5 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-800">
                Sube los documentos de tu negocio para verificarlo. Omitir este paso retrasará la publicación de tu negocio en WeOut hasta que la verificación esté completa.
              </p>
            </div>

            {/* Upload zone */}
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => {
              if (!e.target.files) return;
              const newDocs = Array.from(e.target.files).map((f) => ({ name: f.name }));
              const updated = [...(data.docs || []), ...newDocs];
              setData((prev) => ({ ...prev, docs: updated }));
              sessionStorage.setItem("verification_docs", JSON.stringify(updated));
              e.target.value = "";
            }} className="hidden" />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-charcoal-100 py-8 cursor-pointer hover:border-charcoal-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-charcoal-50 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <button type="button" className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors">
                + Subir ahora
              </button>
            </div>
          </>
        )}
      </div>

      {/* Affiliation */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-charcoal-900">Información básica</h3>
        <div className="mt-2 rounded-xl border border-charcoal-100 bg-white overflow-hidden">
          <ReadOnlyField
            label="Afiliación del negocio"
            value={
              data.affiliation?.isAffiliated
                ? data.affiliation.name
                : "No pertenece a ninguna cadena, red o asociación"
            }
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-charcoal-900">Sobre {businessName}</h3>
        <div className="mt-2 rounded-xl border border-charcoal-100 bg-white overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-sm text-charcoal-900">{data.description?.description || "—"}</p>
          </div>
        </div>
      </div>
      {/* Success / Warning modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 text-center">
            {hasDocuments ? (
              <>
                {/* Green check icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path d="M12 20l6 6 12-12" stroke="#219F56" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-charcoal-900">
                  ¡Tu solicitud ha sido recibida!
                </h2>
                <p className="mt-3 text-sm text-charcoal-500">
                  Gracias por enviar tu solicitud. Revisaremos tu información y te contactaremos por correo si necesitamos más detalles.
                </p>
              </>
            ) : (
              <>
                {/* Yellow warning icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-50 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-3 border-yellow-400 flex items-center justify-center">
                      <span className="text-yellow-500 text-2xl font-bold">!</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-charcoal-900">
                  ¡Tu solicitud ha sido recibida!
                </h2>
                <p className="mt-3 text-sm text-charcoal-500">
                  Ten en cuenta que necesitamos validar tus documentos legales antes de que puedas continuar.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-6 w-full rounded-full bg-primary text-white py-3.5 text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </VerificationLayout>
  );
}
