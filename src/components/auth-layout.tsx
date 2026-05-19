import Link from "next/link";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-12">
          <h1 className="text-5xl font-bold text-white mb-4">WeOut</h1>
          <p className="text-xl text-white/90">Business Portal</p>
          <p className="mt-6 text-white/70 max-w-md mx-auto">
            Create unforgettable experiences for travelers around the world.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10" />
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/login" className="lg:hidden text-primary font-bold text-2xl mb-8 block">
            WeOut <span className="text-charcoal-500 font-normal text-base">Business</span>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-900">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-charcoal-500">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
