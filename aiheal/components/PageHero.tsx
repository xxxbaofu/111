"use client";

export function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 -z-10 mx-auto h-[420px] w-[900px] max-w-full bg-grid-fade"
      />
      <div className="container-wide pb-10">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {sub && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {sub}
          </p>
        )}
      </div>
      <div className="hairline" />
    </section>
  );
}
