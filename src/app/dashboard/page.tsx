"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding-layout";
import {
  ShieldCheck,
  Search,
  Sparkles,
  Rocket,
  ChevronRight,
  Lock,
  CheckCircle2,
} from "lucide-react";

type StepStatus = "current" | "locked" | "completed";

interface OnboardingStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StepStatus;
  href?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const biz = localStorage.getItem("business");
    if (!biz) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(biz);
    setBusinessName(parsed.businessName || "Socio");
  }, [router]);

  const steps: OnboardingStep[] = [
    {
      id: "verification",
      number: 1,
      title: "Enviar verificación",
      description:
        "Completa los datos de tu negocio y envía tu solicitud de verificación.",
      icon: <ShieldCheck size={24} />,
      status: "current",
      href: "/onboarding/verification",
    },
    {
      id: "review",
      number: 2,
      title: "WeOut revisará tu solicitud",
      description:
        "Nuestro equipo revisará tu información. Te notificaremos cuando esté lista.",
      icon: <Search size={24} />,
      status: "locked",
    },
    {
      id: "first-activity",
      number: 3,
      title: "Crea tu primera actividad",
      description:
        "Publica tu primera experiencia para que los viajeros la descubran.",
      icon: <Sparkles size={24} />,
      status: "locked",
    },
    {
      id: "go-live",
      number: 4,
      title: "Publica y gestiona inscripciones",
      description:
        "Tu actividad estará visible en la app. Gestiona las reservas desde aquí.",
      icon: <Rocket size={24} />,
      status: "locked",
    },
  ];

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-charcoal-900">
            ¡Hola, {businessName}!
          </h1>
          <p className="mt-2 text-charcoal-500">
            Completa estos pasos para empezar a publicar experiencias en WeOut.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`absolute left-[27px] top-[60px] w-0.5 h-6 ${
                    step.status === "completed"
                      ? "bg-primary"
                      : "bg-charcoal-100"
                  }`}
                />
              )}

              <button
                onClick={() => step.href && step.status !== "locked" && router.push(step.href)}
                disabled={step.status === "locked"}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
                  step.status === "current"
                    ? "border-primary bg-primary-light/50 hover:bg-primary-light cursor-pointer"
                    : step.status === "completed"
                    ? "border-primary/30 bg-primary-light/20 cursor-pointer hover:bg-primary-light/40"
                    : "border-charcoal-100 bg-charcoal-50/50 cursor-not-allowed opacity-60"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === "current"
                      ? "bg-primary text-white"
                      : step.status === "completed"
                      ? "bg-primary/20 text-primary"
                      : "bg-charcoal-100 text-charcoal-300"
                  }`}
                >
                  {step.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        step.status === "current"
                          ? "bg-primary text-white"
                          : step.status === "completed"
                          ? "bg-primary/20 text-primary"
                          : "bg-charcoal-100 text-charcoal-300"
                      }`}
                    >
                      Paso {step.number}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold text-charcoal-900">
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-charcoal-500">
                    {step.description}
                  </p>
                </div>

                {/* Status icon */}
                <div className="shrink-0">
                  {step.status === "current" && (
                    <ChevronRight size={20} className="text-primary" />
                  )}
                  {step.status === "locked" && (
                    <Lock size={18} className="text-charcoal-300" />
                  )}
                  {step.status === "completed" && (
                    <CheckCircle2 size={20} className="text-primary" />
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </OnboardingLayout>
  );
}
