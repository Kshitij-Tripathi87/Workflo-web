import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../lib/hooks";
import { PROOF_METRICS, formatMetric, type MetricFormat } from "../content/landing";
import { SectionBackdrop } from "./SectionBackdrop";

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
    <section id="proof" className="relative isolate overflow-hidden px-6 py-32 md:px-10">
      <SectionBackdrop id="observe" position="56% 50%" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">proof</p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/20 bg-white/20 sm:grid-cols-3">
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
