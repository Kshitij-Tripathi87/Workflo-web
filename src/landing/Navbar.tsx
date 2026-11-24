import { Brand } from "./Brand";
import { BOOKING_HREF } from "../content/booking";
import { scrollToId } from "./smooth";

const LINKS = [
  { label: "product", id: "product" },
  { label: "how it works", id: "how-it-works" },
  { label: "capabilities", id: "capabilities" },
  { label: "proof", id: "proof" },
];

export function Navbar() {
  return (
    <nav aria-label="Primary" className="flex items-center justify-between gap-4 px-6 pt-6 md:px-10">
      <a
        href="#top"
        onClick={(event) => {
          event.preventDefault();
          scrollToId("top");
        }}
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-neutral-900/90 py-3 pl-4 pr-6 text-white backdrop-blur transition-colors hover:bg-neutral-900"
      >
        <Brand />
      </a>

      <div className="hidden items-center gap-1 rounded-full bg-neutral-900/90 px-3 py-2 backdrop-blur md:flex">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToId(link.id);
            }}
            className="whitespace-nowrap rounded-full px-5 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href={BOOKING_HREF}
        className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-normal text-black transition-colors hover:bg-neutral-200"
      >
        book a demo
      </a>
    </nav>
  );
}
