import { FormEvent, useEffect, useRef, useState } from "react";
import "./cinematic.css";

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
  return {
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
    updatedAt: "",
    policyVersion: CONSENT_VERSION,
  };
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
    return {
      essential: true,
      functional: value.functional,
      analytics: value.analytics,
      marketing: value.marketing,
      updatedAt: value.updatedAt,
      policyVersion: CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>(emptyConsent());
  const [storageError, setStorageError] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    const handleOpen = () => {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      hasOpenedRef.current = true;
      setOpen(true);
    };
    window.addEventListener("workflo:open-privacy-settings", handleOpen);

    let existing: Consent | null = null;
    try {
      existing = parseConsent(localStorage.getItem(CONSENT_KEY));
      if (!existing) localStorage.removeItem(CONSENT_KEY);
    } catch {
      existing = null;
    }

    if (existing) setConsent(existing);
    else {
      hasOpenedRef.current = true;
      setOpen(true);
    }

    return () => window.removeEventListener("workflo:open-privacy-settings", handleOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      if (hasOpenedRef.current) restoreFocusRef.current?.focus();
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );

    getFocusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const save = (next: Consent) => {
    const value: Consent = {
      ...next,
      essential: true,
      updatedAt: new Date().toISOString(),
      policyVersion: CONSENT_VERSION,
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
      setStorageError(false);
    } catch {
      setStorageError(true);
      return;
    }

    setConsent(value);
    setOpen(false);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  };

  const update = (
    key: "functional" | "analytics" | "marketing",
    value: boolean,
  ) => setConsent((current) => ({ ...current, [key]: value }));

  return (
    <>
      {open && (
        <div
          className="consent-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="consent-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-description"
            tabIndex={-1}
          >
            <p className="eyebrow">Workflo / Privacy controls</p>
            <h2 id="consent-title">Privacy preferences</h2>
            <p id="consent-description" className="consent-intro">
              Essential storage supports core site behaviour. Optional categories are off by
              default. No analytics or advertising vendors are installed; enabling a category
              will not activate a tracker until a reviewed integration is added.
            </p>

            <div className="consent-option">
              <div>
                <strong>Essential</strong>
                <span>Security and core functionality</span>
              </div>
              <span className="consent-always">Always on</span>
            </div>

            {(["functional", "analytics", "marketing"] as const).map((key) => (
              <label className="consent-option" key={key}>
                <span>
                  <strong>{key[0].toUpperCase() + key.slice(1)}</strong>
                  <span>
                    {key === "functional"
                      ? "Optional interface preferences"
                      : key === "analytics"
                        ? "Site usage and performance measurement"
                        : "Advertising and campaign measurement"}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={consent[key]}
                  onChange={(event) => update(key, event.target.checked)}
                />
              </label>
            ))}

            {storageError && (
              <p className="form-message is-error" role="alert">
                This browser did not allow preferences to be saved. Check its storage settings
                and try again.
              </p>
            )}

            <div className="consent-actions">
              <button className="button button-quiet" type="button" onClick={() => save(emptyConsent())}>
                Reject optional
              </button>
              <button className="button button-outline" type="button" onClick={() => save(consent)}>
                Save preferences
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={() =>
                  save({
                    essential: true,
                    functional: true,
                    analytics: true,
                    marketing: true,
                    updatedAt: "",
                    policyVersion: CONSENT_VERSION,
                  })
                }
              >
                Accept all
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

const runStages = [
  {
    number: "01",
    title: "Pin the revision",
    description: "Select the commit and workspace that define what is under test.",
  },
  {
    number: "02",
    title: "Set the boundaries",
    description: "Set the filesystem, network and agent-action boundaries for execution.",
  },
  {
    number: "03",
    title: "Run and inspect",
    description: "Execute tests and governed probes. Keep outcomes linked to the run record.",
  },
];

const accessSizes = ["1", "2-5", "6-20", "21-50", "51-200", "200+"] as const;

type AccessFields = {
  name: string;
  email: string;
  company: string;
  teamSize: (typeof accessSizes)[number];
  useCase: string;
  consentToReply: boolean;
  website: string;
};

function EarlyAccessForm() {
  const [fields, setFields] = useState<AccessFields>({
    name: "",
    email: "",
    company: "",
    teamSize: "2-5",
    useCase: "",
    consentToReply: false,
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const update = (key: keyof AccessFields, value: string | boolean) => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/v1/early-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...fields,
          role: "",
          workflow: "",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.accepted) {
        throw new Error("The application could not be confirmed.");
      }

      setStatus("sent");
      setFeedback("Your request has been received. The Workflo team can follow up by email.");
      setFields({
        name: "",
        email: "",
        company: "",
        teamSize: "2-5",
        useCase: "",
        consentToReply: false,
        website: "",
      });
    } catch {
      setStatus("error");
      setFeedback(
        "We could not submit the request. The access service may not be configured yet. Please try again later.",
      );
    }
  }

  return (
    <form className="access-form" onSubmit={submit} aria-describedby="access-status">
      <div className="form-grid">
        <label>
          Name
          <input
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={fields.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          Work email
          <input
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={fields.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        <label>
          Company
          <input
            required
            minLength={2}
            maxLength={160}
            autoComplete="organization"
            value={fields.company}
            onChange={(event) => update("company", event.target.value)}
          />
        </label>
        <label>
          Team size
          <select
            value={fields.teamSize}
            onChange={(event) =>
              update("teamSize", event.target.value as AccessFields["teamSize"])
            }
          >
            {accessSizes.map((size) => (
              <option value={size} key={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="form-wide">
          What would you like to verify?
          <textarea
            required
            minLength={20}
            maxLength={3000}
            rows={4}
            value={fields.useCase}
            onChange={(event) => update("useCase", event.target.value)}
          />
        </label>
      </div>

      <label className="reply-consent">
        <input
          type="checkbox"
          required
          checked={fields.consentToReply}
          onChange={(event) => update("consentToReply", event.target.checked)}
        />
        <span>Workflo may contact me about this request.</span>
      </label>

      <label className="honeypot" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </label>

      <div className="form-submit-row">
        <button className="button button-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending request…" : "Request early access"}
          <span aria-hidden="true">↗</span>
        </button>
        <span className="form-footnote">No payment details required.</span>
      </div>
      <p
        className={status === "error" ? "form-message is-error" : "form-message"}
        id="access-status"
        role="status"
        aria-live="polite"
      >
        {feedback}
      </p>
    </form>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const evidenceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = evidenceRef.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            root.classList.add("is-revealed");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.24 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Workflo home" onClick={closeMenu}>
            <span className="brand-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Workflo</span>
          </a>

          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#process">How it works</a>
            <a href="#evidence">Evidence</a>
            <a href="#security">Security</a>
          </nav>

          <a className="button button-primary header-cta" href="#access">
            Request access <span aria-hidden="true">↗</span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            <a href="#process" onClick={closeMenu}>How it works</a>
            <a href="#evidence" onClick={closeMenu}>Evidence</a>
            <a href="#security" onClick={closeMenu}>Security</a>
            <a href="#access" onClick={closeMenu}>Request access ↗</a>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy" data-enter>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Autonomous software verification
              </p>
              <h1>Verify every change before it ships.</h1>
              <p className="hero-lead">Run tests and governed agent probes in an isolated workspace. Tie each result to its source revision and run policy.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#access">
                  Request early access <span aria-hidden="true">↗</span>
                </a>
                <a className="text-link" href="#process">
                  See how it works <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="hero-spec">
                <span>Isolated execution</span>
                <i />
                <span>Signed run records</span>
              </div>
            </div>

            <div className="hero-visual" data-enter="visual">
              <div className="photo-frame hero-photo">
                <img
                  src="/media/pod.webp"
                  alt="Industrial execution chamber in a dark architectural setting"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>

            </div>
          </div>
          <div className="hero-bottom container" aria-hidden="true"><span>Scroll to explore <b>↓</b></span></div>
        </section>

        <section className="section process-section" id="process">
          <div className="container">
            <div className="section-heading section-heading-row">
              <div>
                <p className="eyebrow">01 / The run</p>
                <h2>One run. Three steps.</h2>
              </div>
              <p className="section-lead">
                Each run stays tied to its commit, policy and collected evidence.
              </p>
            </div>

            <div className="process-grid">
              <div className="photo-frame process-photo">
                <img
                  src="/media/portal.webp"
                  alt="A circular gateway opening into a controlled industrial space"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="stage-list">
                {runStages.map((stage) => (
                  <article className="stage-row" key={stage.number}>
                    <span className="stage-number">{stage.number}</span>
                    <div>
                      <h3>{stage.title}</h3>
                      <p>{stage.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section evidence-section" id="evidence" ref={evidenceRef}>
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">02 / Evidence</p>
              <h2>Every result has a record.</h2>
              <p className="section-lead">
                Revision, run policy, activity and artifacts are kept together for inspection.
              </p>
            </div>

            <div className="evidence-grid">
              <div className="photo-frame evidence-photo">
                <img
                  src="/media/hero-chamber.webp"
                  alt="A sealed glass execution module viewed from outside"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="receipt-card" aria-label="Illustrative Workflo run receipt">
                <div className="receipt-header">
                  <span>Workflo / Run receipt</span>
                  <span className="receipt-status"><i /> Example record</span>
                </div>
                <div className="receipt-title">
                  <div>
                    <span className="mono-label">RECORD TYPE</span>
                    <h3>Verification run</h3>
                  </div>
                  <span className="receipt-seal" aria-hidden="true">WF</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-line">
                  <span>Source revision</span>
                  <strong>Linked to run</strong>
                </div>
                <div className="receipt-line">
                  <span>Run policy</span>
                  <strong>Recorded</strong>
                </div>
                <div className="receipt-line">
                  <span>Agent activity</span>
                  <strong>Summarised</strong>
                </div>
                <div className="receipt-line">
                  <span>Evidence manifest</span>
                  <strong>Attached</strong>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="section security-section" id="security">
          <div className="container security-grid">
            <div className="security-copy">
              <p className="eyebrow">03 / Execution boundaries</p>
              <h2>Set boundaries before code runs.</h2>
              <p className="section-lead">
                Filesystem access, network access and agent actions follow the controls configured
                for each execution. Runtime activity and teardown checks contribute to the run
                record.
              </p>
              <div className="boundary-list">
                <div><span>01</span><strong>Filesystem scope</strong></div>
                <div><span>02</span><strong>Network policy</strong></div>
                <div><span>03</span><strong>Governed agent actions</strong></div>
                <div><span>04</span><strong>Teardown verification</strong></div>
              </div>
              <p className="security-note">
                Available controls depend on the selected runtime and run configuration.
              </p>
            </div>
            <div className="photo-frame security-photo">
              <img
                src="/media/path.webp"
                alt="A branching corridor illuminated by a controlled line of light"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section className="access-section" id="access">
          <div className="container access-grid">
            <div className="access-copy">
              <p className="eyebrow">04 / Early access</p>
              <h2>Bring us a workflow to verify.</h2>
              <p>
                Tell us what your team needs to test. We’ll review the use case and follow up
                about the current product fit.
              </p>
              <div className="access-photo photo-frame">
                <img
                  src="/media/hall.webp"
                  alt="A long industrial testing hall"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="access-form-wrap">
              <div className="access-form-heading">
                <span>Request access</span>
                <span className="mono-label">01 / APPLICATION</span>
              </div>
              <EarlyAccessForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <a className="brand footer-brand" href="#top" aria-label="Workflo home">
            <span className="brand-symbol" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span>Workflo</span>
          </a>
          <p>Software verification with evidence attached.</p>
          <nav aria-label="Footer links">
            <a href="/privacy.html">Privacy</a>
            <a href="/cookies.html">Cookies</a>
            <a href="/terms.html">Terms</a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("workflo:open-privacy-settings"))}
            >
              Privacy settings
            </button>
          </nav>
        </div>
        <div className="container footer-bottom">
          <span>© Workflo</span>
          <span>Controlled execution / Inspectable evidence</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      <CookiePreferences />
    </div>
  );
}
