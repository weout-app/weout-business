import Link from "next/link";
import { Globe } from "lucide-react";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <Link href="/login" className="text-charcoal-900">
          <img src="/logo.png" alt="WeOut" className="h-8" />
        </Link>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal-100 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
          <Globe size={16} />
          Español
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-charcoal-500 text-sm">{subtitle}</p>
          )}
          <div className="mt-8 text-left">{children}</div>
        </div>
      </main>
    </div>
  );
}
