import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2">
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-mint-400 to-sky-500 shadow-glow">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-ink-950"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 12h3l2-5 4 10 2-5 2 3h5" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          AIHeal
        </span>
      )}
    </Link>
  );
}
