"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getVerificationStatus, type VerificationResult } from "@/lib/api";
import {
  Plus,
  Globe,
  User,
  Clock,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Eye,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const biz = localStorage.getItem("business");
    if (!biz) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(biz);
    setBusinessName(parsed.contactName || parsed.businessName || "Socio");

    getVerificationStatus()
      .then((v) => {
        if (!v) {
          // No verification yet — redirect to onboarding
          router.push("/onboarding/verification");
          return;
        }
        setVerification(v);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    Pending: {
      label: "Pendiente",
      icon: <Clock size={14} />,
      className: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    Approved: {
      label: "Aprobado",
      icon: <CheckCircle size={14} />,
      className: "bg-green-50 text-green-600 border-green-200",
    },
    Rejected: {
      label: "Rechazado",
      icon: <Loader2 size={14} />,
      className: "bg-red-50 text-red-500 border-red-200",
    },
  };

  const status = verification ? statusConfig[verification.status] || statusConfig.Pending : statusConfig.Pending;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-charcoal-100">
        <Link href="/dashboard">
          <img src="/logo.png" alt="WeOut" className="h-7 sm:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
            <Globe size={16} /> Español
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
            <User size={16} /> <span className="hidden sm:inline">Mi cuenta</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12 max-w-6xl mx-auto w-full">
        {/* Greeting */}
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
          ¡Hola, {businessName}!
        </h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Administra y lleva un registro de todas tus publicaciones aquí.
        </p>

        {/* Listings header */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal-900">Mis publicaciones</h2>
          <button
            onClick={() => router.push("/onboarding/verification")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} /> Nueva publicación
          </button>
        </div>

        {/* Table header - desktop */}
        <div className="hidden sm:grid grid-cols-12 gap-4 mt-6 px-5 text-xs text-charcoal-500">
          <div className="col-span-4">Nombre del negocio</div>
          <div className="col-span-3">Tipo de negocio</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-3"></div>
        </div>

        {/* Listings */}
        <div className="mt-3 space-y-3">
          {verification && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center p-4 sm:px-5 sm:py-4 rounded-xl border border-charcoal-100 bg-white">
              {/* Business Name */}
              <div className="sm:col-span-4">
                <p className="text-xs text-charcoal-500 sm:hidden mb-0.5">Nombre</p>
                <p className="text-sm font-medium text-charcoal-900">
                  {verification.businessName || businessName}
                </p>
              </div>

              {/* Business Type */}
              <div className="sm:col-span-3">
                <p className="text-xs text-charcoal-500 sm:hidden mb-0.5">Tipo</p>
                <span className="inline-block px-3 py-1 rounded-full bg-charcoal-50 text-xs font-medium text-charcoal-700">
                  {verification.businessType || "—"}
                </span>
              </div>

              {/* Status */}
              <div className="sm:col-span-2">
                <p className="text-xs text-charcoal-500 sm:hidden mb-0.5">Estado</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                  {status.icon} {status.label}
                </span>
              </div>

              {/* Actions */}
              <div className="sm:col-span-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => router.push("/onboarding")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-charcoal-200 text-xs font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                >
                  <Eye size={14} /> Ver detalles
                </button>
                <button className="p-1.5 rounded-lg hover:bg-charcoal-50 transition-colors text-charcoal-400">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Empty state if no verification */}
          {!verification && (
            <div className="text-center py-16 text-charcoal-300">
              <p className="text-sm">Aún no tienes publicaciones.</p>
              <button
                onClick={() => router.push("/onboarding/verification")}
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                Crear tu primera publicación
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
