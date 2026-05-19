"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { CheckCircle, XCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/v1";

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    fetch(`${API_URL}/business-auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((json) => {
        const msg = json.result?.message ?? json.error?.message ?? "";
        if (msg.includes("successfully") || msg.includes("verificado")) {
          setStatus("success");
          setMessage("¡Tu correo ha sido verificado! Ya puedes iniciar sesión.");
        } else {
          setStatus("error");
          setMessage(msg || "No se pudo verificar el correo.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión. Inténtalo más tarde.");
      });
  }, [token]);

  return (
    <AuthLayout
      title={
        status === "success" ? (
          <>Correo <span className="italic text-primary">verificado</span></>
        ) : status === "error" ? (
          <>Error de <span className="italic text-error">verificación</span></>
        ) : (
          <>Verificando...</>
        )
      }
    >
      <div className="text-center py-6">
        {status === "loading" && (
          <p className="text-charcoal-500">Verificando tu correo...</p>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-primary mx-auto mb-4" />
            <p className="text-charcoal-700 mb-6">{message}</p>
            <Link href="/login">
              <Button>Iniciar sesión</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} className="text-error mx-auto mb-4" />
            <p className="text-charcoal-700 mb-6">{message}</p>
            <Link href="/login">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
