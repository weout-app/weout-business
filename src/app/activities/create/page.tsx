"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ArrowLeft,
  Globe,
  User,
  Search,
  MapPin,
  LocateFixed,
  ChevronDown,
  X,
} from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const activityTypes = [
  { value: "Aventura", label: "🏔️ Aventura" },
  { value: "Cultura", label: "🎭 Cultura" },
  { value: "Naturaleza", label: "🌿 Naturaleza" },
  { value: "Noche", label: "🌙 Noche" },
  { value: "Playa", label: "🏖️ Playa" },
  { value: "Bocados_locales", label: "🍽️ Bocados locales" },
  { value: "Vida_silvestre", label: "🦜 Vida silvestre" },
  { value: "Estrellas", label: "⭐ Estrellas" },
  { value: "Correr", label: "🏃 Correr" },
  { value: "Senderismo", label: "🥾 Senderismo" },
  { value: "Ciclismo", label: "🚴 Ciclismo" },
  { value: "Pendientes", label: "🏂 Pendientes" },
  { value: "Buceo", label: "🤿 Buceo" },
];

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
}

export default function CreateActivityPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Form state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeatType, setRepeatType] = useState("none");
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [repeatMonthly, setRepeatMonthly] = useState("first");
  const [capacity, setCapacity] = useState("");
  const [allowWaitlist, setAllowWaitlist] = useState(false);
  const [pricingType, setPricingType] = useState("free");
  const [price, setPrice] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Map state
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationLat, setLocationLat] = useState(4.6);
  const [locationLng, setLocationLng] = useState(-74.08);
  const [locationAddress, setLocationAddress] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const updateMarker = useCallback((lng: number, lat: number) => {
    if (!map.current) return;
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: "#219F56", draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);
      marker.current.on("dragend", () => {
        const lngLat = marker.current!.getLngLat();
        setLocationLat(lngLat.lat);
        setLocationLng(lngLat.lng);
      });
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [locationLng, locationLat],
      zoom: 4,
    });
    return () => { map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
  }

  function handleLocationSearch(value: string) {
    setLocationQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value, access_token: MAPBOX_TOKEN, session_token: "weout-plan", language: "es", limit: "8", types: "poi,address,place" });
        const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  }

  async function selectSuggestion(s: Suggestion) {
    setShowSuggestions(false);
    setLocationQuery(s.name + (s.place_formatted ? `, ${s.place_formatted}` : ""));
    try {
      const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, session_token: "weout-plan" });
      const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${s.mapbox_id}?${params}`);
      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature) return;
      const [lng, lat] = feature.geometry.coordinates;
      setLocationLat(lat);
      setLocationLng(lng);
      setLocationAddress(feature.properties.full_address || feature.properties.name || s.name);
      updateMarker(lng, lat);
      map.current?.flyTo({ center: [lng, lat], zoom: 15 });
    } catch {}
  }

  function toggleInterest(value: string) {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("activityType", selectedInterests[0] || "Aventura");
      formData.append("scheduledAt", scheduledAt);
      formData.append("locationLat", String(locationLat));
      formData.append("locationLong", String(locationLng));
      if (locationAddress) formData.append("locationAddress", locationAddress);
      if (capacity) formData.append("maxParticipants", capacity);
      formData.append("privacy", "Public");
      if (repeatType !== "none") formData.append("repeatType", repeatType);
      if (repeatDays.length > 0) formData.append("repeatDays", repeatDays.join(","));
      if (repeatMonthly) formData.append("repeatMonthly", repeatMonthly);
      if (selectedInterests.length > 0) {
        selectedInterests.forEach((i) => formData.append("interests[]", i));
      }

      // Add cover photo
      const coverInput = fileInputRef.current;
      if (coverInput?.files?.[0]) {
        formData.append("cover", coverInput.files[0]);
      }

      const { createPlan } = await import("@/lib/api");
      await createPlan(formData);
      setSubmitting(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Create plan failed:", err.message);
      alert("Error al crear la experiencia: " + err.message);
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-charcoal-100 bg-white px-4 py-3.5 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-charcoal-100">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <img src="/logo.png" alt="WeOut" className="h-7 sm:h-8" />
          </Link>
        </div>
        <h1 className="text-sm font-semibold text-charcoal-900 absolute left-1/2 -translate-x-1/2">
          Crear nueva experiencia
        </h1>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700">
            <Globe size={16} /> Español
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700">
            <User size={16} /> <span className="hidden sm:inline">Mi cuenta</span>
          </button>
        </div>
      </header>

      {/* Cancel link */}
      <div className="px-4 sm:px-8 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-charcoal-700 hover:text-charcoal-900">
          <ArrowLeft size={16} /> Cancelar
        </button>
      </div>

      {/* Form */}
      <main className="flex-1 px-4 sm:px-8 py-6 pb-28 max-w-2xl mx-auto w-full">

        {/* Cover Photo */}
        <div>
          <label className="text-sm font-medium text-charcoal-900">Foto de portada<span className="text-error">*</span></label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
          {coverPreview ? (
            <div className="mt-2 relative rounded-xl overflow-hidden border border-charcoal-100">
              <img src={coverPreview} alt="Cover" className="w-full h-40 object-cover" />
              <button onClick={() => { setCoverPreview(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-charcoal-100 py-10 cursor-pointer hover:border-charcoal-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-charcoal-50 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-charcoal-400">
                  <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm text-charcoal-500">
                Arrastra una imagen aquí o <span className="text-charcoal-900 font-medium underline">elige un archivo</span>
              </p>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Título<span className="text-error">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre de tu actividad"
            className={`mt-2 ${inputClass}`}
          />
        </div>

        {/* About Activity */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Sobre la actividad<span className="text-error">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu actividad aquí"
            className={`mt-2 ${inputClass} min-h-[100px] resize-y`}
          />
        </div>

        {/* Date & Time */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Fecha y hora<span className="text-error">*</span></label>
          <div className="mt-2 flex gap-3">
            <div className="relative flex-1">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="relative flex-1">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between rounded-xl border border-charcoal-100 bg-white px-4 py-3.5">
              <span className="text-sm text-charcoal-500">¿Repetir esta actividad?</span>
              <div className="relative">
                <select
                  value={repeatType}
                  onChange={(e) => { setRepeatType(e.target.value); setRepeatDays([]); }}
                  className="text-sm text-charcoal-900 bg-transparent outline-none appearance-none pr-5 cursor-pointer"
                >
                  <option value="none">No repetir</option>
                  <option value="same_day">Cada semana este día</option>
                  <option value="daily">Todos los días</option>
                  <option value="weekly">Días específicos</option>
                  <option value="monthly_date">Mismo día del mes</option>
                  <option value="monthly_week">Misma semana del mes</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
              </div>
            </div>

            {/* Same day — shows which day */}
            {repeatType === "same_day" && date && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-primary-light/50 border border-primary/20">
                <p className="text-sm text-charcoal-900">
                  Se repetirá cada <span className="font-semibold">{new Date(date + "T12:00:00").toLocaleDateString("es", { weekday: "long" })}</span>
                </p>
              </div>
            )}

            {/* Weekly — pick days */}
            {repeatType === "weekly" && (
              <div className="mt-3 p-4 rounded-xl border border-charcoal-100 bg-white">
                <p className="text-xs text-charcoal-500 mb-2">Selecciona los días</p>
                <div className="flex gap-1.5">
                  {[
                    { key: "mon", label: "Lu" },
                    { key: "tue", label: "Ma" },
                    { key: "wed", label: "Mi" },
                    { key: "thu", label: "Ju" },
                    { key: "fri", label: "Vi" },
                    { key: "sat", label: "Sá" },
                    { key: "sun", label: "Do" },
                  ].map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() =>
                        setRepeatDays((prev) =>
                          prev.includes(day.key) ? prev.filter((d) => d !== day.key) : [...prev, day.key]
                        )
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        repeatDays.includes(day.key)
                          ? "bg-primary text-white"
                          : "bg-charcoal-50 text-charcoal-500 hover:bg-charcoal-100"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly by date — e.g. every 15th */}
            {repeatType === "monthly_date" && date && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-primary-light/50 border border-primary/20">
                <p className="text-sm text-charcoal-900">
                  Se repetirá el <span className="font-semibold">{new Date(date + "T12:00:00").getDate()}</span> de cada mes
                </p>
              </div>
            )}

            {/* Monthly by week — e.g. first Friday */}
            {repeatType === "monthly_week" && (
              <div className="mt-3 p-4 rounded-xl border border-charcoal-100 bg-white">
                <p className="text-xs text-charcoal-500 mb-2">¿Cuál semana del mes?</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "first", label: "Primer" },
                    { key: "second", label: "Segundo" },
                    { key: "third", label: "Tercer" },
                    { key: "last", label: "Último" },
                  ].map((opt) => {
                    const dayName = date
                      ? new Date(date + "T12:00:00").toLocaleDateString("es", { weekday: "long" })
                      : "día";
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setRepeatMonthly(opt.key)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          repeatMonthly === opt.key
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-charcoal-700 border-charcoal-100 hover:border-charcoal-300"
                        }`}
                      >
                        {opt.label} {dayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Point */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Punto de encuentro<span className="text-error">*</span></label>
          <div className="mt-2 rounded-xl overflow-hidden relative">
            <div ref={mapContainer} className="h-[250px] w-full" />

            {/* Search + locate */}
            <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Buscar ubicación"
                  className="w-full rounded-lg bg-white shadow-md pl-10 pr-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition((pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    updateMarker(lng, lat);
                    map.current?.flyTo({ center: [lng, lat], zoom: 15 });
                    setLocationLat(lat);
                    setLocationLng(lng);
                  });
                }}
                className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors shrink-0"
              >
                <LocateFixed size={18} />
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-14 left-3 right-14 z-10 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.mapbox_id}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-charcoal-50 transition-colors border-b border-charcoal-50 last:border-0"
                  >
                    <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 truncate">{s.name}</p>
                      {(s.full_address || s.place_formatted) && (
                        <p className="text-xs text-charcoal-500 truncate">{s.full_address || s.place_formatted}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Drag hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-charcoal-900/80 text-white text-xs px-4 py-1.5 rounded-full">
              Arrastra el pin a tu punto de encuentro exacto
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Capacidad<span className="text-error">*</span></label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Límite de asistentes"
            className={`mt-2 ${inputClass}`}
          />
          <div className="mt-3 flex items-center justify-between rounded-xl border border-charcoal-100 bg-white px-4 py-3.5">
            <span className="text-sm text-charcoal-500">¿Permitir lista de espera?</span>
            <button
              type="button"
              onClick={() => setAllowWaitlist(!allowWaitlist)}
              className={`relative w-11 h-6 rounded-full transition-colors ${allowWaitlist ? "bg-primary" : "bg-charcoal-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${allowWaitlist ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Precio<span className="text-error">*</span></label>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-charcoal-100 bg-white px-4 py-3.5">
            <span className="text-sm text-charcoal-500">Tipo de precio</span>
            <div className="relative">
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value)}
                className="text-sm font-medium text-primary bg-transparent outline-none appearance-none pr-5 cursor-pointer"
              >
                <option value="free">Gratis</option>
                <option value="paid">De pago</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
            </div>
          </div>
          {pricingType === "paid" && (
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio (USD)"
              className={`mt-3 ${inputClass}`}
            />
          )}
        </div>

        {/* Interests */}
        <div className="mt-6">
          <label className="text-sm font-medium text-charcoal-900">Intereses</label>
          <p className="text-xs text-charcoal-500 mt-1">Selecciona las categorías que mejor describen tu actividad.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activityTypes.map((interest) => (
              <button
                key={interest.value}
                type="button"
                onClick={() => toggleInterest(interest.value)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  selectedInterests.includes(interest.value)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-charcoal-700 border-charcoal-100 hover:border-charcoal-300"
                }`}
              >
                {interest.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-end px-4 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur border-t border-charcoal-100">
        <button
          onClick={handleSubmit}
          disabled={submitting || !title || !description || !date || !time || !locationAddress}
          className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Creando..." : "Crear experiencia"}
        </button>
      </footer>

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 text-center relative">
            <button
              onClick={() => router.push("/dashboard")}
              className="absolute top-4 right-4 text-charcoal-900 hover:text-charcoal-500"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-6 mt-2">
              <div className="w-24 h-24 rounded-3xl bg-primary-light flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M14 24l8 8 14-16" stroke="#219F56" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-charcoal-900">
              ¡Experiencia creada!
            </h2>
            <p className="mt-3 text-sm text-charcoal-500">
              Has creado tu experiencia <span className="text-primary font-medium">{title}</span> exitosamente. ¡Todo listo!
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 w-full rounded-full bg-primary text-white py-3.5 text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Listo
            </button>
            <button
              onClick={() => router.push("/messages")}
              className="mt-3 w-full flex items-center justify-center gap-1 text-sm font-semibold text-charcoal-900 hover:text-charcoal-700 transition-colors"
            >
              Ver chat <ChevronDown size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
