import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { PROOF_METRICS, formatMetric, type MetricFormat } from "../content/landing";
import { SectionBackdrop } from "./SectionBackdrop";
import { Link } from "../lib/router";

gsap.registerPlugin(ScrollTrigger);

function CountUp({ value, format }: { value: number; format: MetricFormat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = formatMetric(format, counter.value);
      },
      scrollTrigger: { trigger: el, start: "top 65%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, format, reduced]);

  return <span ref={ref}>{formatMetric(format, 0)}</span>;
}

export function Proof() {
  return (
    <section id="docs" className="relative isolate overflow-hidden px-6 py-32 md:px-10">
      <SectionBackdrop id="observe" position="56% 50%" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">proof & documentation</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-white md:text-5xl">
              verifiable in under a second.
            </h2>
          </div>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-3 text-xs font-mono text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            <span>Interactive Receipt Inspector</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] sm:grid-cols-3">
          {PROOF_METRICS.map((stat) => (
            <div key={stat.id} className="h-full bg-black p-8">
              <p className="text-4xl font-medium tracking-tight md:text-5xl">
                <CountUp value={stat.target} format={stat.format} />
              </p>
              <p className="mt-2 text-xs text-white/70 md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
