import React, { useEffect, useRef, useState } from "react";
import "./cinematic.css";
import { Navigation } from "./components/navigation/Navigation";
import { SignInDialog } from "./components/navigation/SignInDialog";
import { OpeningSequence } from "./components/common/OpeningSequence";
import { useScrollStory } from "./hooks/useScrollStory";
import { usePhotoCamera } from "./hooks/usePhotoCamera";
import { useHeaderTheme } from "./hooks/useHeaderTheme";
import { HeroStory } from "./sections/HeroStory";
import { Solutions } from "./sections/Solutions";
import { Platform } from "./sections/Platform";
import { Features } from "./sections/Features";
import { HowItWorks } from "./sections/HowItWorks";
import { Architecture } from "./sections/Architecture";
import { Security } from "./sections/Security";
import { Evidence } from "./sections/Evidence";
import { Integrations } from "./sections/Integrations";
import { Pricing } from "./sections/Pricing";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";

type Consent = {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  policyVersion: 1;
};
const CONSENT_KEY = "workflo-privacy-consent-v1";
const CONSENT_EVENT = "workflo:consent-change";
const CONSENT_VERSION = 1;

function emptyConsent(): Consent {
  return { essential: true, functional: false, analytics: false, marketing: false, updatedAt: "", policyVersion: CONSENT_VERSION };
}

function parseConsent(raw: string | null): Consent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Consent>;
    if (
      value.policyVersion !== CONSENT_VERSION ||
      typeof value.functional !== "boolean" ||
      typeof value.analytics !== "boolean" ||
      typeof value.marketing !== "boolean" ||
      typeof value.updatedAt !== "string"
    ) return null;
    return { essential: true, functional: value.functional, analytics: value.analytics, marketing: value.marketing, updatedAt: value.updatedAt, policyVersion: CONSENT_VERSION };
  } catch {
    return null;
  }
}

function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [consent, setConsent] = useState<Consent>(emptyConsent());
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    const handleOpenPreferences = () => {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      hasOpenedRef.current = true;
      setOpen(true);
    };
    window.addEventListener("workflo:open-privacy-settings", handleOpenPreferences);
    let existing: Consent | null = null;
    try {
      existing = parseConsent(localStorage.getItem(CONSENT_KEY));
      if (!existing) localStorage.removeItem(CONSENT_KEY);
    } catch {
      // Storage may be unavailable in restrictive browser contexts; keep the
      // essential-only defaults and still expose the user's privacy controls.
      existing = null;
    }
    if (existing) {
      setConsent(existing);
    } else {
      hasOpenedRef.current = true;
      setOpen(true);
    }
    return () => window.removeEventListener("workflo:open-privacy-settings", handleOpenPreferences);
  }, []);

  useEffect(() => {
    if (!open) {
      if (hasOpenedRef.current) restoreFocusRef.current?.focus();
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    const getFocusable = () => Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])'));
    getFocusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const save = (next: Consent) => {
    const value: Consent = { ...next, essential: true, updatedAt: new Date().toISOString(), policyVersion: CONSENT_VERSION };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    } catch {
      setSaved(false);
      return;
    }
    setConsent(value);
    setOpen(false);
    setSaved(true);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  };
  const update = (key: "functional" | "analytics" | "marketing", value: boolean) =>
    setConsent(current => ({ ...current, [key]: value }));

  return <>
    <button className="privacy-reopen" type="button" onClick={() => { restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setOpen(true); }}>Privacy settings</button>
    {open && <div className="consent-backdrop" role="presentation">
      <section className="consent-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="consent-title" aria-describedby="consent-description" tabIndex={-1}>
        <div className="consent-kicker">WORKFLO / PRIVACY CONTROLS</div>
        <h2 id="consent-title">Choose what this site may remember.</h2>
        <p id="consent-description">Essential storage supports core site behaviour and security. Optional categories are off by default. No analytics or advertising vendors are currently installed; enabling a category will not activate a tracker until a reviewed vendor integration is added.</p>
        <div className="consent-row"><div><b>Essential</b><small>Security and core functionality</small></div><span>Always on</span></div>
        {(["functional", "analytics", "marketing"] as const).map(key => <label className="consent-row" key={key}>
          <div><b>{key[0].toUpperCase() + key.slice(1)}</b><small>{key === "functional" ? "Optional interface preferences" : key === "analytics" ? "Site usage and performance measurement" : "Advertising and campaign measurement"}</small></div>
          <input type="checkbox" checked={consent[key]} onChange={e => update(key, e.target.checked)} />
        </label>)}
        <div className="consent-actions">
          <button type="button" onClick={() => save(emptyConsent())}>Reject optional</button>
          <button type="button" onClick={() => save(consent)}>Save preferences</button>
          <button type="button" onClick={() => save({ ...emptyConsent(), functional: true, analytics: true, marketing: true })}>Accept all</button>
        </div>
        <a href="/cookies.html">Read the Cookie Policy</a>
        <p className="consent-save-feedback" role="status" aria-live="polite">{saved ? "Your privacy preferences are saved on this browser." : ""}</p>
      </section>
    </div>}
  </>;
}

export default function App() {
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useScrollStory({ storyRef, stageRef, canvasRef, foregroundCanvasRef });
  usePhotoCamera({ storyRef, stageRef });
  useHeaderTheme(stageRef);

  return (
    <div className="site-shell" id="top">
      <OpeningSequence />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navigation onSignIn={() => setSignInOpen(true)} />
      <main id="main-content">
        <HeroStory storyRef={storyRef} stageRef={stageRef} canvasRef={canvasRef} foregroundCanvasRef={foregroundCanvasRef}/>
        <Solutions />
        <Platform />
        <Features />
        <HowItWorks />
        <Architecture />
        <Security />
        <Evidence />
        <Integrations />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
      <CookiePreferences />
    </div>
  );
}