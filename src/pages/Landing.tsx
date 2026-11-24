import "@fontsource/readex-pro/300.css";
import "@fontsource/readex-pro/400.css";
import "@fontsource/readex-pro/500.css";
import "@fontsource/readex-pro/600.css";
import "@fontsource/readex-pro/700.css";
import "../landing/landing.css";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Capabilities } from "../landing/Capabilities";
import { Decision } from "../landing/Decision";
import { Footer } from "../landing/Footer";
import { FinalCta } from "../landing/FinalCta";
import { Hero } from "../landing/Hero";
import { HowItWorks } from "../landing/HowItWorks";
import { Proof } from "../landing/Proof";
import { setLenis } from "../landing/smooth";
import { useReducedMotion } from "../lib/hooks";

gsap.registerPlugin(ScrollTrigger);

const TITLE = "workflo — release with proof";

export function Landing() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const previous = document.title;
    document.title = TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    if (reduced) return;

    // One scroll engine: Lenis advances from the GSAP ticker, and ScrollTrigger
    // reads Lenis scroll events. No second rAF loop is created.
    const lenis = new Lenis({ autoRaf: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
      setLenis(null);
      lenis.destroy();
    };
  }, [reduced]);

  return (
    <>
      <a href="#product" className="skip-link">
        skip to content
      </a>
      <main id="main" className="landing">
      <Hero />
      <HowItWorks />
      <Decision />
      <Capabilities />
      <Proof />
      <FinalCta />
        <Footer />
      </main>
    </>
  );
}
