"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import { VerificationLayout } from "@/components/verification-layout";
import { Check, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import { uploadDocument, deleteDocument, type BusinessDocument } from "@/lib/api";

interface LocalFile {
  name: string;
  id?: string;
  uploading?: boolean;
  error?: string;
}

export default function VerifyBusinessPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<LocalFile[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = sessionStorage.getItem("verification_docs");
    return saved ? JSON.parse(saved) : [];
  });
  const [dragging, setDragging] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  async function handleUpload(fileList: FileList) {
    const newFiles = Array.from(fileList);
    for (const file of newFiles) {
      const idx = files.length;
      setFiles((prev) => [...prev, { name: file.name, uploading: true }]);

      try {
        const doc = await uploadDocument(file);
        setFiles((prev) =>
          prev.map((f, i) =>
            i === idx || (f.name === file.name && f.uploading)
              ? { name: doc.fileName, id: doc.id }
              : f
          )
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === idx || (f.name === file.name && f.uploading)
              ? { name: file.name, error: err.message }
              : f
          )
        );
      }
    }
    // Sync to sessionStorage
    setFiles((prev) => {
      sessionStorage.setItem("verification_docs", JSON.stringify(prev.filter((f) => f.id)));
      return prev;
    });
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleUpload(e.target.files);
    e.target.value = "";
  }

  async function removeFile(index: number) {
    const file = files[index];
    if (file.id) {
      try { await deleteDocument(file.id); } catch {}
    }
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      sessionStorage.setItem("verification_docs", JSON.stringify(updated.filter((f) => f.id)));
      return updated;
    });
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function onNext() {
    const uploaded = files.filter((f) => f.id);
    if (uploaded.length === 0) {
      setShowSkipModal(true);
      return;
    }
    sessionStorage.setItem("verification_docs", JSON.stringify(uploaded));
    router.push("/onboarding/verification/affiliation");
  }

  function confirmSkip() {
    sessionStorage.setItem("verification_docs", JSON.stringify([]));
    setShowSkipModal(false);
    router.push("/onboarding/verification/affiliation");
  }

  return (
    <VerificationLayout
      onBack={() => router.push("/onboarding/verification/location")}
      onNext={onNext}
      nextLabel="Continuar"
    >
      <h1 className="text-2xl font-bold text-charcoal-900">
        Verifica tu negocio
      </h1>
      <p className="mt-2 text-sm text-charcoal-500">
        Sube tu <span className="font-semibold text-charcoal-900">Registro de negocio</span> y{" "}
        <span className="font-semibold text-charcoal-900">Comprobante de dirección</span> de
        cualquier fuente para ayudarnos a verificar tu negocio.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Check size={18} className="text-primary" />
            <h3 className="font-semibold text-sm text-primary">Registro de negocio</h3>
          </div>
          <p className="mt-1 ml-[26px] text-xs text-charcoal-500">
            Registro de negocio o permiso de tu ciudad como prueba de que puedes operar como negocio desde esta dirección.
          </p>
          <p className="mt-1 ml-[26px] text-xs text-charcoal-700 underline cursor-pointer">
            Haz clic aquí para ver los documentos requeridos en tu país.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Check size={18} className="text-primary" />
            <h3 className="font-semibold text-sm text-primary">Comprobante de dirección</h3>
          </div>
          <p className="mt-1 ml-[26px] text-xs text-charcoal-500">
            Recibo de servicios (gas, electricidad, agua), documentos fiscales, documentos gubernamentales, etc.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2.5 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-800">
          Puedes omitir este paso, pero tu negocio no se publicará en WeOut hasta que verifiquemos al menos uno de estos documentos.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-charcoal-900">Sube tus documentos</h2>

        {files.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-charcoal-700 bg-charcoal-50 rounded-lg px-3 py-2">
                {f.uploading ? (
                  <Loader2 size={14} className="text-primary animate-spin shrink-0" />
                ) : (
                  <FileText size={14} className="text-charcoal-400 shrink-0" />
                )}
                <span className="truncate flex-1">{f.name}</span>
                {f.error && <span className="text-xs text-error shrink-0">{f.error}</span>}
                {!f.uploading && (
                  <button type="button" onClick={() => removeFile(i)} className="text-charcoal-300 hover:text-error shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleFileSelect} className="hidden" />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 cursor-pointer transition-colors ${
            dragging ? "border-primary bg-primary-light/30" : "border-charcoal-100 hover:border-charcoal-300"
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-charcoal-50 flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
              <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm text-charcoal-500">
            Arrastra archivos aquí o{" "}
            <span className="text-charcoal-900 font-medium underline">elige un archivo</span>
          </p>
        </div>
      </div>

      {/* Skip modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect x="8" y="12" width="48" height="52" rx="8" stroke="#E5A000" strokeWidth="3" fill="none"/>
                  <line x1="22" y1="40" x2="42" y2="40" stroke="#E5A000" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="22" y1="48" x2="36" y2="48" stroke="#E5A000" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">!</span>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-charcoal-900">¿Estás seguro de que quieres continuar?</h2>
            <p className="mt-3 text-sm text-charcoal-500">
              No has subido ningún documento. Al continuar, necesitarás subir un{" "}
              <span className="text-primary font-medium">comprobante de dirección y/o registro de negocio</span>{" "}
              más adelante para completar tu solicitud.
            </p>
            <button type="button" onClick={confirmSkip} className="mt-6 w-full rounded-full bg-primary text-white py-3.5 text-sm font-semibold hover:bg-primary-hover transition-colors">
              Continuar
            </button>
            <button type="button" onClick={() => setShowSkipModal(false)} className="mt-3 w-full text-sm font-semibold text-charcoal-900">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </VerificationLayout>
  );
}
