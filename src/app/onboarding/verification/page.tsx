"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerificationStepper } from "@/components/verification-stepper";
import { Input } from "@/components/input";
import { Button } from "@/components/button";

const schema = z.object({
  businessName: z.string().min(2, "Nombre del negocio obligatorio"),
  businessType: z.string().min(1, "Selecciona un tipo de negocio"),
  contactName: z.string().min(2, "Nombre de contacto obligatorio"),
  email: z.email("Correo electrónico válido"),
  phone: z.string().min(7, "Número de teléfono válido"),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const businessTypes = [
  { value: "hostel", label: "Hostel" },
  { value: "tour_guide", label: "Guía turístico" },
  { value: "hotel", label: "Hotel / Alojamiento" },
  { value: "agency", label: "Agencia de viajes" },
  { value: "restaurant", label: "Restaurante / Bar" },
  { value: "other", label: "Otro" },
];

export default function BusinessDetailsPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      if (typeof window === "undefined") return {};
      const saved = sessionStorage.getItem("verification_details");
      return saved ? JSON.parse(saved) : {};
    })(),
  });

  function onSubmit(data: FormData) {
    sessionStorage.setItem("verification_details", JSON.stringify(data));
    router.push("/onboarding/verification/location");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <VerificationStepper currentStep={1} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-charcoal-900">
          Datos del negocio
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Información básica sobre tu negocio.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Nombre del negocio"
          placeholder="ej. Sunset Hostel Cartagena"
          error={errors.businessName?.message}
          {...register("businessName")}
        />

        <div className="space-y-1.5">
          <label className="block text-sm text-charcoal-500">
            Tipo de negocio
          </label>
          <select
            className="w-full rounded-lg border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            {...register("businessType")}
          >
            <option value="">Selecciona una opción</option>
            {businessTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.businessType && (
            <p className="text-xs text-error">{errors.businessType.message}</p>
          )}
        </div>

        <Input
          label="Nombre de contacto"
          placeholder="Tu nombre completo"
          error={errors.contactName?.message}
          {...register("contactName")}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@negocio.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Teléfono"
          type="tel"
          placeholder="+57 300 123 4567"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Sitio web (opcional)"
          placeholder="https://tunegocio.com"
          error={errors.website?.message}
          {...register("website")}
        />

        <div className="pt-4">
          <Button type="submit" loading={isSubmitting}>
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}
