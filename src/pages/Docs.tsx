import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DOC_GROUPS, DOCS, type DocBlock } from "../content/docs";
import { BulletList, Note, PageHeader } from "../components/ui";

function DocsCode({ title, lines, note }: { title: string; lines: string[]; note?: string }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="label">{title}</span>
        <span className="font-mono text-[9.5px] tracking-[0.16em] text-muted/70">ILLUSTRATIVE</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-fg/85">
        <code>{lines.join("\n")}</code>
      </pre>
      {note ? (
        <p className="border-t border-line px-4 py-2.5 font-mono text-[10.5px] text-muted/70">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function Block({ block }: { block: DocBlock }): ReactNode {
  if (block.type === "p") {
    return (
      <p className="max-w-[68ch] text-[14.5px] leading-relaxed text-fg/85">{block.text}</p>
    );
  }

  if (block.type === "list") {
    return <BulletList items={block.items} />;
  }

  return <DocsCode title={block.title} lines={block.lines} note={block.note} />;
}

function matches(section: (typeof DOCS)[number], query: string) {
  const haystack = [
    section.title,
    section.summary,
    ...section.blocks.flatMap((block) => {
      if (block.type === "p") return [block.text];
      if (block.type === "list") return block.items;
      return [block.title, block.note ?? "", ...block.lines];
    }),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function Docs() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("introduction");

  const sections = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return DOCS;
    return DOCS.filter((section) => matches(section, trimmed));
  }, [query]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );

    DOCS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ block: "start" });
      setActiveId(hash);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PageHeader
        title="Documentation."
        lede="The execution model, the lifecycle and the intended CLI surface. Workflo is pre-release: commands, keys and outputs shown here are illustrative."
        plate="/images/plate-observe.webp"
        plateLabel="Documentation"
      />

      <div className="shell pb-20">
        <Note>
          Pre-release documentation. Nothing on this page describes a shipped, published interface.
        </Note>

        <div className="mt-8 grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-14">
          <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pr-2">
            <div>
              <label htmlFor="docs-search" className="label">
                Search
              </label>
              <input
                id="docs-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="receipts, isolation, CLI…"
                className="mt-2 w-full border border-line bg-surface px-3 py-2 font-mono text-[12px] text-fg transition-colors placeholder:text-muted/45 focus:border-accent/50"
              />
              <p aria-live="polite" className="mt-2 font-mono text-[10px] text-muted/70">
                {sections.length} of {DOCS.length} sections
              </p>
            </div>

            <nav aria-label="Documentation sections" className="mt-6">
              {DOC_GROUPS.map((group) => {
                const items = sections.filter((section) => section.group === group);
                if (items.length === 0) return null;

                return (
                  <div key={group} className="mb-5">
                    <p className="label mb-2">{group}</p>
                    <ul className="space-y-1">
                      {items.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            aria-current={activeId === section.id ? "true" : undefined}
                            onClick={(event) => {
                              event.preventDefault();
                              document
                                .getElementById(section.id)
                                ?.scrollIntoView({ behavior: "smooth", block: "start" });
                              setActiveId(section.id);
                            }}
                            className={`block border-l py-1 pl-3 text-[12.5px] transition-colors ${
                              activeId === section.id
                                ? "border-accent text-fg"
                                : "border-line text-muted hover:text-fg"
                            }`}
                          >
                            {section.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>

          <div>
            {sections.length === 0 ? (
              <div className="panel p-6">
                <p className="text-[14px] text-fg">No section matches “{query}”.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Try a broader term such as execution, isolation, receipts or policy.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 font-mono text-[11px] text-muted underline decoration-line underline-offset-4 hover:text-fg"
                >
                  Clear search
                </button>
              </div>
            ) : (
              sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 border-t border-line py-9 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-[21px] font-medium tracking-[-0.02em]">{section.title}</h2>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-muted/60">
                      {section.group.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted">{section.summary}</p>
                  <div className="mt-5 space-y-4">
                    {section.blocks.map((block, index) => (
                      <Block key={`${section.id}-${index}`} block={block} />
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
