"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { StepIndicator } from "@/components/step-indicator";
import { Check, X } from "lucide-react";
import { signup } from "@/lib/api";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Al menos una letra mayúscula")
      .regex(/[0-9]/, "Al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check size={14} className="text-primary" />
      ) : (
        <X size={14} className="text-charcoal-300" />
      )}
      <span className={met ? "text-primary" : "text-charcoal-500"}>
        {label}
      </span>
    </div>
  );
}

export default function SignupPasswordPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const password = watch("password", "");

  async function onSubmit(data: PasswordForm) {
    setApiError("");
    const contactRaw = sessionStorage.getItem("signup_contact");
    if (!contactRaw) {
      router.push("/signup");
      return;
    }

    const contact = JSON.parse(contactRaw);

    try {
      await signup({
        ...contact,
        password: data.password,
      });
      sessionStorage.removeItem("signup_contact");
      router.push("/signup/verify");
    } catch (err: any) {
      setApiError(err.message || "Error al crear la cuenta");
    }
  }

  return (
    <AuthLayout
      title={<>Crear cuenta de <span className="italic text-primary">Socio</span></>}
      subtitle="Asegura tu cuenta de negocio"
    >
      <StepIndicator currentStep={2} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-4 py-2">{apiError}</p>
        )}
        <Input
          label="Contraseña"
          type="password"
          placeholder="Crea una contraseña segura"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="space-y-1.5 pb-1">
          <PasswordRule met={password.length >= 8} label="Mínimo 8 caracteres" />
          <PasswordRule met={/[A-Z]/.test(password)} label="Una letra mayúscula" />
          <PasswordRule met={/[0-9]/.test(password)} label="Un número" />
        </div>

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Vuelve a ingresar tu contraseña"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="pt-2">
          <Button type="submit" loading={isSubmitting}>
            Crear cuenta
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
