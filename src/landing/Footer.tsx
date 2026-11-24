import { Brand } from "./Brand";
import { Link } from "../lib/router";

const LINKS = [
  { label: "product", to: "/product" },
  { label: "how it works", to: "/how-it-works" },
  { label: "about", to: "/about" },
  { label: "docs", to: "/docs" },
];

export function Footer() {
  return (
    <footer className="px-6 pb-8 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 rounded-full border border-white/20 px-6 py-4 text-sm sm:flex-row">
        <Link
          to="/"
          className="py-1 text-white transition-colors hover:text-white/70"
        >
          <Brand />
        </Link>

        <nav aria-label="footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="py-1.5 text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/early-access"
            className="rounded-full bg-white px-4 py-2 text-black transition-colors hover:bg-neutral-200"
          >
            early access
          </Link>
        </nav>

        <p className="text-white/50">© workflo</p>
      </div>
    </footer>
  );
}
