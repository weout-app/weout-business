"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/input";
import { Button } from "@/components/button";

const contactSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
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
    // Store in session/state for next step
    sessionStorage.setItem("signup_contact", JSON.stringify(data));
    router.push("/signup/password");
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Tell us about your business"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <span className="text-sm font-medium text-charcoal-900">Details</span>
        </div>
        <div className="flex-1 h-px bg-charcoal-100" />
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-charcoal-100 text-charcoal-300 flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <span className="text-sm text-charcoal-300">Password</span>
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
          label="Business name"
          placeholder="e.g. Sunset Hostel Cartagena"
          error={errors.businessName?.message}
          {...register("businessName")}
        />
        <Input
          label="Contact name"
          placeholder="Your full name"
          error={errors.contactName?.message}
          {...register("contactName")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@business.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone number"
          type="tel"
          placeholder="+57 300 123 4567"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Button type="submit" loading={isSubmitting}>
          Continue
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
