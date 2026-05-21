"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerificationStepper } from "@/components/verification-stepper";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

const schema = z.object({
  shortDescription: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .max(150, "Máximo 150 caracteres"),
  fullDescription: z
    .string()
    .min(30, "Mínimo 30 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
  languages: z.string().min(2, "Indica al menos un idioma"),
  specialties: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DescriptionPage() {
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
      const saved = sessionStorage.getItem("verification_description");
      return saved ? JSON.parse(saved) : {};
    })(),
  });

  const shortDesc = watch("shortDescription", "");
  const fullDesc = watch("fullDescription", "");

  function onSubmit(data: FormData) {
    sessionStorage.setItem("verification_description", JSON.stringify(data));
    router.push("/onboarding/verification/review");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <VerificationStepper currentStep={5} />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-charcoal-900">
          Descripción
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Describe tu negocio para que los viajeros sepan qué ofreces.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm text-charcoal-500">
            Descripción corta
          </label>
          <input
            className="w-full rounded-lg border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Una frase que describe tu negocio"
            maxLength={150}
            {...register("shortDescription")}
          />
          <div className="flex justify-between">
            {errors.shortDescription ? (
              <p className="text-xs text-error">{errors.shortDescription.message}</p>
            ) : <span />}
            <span className="text-xs text-charcoal-300">{shortDesc.length}/150</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-charcoal-500">
            Descripción completa
          </label>
          <textarea
            className="w-full rounded-lg border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-900 placeholder:text-charcoal-300 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-y"
            placeholder="Cuéntanos más sobre tu negocio, qué experiencias ofreces, qué hace tu lugar especial..."
            maxLength={1000}
            {...register("fullDescription")}
          />
          <div className="flex justify-between">
            {errors.fullDescription ? (
              <p className="text-xs text-error">{errors.fullDescription.message}</p>
            ) : <span />}
            <span className="text-xs text-charcoal-300">{fullDesc.length}/1000</span>
          </div>
        </div>

        <Input
          label="Idiomas que manejas"
          placeholder="ej. Español, Inglés, Portugués"
          error={errors.languages?.message}
          {...register("languages")}
        />

        <Input
          label="Especialidades (opcional)"
          placeholder="ej. Tours de aventura, Buceo, Vida nocturna"
          error={errors.specialties?.message}
          {...register("specialties")}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/verification/affiliation")}
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
