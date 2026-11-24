import { Brand } from "./Brand";
import { BOOKING_HREF } from "../content/booking";
import { scrollToId } from "./smooth";

const LINKS = [
  { label: "product", id: "product" },
  { label: "how it works", id: "how-it-works" },
  { label: "capabilities", id: "capabilities" },
  { label: "proof", id: "proof" },
];

export function Footer() {
  return (
    <footer className="px-6 pb-8 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 rounded-full border border-white/20 px-6 py-4 text-sm sm:flex-row">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            scrollToId("top");
          }}
          className="py-1 text-white transition-colors hover:text-white/70"
        >
          <Brand />
        </a>

        <nav aria-label="footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToId(link.id);
              }}
              className="py-1.5 text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href={BOOKING_HREF}
            className="rounded-full bg-white px-4 py-2 text-black transition-colors hover:bg-neutral-200"
          >
            book a demo
          </a>
        </nav>

        <p className="text-white/50">© workflo</p>
      </div>
    </footer>
  );
}
