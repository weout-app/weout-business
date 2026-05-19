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
import { login } from "@/lib/api";

const loginSchema = z.object({
  email: z.email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");

  async function onSubmit(data: LoginForm) {
    setApiError("");
    try {
      const result = await login(data);
      localStorage.setItem("access_token", result.accessToken);
      localStorage.setItem("refresh_token", result.refreshToken);
      localStorage.setItem("business", JSON.stringify(result.business));
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Error al iniciar sesión");
    }
  }

  return (
    <AuthLayout
      title={<>Bienvenido a <span className="italic text-primary">WeOut</span></>}
      subtitle="Inicia sesión para gestionar tus actividades"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-4 py-2">{apiError}</p>
        )}
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="Hostel@gmail.com"
          clearable={!!emailValue}
          onClear={() => setValue("email", "")}
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/login"
              className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" loading={isSubmitting}>
            Iniciar sesión
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-500">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Crear cuenta de socio
        </Link>
      </p>
    </AuthLayout>
  );
}
