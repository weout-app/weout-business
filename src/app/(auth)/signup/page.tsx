"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { StepIndicator } from "@/components/step-indicator";

const contactSchema = z.object({
  businessName: z.string().min(2, "El nombre del negocio es obligatorio"),
  contactName: z.string().min(2, "El nombre de contacto es obligatorio"),
  email: z.email("Ingresa un correo electrónico válido"),
  phone: z.string().min(7, "Ingresa un número de teléfono válido"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function SignupContactPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactForm) {
    sessionStorage.setItem("signup_contact", JSON.stringify(data));
    router.push("/signup/password");
  }

  return (
    <AuthLayout
      title={<>Crear cuenta de <span className="italic text-primary">Socio</span></>}
      subtitle="Cuéntanos sobre tu negocio"
    >
      <StepIndicator currentStep={1} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre del negocio"
          placeholder="ej. Sunset Hostel Cartagena"
          error={errors.businessName?.message}
          {...register("businessName")}
        />
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
          label="Número de teléfono"
          type="tel"
          placeholder="+57 300 123 4567"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="pt-2">
          <Button type="submit" loading={isSubmitting}>
            Continuar
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-500">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
