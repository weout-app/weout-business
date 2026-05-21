"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getVerificationStatus } from "@/lib/api";
import {
  CheckCircle,
  Clock,
  Sparkles,
  Rocket,
  ChevronRight,
  Upload,
  Globe,
  User,
} from "lucide-react";

type DashboardState = "not_started" | "submitted_with_docs" | "submitted_no_docs" | "approved";

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>("not_started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const biz = localStorage.getItem("business");
    if (!biz) {
      router.push("/login");
      return;
    }

    getVerificationStatus()
      .then((v) => {
        if (!v) {
          setState("not_started");
        } else if (v.status === "Approved") {
          setState("approved");
        } else if (v.documents && v.documents.length > 0) {
          setState("submitted_with_docs");
        } else {
          setState("submitted_no_docs");
        }
      })
      .catch(() => setState("not_started"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBFCFF" }}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not started, show old onboarding prompt
  if (state === "not_started") {
    return <NotStartedDashboard router={router} />;
  }

  // If submitted (with or without docs), show the 4-step horizontal view
  return <SubmittedDashboard state={state} router={router} />;
}

function NotStartedDashboard({ router }: { router: ReturnType<typeof useRouter> }) {
  const biz = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("business") || "{}") : {};

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FBFCFF" }}>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-16">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            ¡Hola, {biz.businessName || "Socio"}!
          </h1>
          <p className="mt-2 text-sm text-charcoal-500">
            Completa la verificación para empezar a publicar experiencias en WeOut.
          </p>
          <button
            onClick={() => router.push("/onboarding/verification")}
            className="mt-8 px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Comenzar verificación
          </button>
        </div>
      </main>
    </div>
  );
}

function SubmittedDashboard({ state, router }: { state: DashboardState; router: ReturnType<typeof useRouter> }) {
  const isStep1Done = true;
  const isStep2Active = state === "submitted_with_docs" || state === "submitted_no_docs";
  const missingDocs = state === "submitted_no_docs";
  const isApproved = state === "approved";

  const steps = [
    {
      title: "Enviar verificación",
      description: "Sube los datos de tu negocio para que podamos verificar tu cuenta.",
      icon: <CheckCircle size={28} className="text-primary" />,
      done: isStep1Done,
      active: false,
    },
    {
      title: "WeOut revisará tu solicitud",
      description: "Revisaremos tus documentos en 24–72 horas (lun–vie) y te enviaremos los próximos pasos.",
      icon: isApproved
        ? <CheckCircle size={28} className="text-primary" />
        : <Clock size={28} className="text-primary" />,
      done: isApproved,
      active: isStep2Active && !isApproved,
    },
    {
      title: "Crea tu primera actividad",
      description: "Agrega un título, fecha y hora, punto de encuentro, capacidad, fotos y reglas.",
      icon: <Sparkles size={28} />,
      done: false,
      active: false,
      actionLabel: "Crear actividad",
      locked: !isApproved,
    },
    {
      title: "Publica y gestiona inscripciones",
      description: "Comparte tu link/QR, rastrea inscripciones y chatea con asistentes en Mensajes.",
      icon: <Rocket size={28} />,
      done: false,
      active: false,
      locked: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FBFCFF" }}>
      <Header />

      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            Empieza a publicar tus actividades
          </h1>
          <p className="mt-2 text-sm text-charcoal-500">
            Sigue esta guía paso a paso para verificarte y publicar tu primera actividad.
          </p>
        </div>

        {/* Steps - horizontal on desktop, vertical on mobile */}
        <div className="mt-10 flex flex-col lg:flex-row items-stretch justify-center gap-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col lg:flex-row items-center flex-1">
              {/* Card */}
              <div
                className={`w-full rounded-2xl p-5 sm:p-6 text-center transition-all ${
                  step.active
                    ? "bg-white shadow-lg border border-charcoal-100 scale-[1.02]"
                    : step.done
                    ? "bg-white border border-charcoal-100"
                    : "bg-charcoal-50/50 border border-charcoal-100"
                } ${step.locked ? "opacity-50" : ""}`}
              >
                {/* Icon */}
                <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                  step.done
                    ? "bg-primary-light"
                    : step.active
                    ? "bg-primary-light"
                    : "bg-charcoal-50"
                }`}>
                  <span className={step.done || step.active ? "text-primary" : "text-charcoal-300"}>
                    {step.icon}
                  </span>
                </div>

                <h3 className={`font-semibold text-sm ${step.locked ? "text-charcoal-300" : "text-charcoal-900"}`}>
                  {step.title}
                </h3>
                <p className={`mt-1.5 text-xs leading-relaxed ${step.locked ? "text-charcoal-200" : "text-charcoal-500"}`}>
                  {step.description}
                </p>

                {/* Upload Documents button for missing docs */}
                {step.active && missingDocs && (
                  <button
                    onClick={() => router.push("/onboarding/verification/verify")}
                    className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
                  >
                    <Upload size={14} />
                    Subir documentos
                  </button>
                )}

                {/* Create Activity button */}
                {step.actionLabel && (
                  <button
                    disabled={step.locked}
                    className="mt-4 px-5 py-2 rounded-full border border-charcoal-200 text-xs font-medium text-charcoal-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {step.actionLabel}
                  </button>
                )}
              </div>

              {/* Arrow between cards */}
              {i < steps.length - 1 && (
                <>
                  <ChevronRight size={20} className="hidden lg:block text-charcoal-200 mx-2 shrink-0" />
                  <ChevronRight size={20} className="lg:hidden text-charcoal-200 my-1 rotate-90" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Back to dashboard */}
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-2.5 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
          >
            Volver al dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
      <Link href="/dashboard">
        <img src="/logo.png" alt="WeOut" className="h-7 sm:h-8" />
      </Link>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex items-center gap-1.5 text-sm text-charcoal-700">
          <Globe size={16} />
          Español
        </button>
        <button className="flex items-center gap-1.5 text-sm text-charcoal-700">
          <User size={16} />
          <span className="hidden sm:inline">Mi cuenta</span>
        </button>
      </div>
    </header>
  );
}
