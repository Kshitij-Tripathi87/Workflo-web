import { useRef, useState, type KeyboardEvent } from "react";
import { LIFECYCLE, LIFECYCLE_REGIONS } from "../content/lifecycle";
import { LifecycleSchematic } from "./LifecycleSchematic";
import { KeyValueList } from "./ui";

export function LifecycleSection() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = LIFECYCLE[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = LIFECYCLE.length - 1;
    let next = active;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = active === 0 ? last : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    } else {
      return;
    }

    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
      <div>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <p className="label">Execution lifecycle</p>
          <p className="font-mono text-[10.5px] text-muted/70">12 stages</p>
        </div>
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Execution lifecycle stages"
          onKeyDown={onKeyDown}
          className="max-h-[30rem] overflow-y-auto border-y border-line"
        >
          {LIFECYCLE.map((item, index) => {
            const startsPhase = index === 0 || LIFECYCLE[index - 1].phase !== item.phase;
            const selected = active === index;

            return (
              <div key={item.id} role="presentation">
                {startsPhase ? (
                  <p
                    role="presentation"
                    className="border-b border-line bg-bg/60 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.16em] text-muted/60"
                  >
                    {item.phase.toUpperCase()}
                  </p>
                ) : null}
                <button
                  type="button"
                  role="tab"
                  id={`lifecycle-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls="lifecycle-panel"
                  tabIndex={selected ? 0 : -1}
                  ref={(node) => {
                    buttons.current[index] = node;
                  }}
                  onClick={() => setActive(index)}
                  className={`flex w-full items-baseline gap-4 border-b border-line/60 px-3 py-2.5 text-left transition-colors ${
                    selected ? "bg-surface text-fg" : "text-muted hover:bg-surface/60 hover:text-fg"
                  }`}
                >
                  <span
                    className={`font-mono text-[10.5px] ${
                      selected ? "text-accent" : "text-muted/60"
                    }`}
                  >
                    {item.index}
                  </span>
                  <span className="text-[13.5px] leading-snug">{item.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="panel p-4 md:p-5">
          <LifecycleSchematic activeRegion={current.region} />
        </div>

        <div
          id="lifecycle-panel"
          role="tabpanel"
          aria-labelledby={`lifecycle-tab-${current.id}`}
          tabIndex={0}
          className="panel mt-4 p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="label">{current.phase}</p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-muted/70">
              {LIFECYCLE_REGIONS[current.region]}
            </p>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-[11px] text-accent">{current.index}</span>
            <h3 className="h-sub">{current.label}</h3>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">{current.detail}</p>
          <div className="mt-5">
            <KeyValueList items={current.readout} />
          </div>
        </div>
      </div>
    </div>
  );
}
