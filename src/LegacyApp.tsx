import { useEffect, type ComponentType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { PlateBackdrop } from "./components/Plate";
import { Cta } from "./components/ui";
import { useRouter } from "./lib/router";
import { Changelog } from "./pages/Changelog";
import { Docs } from "./pages/Docs";
import { EarlyAccess } from "./pages/EarlyAccess";
import { HowItWorks } from "./pages/HowItWorks";
import { Integrations } from "./pages/Integrations";
import { Platform } from "./pages/Platform";
import { Product } from "./pages/Product";
import { Security } from "./pages/Security";

gsap.registerPlugin(ScrollTrigger);

const PAGES: Record<string, { title: string; Component: ComponentType }> = {
  "/product": { title: "Product — Workflo", Component: Product },
  "/how-it-works": { title: "How it works — Workflo", Component: HowItWorks },
  "/platform": { title: "Platform — Workflo", Component: Platform },
  "/security": { title: "Security — Workflo", Component: Security },
  "/integrations": { title: "Integrations — Workflo", Component: Integrations },
  "/docs": { title: "Documentation — Workflo", Component: Docs },
  "/changelog": { title: "Changelog — Workflo", Component: Changelog },
  "/early-access": { title: "Early access — Workflo", Component: EarlyAccess },
};

function NotFound() {
  return (
    <header className="relative isolate overflow-hidden">
      <PlateBackdrop src="/images/plate-prove.webp" variant="header" />
      <div className="shell relative z-10 flex min-h-[72vh] flex-col justify-center py-24 md:py-32">
        <p className="label">404</p>
        <h1 className="h-display mt-5 max-w-[20ch]">This page was not executed.</h1>
        <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-muted">
          The URL does not match a page on this site. The documentation and the product overview are
          both a reasonable place to continue.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Cta to="/">Back to the homepage</Cta>
          <Cta to="/docs" variant="ghost">
            Documentation
          </Cta>
        </div>
      </div>
    </header>
  );
}

function RouteView() {
  const { path } = useRouter();
  const page = PAGES[path];

  useEffect(() => {
    document.title = page ? page.title : "Page not found — Workflo";
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [page]);

  const Component = page?.Component ?? NotFound;

  return (
    <main id="main">
      <Component />
    </main>
  );
}

export function LegacyApp() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-[13px] focus:text-[#0a0c07]"
      >
        Skip to content
      </a>
      <Nav />
      <RouteView />
      <Footer />
    </>
  );
}
