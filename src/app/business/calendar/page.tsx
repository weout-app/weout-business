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
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  BadgeCheck,
  MapPin,
  Calendar,
} from "lucide-react";

const typeLabels: Record<string, string> = {
  hostel: "Hostel", tour_guide: "Guía turístico", hotel: "Hotel / Alojamiento",
  agency: "Agencia de viajes", restaurant: "Restaurante / Bar", other: "Otro",
};

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const router = useRouter();
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [plans, setPlans] = useState<PlanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const biz = localStorage.getItem("business");
    if (!biz) { router.push("/login"); return; }

    Promise.all([getVerificationStatus(), getBusinessPlans()])
      .then(([v, p]) => { setVerification(v); setPlans(p); })
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

  const businessName = verification?.businessName || JSON.parse(localStorage.getItem("business") || "{}").businessName || "Negocio";
  const businessType = typeLabels[verification?.businessType ?? ""] || verification?.businessType || "";
  const isApproved = verification?.status === "Approved";

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Build calendar grid
  const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Previous month padding
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, isCurrentMonth: false, date: new Date(currentYear, currentMonth - 1, d) });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, date: new Date(currentYear, currentMonth, d) });
  }

  // Next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, d) });
  }

  // Group plans by date
  function getPlansForDate(date: Date): PlanResult[] {
    return plans.filter((p) => {
      const pd = new Date(p.scheduledAt);
      return pd.getFullYear() === date.getFullYear() &&
        pd.getMonth() === date.getMonth() &&
        pd.getDate() === date.getDate();
    });
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  }

  function formatMonthLabel(d: Date): string {
    const m = d.getMonth();
    const y = d.getFullYear();
    if (y === currentYear && m !== currentMonth) {
      return `${monthNames[m].slice(0, 3)} ${d.getDate()}`;
    }
    return String(d.getDate());
  }

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
            <span className="mt-1 inline-block px-3 py-1 rounded-full bg-charcoal-50 text-xs font-medium text-charcoal-700">
              {businessType}
            </span>
          </div>
          <button
            onClick={() => router.push("/onboarding/verification")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors self-start"
          >
            <Pencil size={14} /> Editar publicación
          </button>
        </div>

        {/* Calendar header */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-charcoal-900">Calendario mensual</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/business")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
            >
              <LayoutGrid size={14} /> Mis experiencias
            </button>
            <button
              onClick={() => router.push("/activities/create")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              <Plus size={14} /> Nueva experiencia
            </button>
          </div>
        </div>

        {/* Month navigation */}
        <div className="mt-4 flex items-center gap-3">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-charcoal-50 text-charcoal-500">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-charcoal-900">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-charcoal-50 text-charcoal-500">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="mt-4 border border-charcoal-100 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-charcoal-50/50 border-b border-charcoal-100">
            {dayNames.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-charcoal-500">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const dayPlans = getPlansForDate(cell.date);
              const isToday = cell.isCurrentMonth &&
                cell.date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-charcoal-100 p-1.5 ${
                    !cell.isCurrentMonth ? "bg-charcoal-50/30" : ""
                  }`}
                >
                  <span className={`text-xs ${
                    !cell.isCurrentMonth
                      ? "text-charcoal-300"
                      : isToday
                      ? "font-bold text-primary"
                      : "text-charcoal-700"
                  }`}>
                    {!cell.isCurrentMonth
                      ? formatMonthLabel(cell.date)
                      : cell.day}
                  </span>

                  {/* Plans on this day */}
                  <div className="mt-1 space-y-1">
                    {dayPlans.slice(0, 2).map((plan) => {
                      const t = new Date(plan.scheduledAt);
                      const timeStr = t.toLocaleTimeString("es", { hour: "numeric", minute: "2-digit", hour12: true });
                      return (
                        <div
                          key={plan.id}
                          className="rounded-lg bg-primary-light/60 border border-primary/10 px-1.5 py-1 cursor-pointer hover:bg-primary-light transition-colors"
                        >
                          <p className="text-xs font-semibold text-charcoal-900 truncate">{plan.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar size={9} className="text-primary" />
                            <span className="text-[10px] text-primary">{timeStr}</span>
                          </div>
                          {plan.locationAddress && (
                            <div className="flex items-center gap-1">
                              <MapPin size={9} className="text-charcoal-400" />
                              <span className="text-[10px] text-charcoal-500 truncate">{plan.locationAddress.split(",")[0]}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayPlans.length > 2 && (
                      <p className="text-[10px] text-charcoal-400 pl-1">+{dayPlans.length - 2} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
