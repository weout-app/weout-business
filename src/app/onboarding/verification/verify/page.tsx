"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VerificationStepper } from "@/components/verification-stepper";
import { Button } from "@/components/button";
import { Upload, FileText, Image, X } from "lucide-react";

type DocType = "business_license" | "tax_id" | "photos";

interface UploadedFile {
  name: string;
  type: DocType;
}

export default function VerifyBusinessPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  function handleFileSelect(type: DocType, e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles = Array.from(selected).map((f) => ({
      name: f.name,
      type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit() {
    sessionStorage.setItem("verification_docs", JSON.stringify(files));
    router.push("/onboarding/verification/affiliation");
  }

  const uploadSections: { type: DocType; label: string; description: string; icon: React.ReactNode; accept: string }[] = [
    {
      type: "business_license",
      label: "Licencia o registro de negocio",
      description: "Cámara de Comercio, RUT, o documento equivalente",
      icon: <FileText size={20} />,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      type: "tax_id",
      label: "Identificación fiscal",
      description: "NIT, RFC, o documento tributario",
      icon: <FileText size={20} />,
      accept: ".pdf,.jpg,.jpeg,.png",
    },
    {
      type: "photos",
      label: "Fotos del negocio",
      description: "Fachada, interior, actividades (mín. 2 fotos)",
      icon: <Image size={20} />,
      accept: ".jpg,.jpeg,.png,.webp",
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <VerificationStepper currentStep={3} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-charcoal-900">
          Verifica tu negocio
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Sube los documentos necesarios para verificar tu negocio.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {uploadSections.map((section) => {
          const sectionFiles = files.filter((f) => f.type === section.type);
          return (
            <div key={section.type} className="space-y-2">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-charcoal-200 bg-white">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-charcoal-900">
                    {section.label}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {section.description}
                  </p>

                  {/* Uploaded files */}
                  {sectionFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {sectionFiles.map((f, i) => {
                        const globalIdx = files.findIndex(
                          (file) => file === f
                        );
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-charcoal-700 bg-charcoal-50 rounded-md px-2 py-1"
                          >
                            <span className="truncate flex-1">{f.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(globalIdx)}
                              className="text-charcoal-300 hover:text-error"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <label className="shrink-0 cursor-pointer">
                  <input
                    type="file"
                    accept={section.accept}
                    multiple={section.type === "photos"}
                    onChange={(e) => handleFileSelect(section.type, e)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary-light transition-colors">
                    <Upload size={14} />
                    Subir
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/onboarding/verification/location")}
        >
          Atrás
        </Button>
        <Button onClick={onSubmit}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
