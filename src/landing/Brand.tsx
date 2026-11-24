export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {/* PLACEHOLDER: logo mark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <rect x="2.5" y="2.5" width="15" height="15" />
        <path d="M6.5 12.5 10 6l3.5 6.5" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-normal tracking-tight">workflo</span>
    </span>
  );
}
