import type { ReactNode } from "react";
import { Link } from "../lib/router";
import { PlateBackdrop } from "./Plate";

export function PageHeader({
  title,
  lede,
  aside,
  plate,
  plateLabel,
}: {
  title: string;
  lede: string;
  aside?: ReactNode;
  plate?: string;
  plateLabel?: string;
}) {
  if (plate) {
    return (
      <header className="relative overflow-hidden">
        <PlateBackdrop src={plate} variant="header" />
        <div className="shell relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-[42rem]">
            {plateLabel ? (
              <p className="label mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-accent/70" />
                {plateLabel}
              </p>
            ) : null}
            <h1 className="h-display max-w-[24ch]">{title}</h1>
            <p className="mt-6 max-w-[38rem] text-[15.5px] leading-relaxed text-fg/75">
              {lede}
            </p>
          </div>
          {aside ? <div className="mt-10">{aside}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header className="shell pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-14">
        <h1 className="h-display max-w-[22ch]">{title}</h1>
        <p className="max-w-[48ch] text-[15.5px] leading-relaxed text-muted lg:pb-2">{lede}</p>
      </div>
      {aside ? <div className="mt-10">{aside}</div> : null}
    </header>
  );
}

export function Section({
  id,
  title,
  lede,
  wide,
  children,
}: {
  id?: string;
  title: string;
  lede?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="shell py-14 md:py-20">
        {wide ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
              <h2 className="h-section max-w-[24ch]">{title}</h2>
              {lede ? (
                <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{lede}</p>
              ) : null}
            </div>
            <div className="mt-10">{children}</div>
          </>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="h-section max-w-[20ch]">{title}</h2>
              {lede ? (
                <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-muted">{lede}</p>
              ) : null}
            </div>
            <div className="space-y-5 text-[15.5px] leading-relaxed text-fg/85">{children}</div>
          </div>
        )}
      </div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item} className="flex gap-4 py-3 text-[14.5px] leading-relaxed text-fg/85">
          <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 bg-accent/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function KeyValueList({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className="divide-y divide-line/70 border-y border-line/70 font-mono text-[12px]">
      {items.map((item) => (
        <div key={item.k} className="flex items-baseline justify-between gap-6 py-2">
          <dt className="text-muted">{item.k}</dt>
          <dd className="text-right text-fg/90">{item.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CliBlock({
  title,
  lines,
  note,
}: {
  title: string;
  lines: { type: "cmd" | "out" | "comment"; text: string }[];
  note?: string;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="label">{title}</span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted/80">illustrative</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed">
        <code>
          {lines.map((line, index) => (
            <span
              key={`${line.text}-${index}`}
              className={
                line.type === "cmd"
                  ? "block text-fg"
                  : line.type === "out"
                    ? "block text-muted"
                    : "block text-muted/55"
              }
            >
              {line.type === "cmd" ? "$ " : line.type === "out" ? "  " : ""}
              {line.text}
            </span>
          ))}
        </code>
      </pre>
      {note ? (
        <p className="border-t border-line px-4 py-2.5 font-mono text-[10.5px] leading-relaxed text-muted/80">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-accent/60 pl-4 font-mono text-[11.5px] leading-relaxed text-muted">
      {children}
    </p>
  );
}

export function Cta({
  to,
  children,
  variant = "primary",
}: {
  to: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <Link to={to} className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"}`}>
      {children}
    </Link>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center border-b border-line pb-0.5 text-[13.5px] text-fg transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </Link>
  );
}
