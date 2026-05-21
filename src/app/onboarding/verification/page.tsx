"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerificationLayout } from "@/components/verification-layout";

const schema = z.object({
  businessName: z.string().min(2, "Nombre del negocio obligatorio"),
  businessType: z.string().min(1, "Selecciona un tipo de negocio"),
  acceptTerms: z.literal(true, { message: "Debes aceptar los términos y condiciones" }),
});

type FormData = z.infer<typeof schema>;

const businessTypes = [
  { value: "hostel", label: "Hostel", description: "Un lugar para viajeros, con habitaciones compartidas o privadas y espacios para conocer a otros." },
  { value: "tour_guide", label: "Guía turístico", description: "Ofreces tours y experiencias guiadas para viajeros." },
  { value: "hotel", label: "Hotel / Alojamiento", description: "Alojamiento con servicios para huéspedes." },
  { value: "agency", label: "Agencia de viajes", description: "Organizas viajes y experiencias para grupos o individuos." },
  { value: "restaurant", label: "Restaurante / Bar", description: "Espacio gastronómico o de entretenimiento." },
  { value: "other", label: "Otro", description: "Otro tipo de negocio turístico." },
];

export default function BusinessDetailsPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      if (typeof window === "undefined") return {};
      const saved = sessionStorage.getItem("verification_details");
      return saved ? JSON.parse(saved) : {};
    })(),
  });

  const selectedType = watch("businessType");

  function onSubmit(data: FormData) {
    sessionStorage.setItem("verification_details", JSON.stringify(data));
    router.push("/onboarding/verification/location");
  }

  const selected = businessTypes.find((t) => t.value === selectedType);

  return (
    <form id="step-form" onSubmit={handleSubmit(onSubmit)}>
      <VerificationLayout
        onBack={() => router.push("/dashboard")}
        onNext={() => (document.getElementById("step-form") as HTMLFormElement)?.requestSubmit()}
        nextDisabled={isSubmitting}
      >
        <h1 className="text-2xl font-bold text-charcoal-900">
          ¡Vamos a conocer tu negocio!
        </h1>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal-900">
              Nombre del negocio
            </label>
            <input
              className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3.5 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ingresa el nombre de tu negocio"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-xs text-error">{errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-charcoal-900">
              Tipo de negocio
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-charcoal-200 bg-white px-4 py-3.5 pr-10 text-sm text-charcoal-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register("businessType")}
              >
                <option value="">Selecciona una opción</option>
                {businessTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {selected && (
              <p className="text-xs text-charcoal-500 mt-1">{selected.description}</p>
            )}
            {errors.businessType && (
              <p className="text-xs text-error">{errors.businessType.message}</p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded-full border-charcoal-300 accent-primary"
              {...register("acceptTerms")}
            />
            <span className="text-sm text-charcoal-700">
              He leído y acepto los{" "}
              <a href="#" className="text-primary hover:text-primary-hover underline">
                términos y condiciones
              </a>{" "}
              de WeOut.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-error -mt-4">{errors.acceptTerms.message}</p>
          )}
        </div>
      </VerificationLayout>
    </form>
  );
}
