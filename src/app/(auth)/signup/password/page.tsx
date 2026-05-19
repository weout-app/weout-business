"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Check, X } from "lucide-react";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function PasswordRule({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check size={14} className="text-success" />
      ) : (
        <X size={14} className="text-charcoal-300" />
      )}
      <span className={met ? "text-success" : "text-charcoal-500"}>
        {label}
      </span>
    </div>
  );
}

export default function SignupPasswordPage() {
  const router = useRouter();
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
    // TODO: combine with contact data and call weout-backend signup endpoint
    const contact = sessionStorage.getItem("signup_contact");
    console.log("Signup:", { ...JSON.parse(contact || "{}"), password: data.password });
    sessionStorage.removeItem("signup_contact");
    router.push("/signup/verify");
  }

  return (
    <AuthLayout
      title="Create a password"
      subtitle="Secure your business account"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            <Check size={16} />
          </div>
          <span className="text-sm text-charcoal-500">Details</span>
        </div>
        <div className="flex-1 h-px bg-primary" />
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <span className="text-sm font-medium text-charcoal-900">Password</span>
        </div>
        <div className="flex-1 h-px bg-charcoal-100" />
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-charcoal-100 text-charcoal-300 flex items-center justify-center text-sm font-semibold">
            3
          </div>
          <span className="text-sm text-charcoal-300">Verify</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="space-y-1.5 pb-1">
          <PasswordRule met={password.length >= 8} label="At least 8 characters" />
          <PasswordRule met={/[A-Z]/.test(password)} label="One uppercase letter" />
          <PasswordRule met={/[0-9]/.test(password)} label="One number" />
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
