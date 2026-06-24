// Brand mark + wordmark. "Abroadly" is a placeholder name —
// change it here once and it updates across the whole site.
export const BRAND = "Abroadly";

export function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const text = variant === "light" ? "text-white" : "text-ink-900";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="var(--color-brand-600)" />
        <path
          d="M16 7c5 3.2 5 14.8 0 18-5-3.2-5-14.8 0-18Z"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
        />
        <path d="M7 16h18" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="1.8" />
      </svg>
      <span className={`font-display text-[1.35rem] font-semibold tracking-tight ${text}`}>
        {BRAND}
      </span>
    </span>
  );
}
