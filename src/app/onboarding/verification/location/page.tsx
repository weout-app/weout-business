"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { VerificationLayout } from "@/components/verification-layout";
import { Search, MapPin, ChevronDown, LocateFixed } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const countries = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Ecuador", "El Salvador", "España", "Estados Unidos", "Guatemala", "Honduras",
  "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Portugal",
  "República Dominicana", "Uruguay", "Venezuela",
];

interface AddressFields {
  street: string;
  apt: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
}

export default function BusinessLocationPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const emptyFields: AddressFields = { street: "", apt: "", city: "", state: "", postalCode: "", country: "", lat: 4.6, lng: -74.08 };
  const [fields, setFields] = useState<AddressFields>(emptyFields);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("verification_location");
    if (saved) {
      const p = JSON.parse(saved);
      setFields({
        street: p.street || p.address?.split(",")[0]?.trim() || "",
        apt: p.apt || "",
        city: p.city || "",
        state: p.state || "",
        postalCode: p.postalCode || "",
        country: p.country || "",
        lat: p.lat || 4.6,
        lng: p.lng || -74.08,
      });
    }
    setHydrated(true);
  }, []);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editing, setEditing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateMarker = useCallback((lng: number, lat: number) => {
    if (!map.current) return;
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: "#219F56" })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [fields.lng, fields.lat],
      zoom: fields.street ? 15 : 4,
    });
    if (fields.street) updateMarker(fields.lng, fields.lat);
    return () => { map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value, access_token: MAPBOX_TOKEN, session_token: "weout-biz", language: "es", limit: "8", types: "poi,address,place" });
        const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  }

  async function selectSuggestion(s: Suggestion) {
    setShowSuggestions(false);
    setQuery(s.name + (s.place_formatted ? `, ${s.place_formatted}` : ""));
    try {
      const params = new URLSearchParams({ access_token: MAPBOX_TOKEN, session_token: "weout-biz" });
      const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${s.mapbox_id}?${params}`);
      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature) return;
      const [lng, lat] = feature.geometry.coordinates;
      const ctx = feature.properties.context || {};
      const street = feature.properties.address || feature.properties.name || s.name;
      setFields({
        street,
        apt: "",
        city: ctx.place?.name || ctx.locality?.name || "",
        state: ctx.region?.name || "",
        postalCode: ctx.postcode?.name || "",
        country: ctx.country?.name || "",
        lat, lng,
      });
      setEditing(false);
      updateMarker(lng, lat);
      map.current?.flyTo({ center: [lng, lat], zoom: 15 });
    } catch {}
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${MAPBOX_TOKEN}&language=es`
      );
      const data = await res.json();
      const feature = data.features?.[0];
      if (!feature) return;
      const ctx = feature.properties.context || {};
      setFields({
        street: feature.properties.name || feature.properties.full_address || "",
        apt: "",
        city: ctx.place?.name || ctx.locality?.name || "",
        state: ctx.region?.name || "",
        postalCode: ctx.postcode?.name || "",
        country: ctx.country?.name || "",
        lat, lng,
      });
      setEditing(false);
    } catch {}
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        updateMarker(lng, lat);
        map.current?.flyTo({ center: [lng, lat], zoom: 15 });
        reverseGeocode(lat, lng);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }

  function updateField(key: keyof AddressFields, value: string) {
    setFields((p) => ({ ...p, [key]: value }));
  }

  function onNext() {
    const fullAddress = [fields.street, fields.apt, fields.city, fields.state, fields.postalCode, fields.country].filter(Boolean).join(", ");
    sessionStorage.setItem("verification_location", JSON.stringify({
      address: fullAddress,
      street: fields.street,
      apt: fields.apt,
      city: fields.city,
      state: fields.state,
      postalCode: fields.postalCode,
      country: fields.country,
      lat: fields.lat,
      lng: fields.lng,
    }));
    router.push("/onboarding/verification/verify");
  }

  const fieldClass = "w-full bg-transparent px-4 py-3.5 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none";

  return (
    <VerificationLayout
      onBack={() => router.push("/onboarding/verification")}
      onNext={onNext}
      nextDisabled={!fields.street.trim() || !fields.country.trim()}
    >
      <h1 className="text-2xl font-bold text-charcoal-900">
        ¿Dónde se encuentra tu negocio?
      </h1>
      <p className="mt-2 text-sm text-charcoal-500">
        Agrega la ubicación de tu negocio para que los viajeros te encuentren. Solo compartiremos tu ubicación después de que hagan una reserva.
      </p>

      {/* Map with search overlay */}
      <div className="mt-6 rounded-xl overflow-hidden relative">
        <div ref={mapContainer} className="h-[260px] w-full" />

        {/* Search + locate overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Buscar ubicación"
              className="w-full rounded-lg bg-white shadow-md pl-10 pr-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={locateMe}
            className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors shrink-0"
            title="Usar mi ubicación"
          >
            <LocateFixed size={18} />
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-14 left-3 right-14 z-10 bg-white rounded-lg shadow-lg max-h-52 overflow-y-auto">
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
      </div>

      {/* Confirm address */}
      {hydrated && fields.street && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-charcoal-900">Confirma tu dirección</h2>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="text-xs text-primary hover:text-primary-hover font-medium"
            >
              {editing ? "Listo" : "Editar"}
            </button>
          </div>

          {editing ? (
            <div className="mt-4">
              <div>
                <label className="text-xs text-charcoal-500">País / Región</label>
                <div className="relative mt-1.5 rounded-xl border border-charcoal-100 bg-white overflow-hidden">
                  <select
                    value={fields.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full appearance-none bg-transparent px-4 py-3.5 text-sm text-charcoal-900 outline-none pr-10"
                  >
                    <option value="">Selecciona un país</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-xs text-charcoal-500">Dirección</label>
                <div className="mt-1.5 rounded-xl border border-charcoal-100 bg-white overflow-hidden divide-y divide-charcoal-100">
                  <input type="text" value={fields.street} onChange={(e) => updateField("street", e.target.value)} placeholder="Calle, carrera, avenida" className={fieldClass} />
                  <input type="text" value={fields.apt} onChange={(e) => updateField("apt", e.target.value)} placeholder="Apto, suite, unidad (si aplica)" className={fieldClass} />
                  <input type="text" value={fields.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Ciudad" className={fieldClass} />
                  <input type="text" value={fields.state} onChange={(e) => updateField("state", e.target.value)} placeholder="Departamento / Estado" className={fieldClass} />
                  <input type="text" value={fields.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} placeholder="Código postal" className={fieldClass} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 p-4 rounded-xl bg-primary-light/50 border border-primary/20">
              <p className="text-sm font-medium text-charcoal-900">{fields.street}{fields.apt ? `, ${fields.apt}` : ""}</p>
              <p className="text-xs text-charcoal-500 mt-1">
                {[fields.city, fields.state, fields.postalCode, fields.country].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </VerificationLayout>
  );
}
