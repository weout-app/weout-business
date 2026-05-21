import Link from "next/link";
import { Globe } from "lucide-react";

export function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-charcoal-100">
        <Link href="/dashboard" className="text-charcoal-900">
          <img src="/logo.png" alt="WeOut" className="h-8" />
        </Link>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal-100 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
          <Globe size={16} />
          Español
        </button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
