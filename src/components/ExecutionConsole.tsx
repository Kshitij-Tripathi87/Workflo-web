import { useRef, useState, type KeyboardEvent } from "react";
import { CONSOLE_NOTE, CONSOLE_TABS } from "../content/execution";

export function ExecutionConsole() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = CONSOLE_TABS[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = CONSOLE_TABS.length - 1;
    let next = active;

    if (event.key === "ArrowRight") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowLeft") {
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
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <p className="label">Execution record</p>
        <p className="font-mono text-[9.5px] tracking-[0.16em] text-muted/70">ILLUSTRATIVE</p>
      </div>

      <div
        role="tablist"
        aria-label="Execution record views"
        onKeyDown={onKeyDown}
        className="flex gap-px overflow-x-auto border-b border-line bg-line"
      >
        {CONSOLE_TABS.map((tab, index) => {
          const selected = active === index;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`console-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="console-panel"
              tabIndex={selected ? 0 : -1}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              onClick={() => setActive(index)}
              className={`shrink-0 px-3.5 py-2.5 text-[12px] transition-colors ${
                selected ? "bg-surface text-fg" : "bg-bg text-muted hover:text-fg"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id="console-panel" role="tabpanel" aria-labelledby={`console-tab-${current.id}`} tabIndex={0}>
        <dl className="divide-y divide-line/60">
          {current.lines.map((line) => (
            <div key={line.k} className="flex items-baseline justify-between gap-6 px-4 py-2.5">
              <dt className="font-mono text-[11.5px] text-muted">{line.k}</dt>
              <dd className="flex items-center gap-2 text-right font-mono text-[11.5px] text-fg/90">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 ${
                    line.state === "ok"
                      ? "bg-accent"
                      : line.state === "active"
                        ? "bg-accent/60"
                        : "bg-line"
                  }`}
                />
                {line.v}
              </dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-line px-4 py-3 text-[12.5px] leading-relaxed text-muted">
          {current.caption}
        </p>
      </div>

      <p className="border-t border-line bg-bg/40 px-4 py-2.5 font-mono text-[10px] leading-relaxed text-muted/70">
        {CONSOLE_NOTE}
      </p>
    </div>
  );
}
