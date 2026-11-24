import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  if (instance) {
    instance.scrollTo(el);
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
