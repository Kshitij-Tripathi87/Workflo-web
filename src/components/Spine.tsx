import { PHASES } from "../scene/phases";

export function Spine({ active }: { active: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-[52px] flex-col justify-center border-r border-line/50 lg:flex"
    >
      <ol className="flex flex-col gap-6 px-3">
        {PHASES.map((phase, index) => {
          const isActive = index === active;
          return (
            <li key={phase.id} className="flex flex-col gap-1.5">
              <span
                className={`font-mono text-[9.5px] tracking-[0.12em] ${
                  isActive ? "text-accent" : "text-muted/50"
                }`}
              >
                {phase.index}
              </span>
              <span
                className={`h-px w-4 transition-colors duration-300 ${
                  isActive ? "bg-accent" : "bg-line"
                }`}
              />
              <span
                className={`font-mono text-[8.5px] tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? "text-fg/85" : "text-muted/45"
                }`}
                style={{ writingMode: "vertical-rl" }}
              >
                {phase.word}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
