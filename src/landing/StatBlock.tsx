export function StatBlock({
  value,
  label,
  align = "left",
  divider = "before",
  rotate = 0,
}: {
  value: string;
  label: string;
  align?: "left" | "right";
  divider?: "before" | "after";
  rotate?: number;
}) {
  const dividerEl = (
    <span
      aria-hidden="true"
      className="hidden h-px w-24 bg-white/40 md:block"
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );

  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className={`flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`}>
        {divider === "before" ? dividerEl : null}
        <span className="text-4xl font-medium tracking-tight md:text-5xl">{value}</span>
        {divider === "after" ? dividerEl : null}
      </div>
      <p className="mt-1 text-xs text-white/70 md:text-sm">{label}</p>
    </div>
  );
}
