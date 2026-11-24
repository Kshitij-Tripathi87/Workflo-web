import { useState } from "react";
import { Brand } from "./Brand";
import { Link, useRouter } from "../lib/router";

const LINKS = [
  { label: "product", to: "/product" },
  { label: "how it works", to: "/how-it-works" },
  { label: "about", to: "/about" },
  { label: "docs", to: "/docs" },
];

export function Navbar() {
  const { path } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50">
      <nav aria-label="Primary" className="flex items-center justify-between gap-4 px-6 pt-6 md:px-10">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-neutral-900/90 py-3 pl-4 pr-6 text-white backdrop-blur transition-colors hover:bg-neutral-900"
        >
          <Brand />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 rounded-full bg-neutral-900/90 px-3 py-2 backdrop-blur md:flex">
          {LINKS.map((link) => {
            const isActive = path === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/early-access"
            className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
          >
            early access
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/90 text-white backdrop-blur md:hidden"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l12 12M15 3L3 15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 5h14M2 13h14" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mx-6 mt-3 flex flex-col gap-2 rounded-2xl bg-neutral-900/95 p-4 text-white backdrop-blur md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm transition-colors ${
                path === link.to ? "bg-white/10 text-white font-medium" : "text-neutral-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
