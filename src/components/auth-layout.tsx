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
      <header className="flex items-center justify-between px-8 py-5">
        <Link href="/login" className="text-charcoal-900">
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 4L16 24L23.5 4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 16C24 20.4183 28.0294 24 33 24C37.9706 24 42 20.4183 42 16C42 11.5817 37.9706 8 33 8C28.0294 8 24 11.5817 24 16Z" stroke="currentColor" strokeWidth="3.5"/>
          </svg>
        </Link>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal-100 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors">
          <Globe size={16} />
          Español
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-charcoal-900">
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
