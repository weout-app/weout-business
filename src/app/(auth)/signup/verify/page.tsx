"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Mail, Check } from "lucide-react";

export default function VerifyInboxPage() {
  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="We sent you a verification email"
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
            <Check size={16} />
          </div>
          <span className="text-sm text-charcoal-500">Password</span>
        </div>
        <div className="flex-1 h-px bg-primary" />
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            3
          </div>
          <span className="text-sm font-medium text-charcoal-900">Verify</span>
        </div>
      </div>

      {/* Email illustration */}
      <div className="text-center py-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-6">
          <Mail size={36} className="text-primary" />
        </div>
        <p className="text-charcoal-700 mb-2">
          Click the link in the email we just sent to verify your account.
        </p>
        <p className="text-sm text-charcoal-500">
          Can&apos;t find it? Check your spam folder.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/login">
          <Button>Go to login</Button>
        </Link>
        <Button variant="outline" onClick={() => {
          // TODO: call resend verification endpoint
          console.log("Resend verification email");
        }}>
          Resend email
        </Button>
      </div>
    </AuthLayout>
  );
}
