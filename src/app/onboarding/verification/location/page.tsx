"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerificationStepper } from "@/components/verification-stepper";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { MapPin } from "lucide-react";

const schema = z.object({
  address: z.string().min(5, "Dirección obligatoria"),
  city: z.string().min(2, "Ciudad obligatoria"),
  state: z.string().min(2, "Departamento/Estado obligatorio"),
  country: z.string().min(2, "País obligatorio"),
  postalCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BusinessLocationPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      if (typeof window === "undefined") return {};
      const saved = sessionStorage.getItem("verification_location");
      return saved ? JSON.parse(saved) : {};
    })(),
  });

  function onSubmit(data: FormData) {
    sessionStorage.setItem("verification_location", JSON.stringify(data));
    router.push("/onboarding/verification/verify");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <VerificationStepper currentStep={2} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-charcoal-900">
          Ubicación del negocio
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          ¿Dónde se encuentra tu negocio?
        </p>
      </div>

      {/* Map placeholder */}
      <div className="mt-6 rounded-xl border border-charcoal-200 bg-charcoal-50 h-48 flex items-center justify-center">
        <div className="text-center text-charcoal-300">
          <MapPin size={32} className="mx-auto mb-2" />
          <p className="text-sm">Mapa interactivo próximamente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Dirección"
          placeholder="Calle 10 #5-23"
          error={errors.address?.message}
          {...register("address")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            placeholder="Cartagena"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            label="Departamento / Estado"
            placeholder="Bolívar"
            error={errors.state?.message}
            {...register("state")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="País"
            placeholder="Colombia"
            error={errors.country?.message}
            {...register("country")}
          />
          <Input
            label="Código postal (opcional)"
            placeholder="130001"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/verification")}
          >
            Atrás
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}
