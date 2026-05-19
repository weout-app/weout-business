"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { StepIndicator } from "@/components/step-indicator";
import { Mail } from "lucide-react";

export default function VerifyInboxPage() {
  return (
    <AuthLayout
      title={<>Verifica tu <span className="italic text-primary">correo</span></>}
      subtitle="Te enviamos un correo de verificación"
    >
      <StepIndicator currentStep={3} />

      <div className="text-center py-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-6">
          <Mail size={36} className="text-primary" />
        </div>
        <p className="text-charcoal-700 mb-2">
          Haz clic en el enlace del correo que te acabamos de enviar para verificar tu cuenta.
        </p>
        <p className="text-sm text-charcoal-500">
          ¿No lo encuentras? Revisa tu carpeta de spam.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/login">
          <Button>Ir a iniciar sesión</Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => {
            // TODO: call resend verification endpoint
            console.log("Reenviar correo de verificación");
          }}
        >
          Reenviar correo
        </Button>
      </div>
    </AuthLayout>
  );
}
