"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getVerificationStatus,
  getBusinessPlans,
  type VerificationResult,
  type PlanResult,
} from "@/lib/api";
import {
  Globe,
  User,
  Pencil,
  Calendar,
  Plus,
  MapPin,
  ChevronRight,
  BadgeCheck,
  Clock,
  Users,
} from "lucide-react";

const typeLabels: Record<string, string> = {
  hostel: "Hostel",
  tour_guide: "Guía turístico",
  hotel: "Hotel / Alojamiento",
  agency: "Agencia de viajes",
  restaurant: "Restaurante / Bar",
  other: "Otro",
};

const activityEmojis: Record<string, string> = {
  Aventura: "🏔️", Cultura: "🎭", Naturaleza: "🌿", Noche: "🌙", Playa: "🏖️",
  Bocados_locales: "🍽️", Vida_silvestre: "🦜", Estrellas: "⭐", Correr: "🏃",
  Senderismo: "🥾", Ciclismo: "🚴", Pendientes: "🏂", Buceo: "🤿",
};

export default function BusinessDetailPage() {
  const router = useRouter();
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [plans, setPlans] = useState<PlanResult[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const biz = localStorage.getItem("business");
    if (!biz) { router.push("/login"); return; }

    Promise.all([getVerificationStatus(), getBusinessPlans()])
      .then(([v, p]) => {
        setVerification(v);
        setPlans(p);
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

  const now = new Date();
  const upcomingPlans = plans.filter((p) => new Date(p.scheduledAt) >= now);
  const pastPlans = plans.filter((p) => new Date(p.scheduledAt) < now);
  const displayPlans = tab === "upcoming" ? upcomingPlans : pastPlans;
  const businessName = verification?.businessName || JSON.parse(localStorage.getItem("business") || "{}").businessName || "Negocio";
  const businessType = typeLabels[verification?.businessType ?? ""] || verification?.businessType || "";
  const isApproved = verification?.status === "Approved";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-charcoal-100">
        <Link href="/dashboard">
          <img src="/logo.png" alt="WeOut" className="h-7 sm:h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700">
            <Globe size={16} /> Español
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700">
            <User size={16} /> <span className="hidden sm:inline">Mi cuenta</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full">
        {/* Business info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-charcoal-900">{businessName}</h1>
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  <BadgeCheck size={14} /> Verificado
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-charcoal-500">{businessType}</p>
          </div>
          <button
            onClick={() => router.push("/onboarding/verification")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors self-start"
          >
            <Pencil size={14} /> Editar publicación
          </button>
        </div>

        {/* My Plans header */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-charcoal-900">Mis experiencias</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/business/calendar")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
            >
              <Calendar size={14} /> Calendario
            </button>
            <button
              onClick={() => router.push("/activities/create")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              <Plus size={14} /> Nueva experiencia
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setTab("upcoming")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "upcoming"
                ? "bg-primary-light text-primary border border-primary/20"
                : "text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            Próximas
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
              tab === "upcoming" ? "bg-primary text-white" : "bg-charcoal-200 text-charcoal-500"
            }`}>
              {upcomingPlans.length}
            </span>
          </button>
          <button
            onClick={() => setTab("past")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "past"
                ? "bg-primary-light text-primary border border-primary/20"
                : "text-charcoal-500 hover:text-charcoal-700"
            }`}
          >
            Pasadas
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
              tab === "past" ? "bg-primary text-white" : "bg-charcoal-200 text-charcoal-500"
            }`}>
              {pastPlans.length}
            </span>
          </button>
        </div>

        {/* Plan cards grid */}
        {displayPlans.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayPlans.map((plan) => {
              const date = new Date(plan.scheduledAt);
              const dateStr = date.toLocaleDateString("es", { month: "short", day: "numeric" });
              const timeStr = date.toLocaleTimeString("es", { hour: "numeric", minute: "2-digit", hour12: true });
              const emoji = activityEmojis[plan.activityType] || "📍";

              return (
                <div key={plan.id} className="rounded-2xl border border-charcoal-100 overflow-hidden bg-white">
                  {/* Cover */}
                  <div className="relative h-40 bg-charcoal-50">
                    {plan.coverPath ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "")}/${plan.coverPath}`}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {emoji}
                      </div>
                    )}
                    {/* Attendees badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                      <Users size={12} />
                      {plan.totalReservations}{plan.maxParticipants ? `/${plan.maxParticipants}` : ""}
                    </div>
                    {/* Edit button */}
                    <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <Pencil size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-charcoal-900">{plan.title}</h3>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-primary" />
                        {dateStr}, {timeStr}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <span className="text-xs text-charcoal-500">
                        {emoji} {plan.activityType.replace(/_/g, " ")}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push("/messages")}
                      className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-full border border-charcoal-100 text-sm font-medium text-primary hover:bg-charcoal-50 transition-colors"
                    >
                      Ver chat <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 text-center py-12">
            <p className="text-sm text-charcoal-300">
              {tab === "upcoming" ? "No tienes experiencias próximas." : "No tienes experiencias pasadas."}
            </p>
            {tab === "upcoming" && (
              <button
                onClick={() => router.push("/activities/create")}
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                Crear experiencia
              </button>
            )}
          </div>
        )}

        {/* View all */}
        {displayPlans.length > 6 && (
          <div className="mt-6 text-center">
            <button className="px-8 py-2.5 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors">
              Ver todas
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
