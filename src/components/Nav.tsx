import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { NAV_LINKS } from "../content/site";

function Mark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <rect x="0.75" y="0.75" width="16.5" height="16.5" stroke="#292e31" fill="none" />
      <rect x="4.25" y="4.25" width="9.5" height="9.5" stroke="#c7f36b" fill="none" />
      <rect x="7.25" y="7.25" width="3.5" height="3.5" fill="#f1f2ee" />
    </svg>
  );
}

export function Nav() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (to: string) => path === to || (to === "/docs" && path.startsWith("/docs"));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Workflo home">
          <Mark />
          <span className="text-[15px] font-medium tracking-[-0.01em]">Workflo</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? "page" : undefined}
              className={`text-[13px] transition-colors ${
                isActive(link.to) ? "text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/docs#installation" className="btn btn-primary hidden md:inline-flex">
            Get started
          </Link>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center border border-line text-fg lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true" focusable="false">
              {open ? (
                <path d="M2 2L13 13M13 2L2 13" stroke="currentColor" strokeWidth="1.2" />
              ) : (
                <path d="M1 4H14M1 11H14" stroke="currentColor" strokeWidth="1.2" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-bg lg:hidden">
          <nav aria-label="Mobile" className="shell flex flex-col pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="border-b border-line/60 py-3 text-[14px] text-fg last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/docs#installation" className="btn btn-primary mt-4">
              Get started
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
