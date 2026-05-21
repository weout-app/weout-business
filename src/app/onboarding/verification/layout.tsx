"use client";

import { OnboardingLayout } from "@/components/onboarding-layout";

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
