import React, { useEffect, useRef, useState } from "react";
import { BrandLink } from "./BrandLink";
import { ArrowIcon, MenuChevron } from "./Icons";
import { MobileDrawer } from "./MobileDrawer";

type NavigationProps = {
  onSignIn: () => void;
};

export function Navigation({ onSignIn }: NavigationProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const menus = {
    Platform: [
      { label: "Execution environment", href: "#platform" },
      { label: "Run lifecycle", href: "#run" },
      { label: "Sandbox architecture", href: "#architecture" },
    ],
    Features: [
      { label: "Workflo solutions", href: "#solutions" },
      { label: "Core capabilities", href: "#features" },
      { label: "Policy boundaries", href: "#security" },
      { label: "Evidence receipts", href: "#evidence" },
      { label: "Integrations", href: "#integrations" },
    ],
    Docs: [
      { label: "Architecture overview", href: "#architecture" },
      { label: "Receipt format", href: "#evidence" },
      { label: "Integrations guide", href: "#integrations" },
      { label: "Privacy policy", href: "/privacy.html" },
      { label: "Cookie policy", href: "/cookies.html" },
      { label: "Terms of service", href: "/terms.html" },
    ],
  };

  const toggleMenu = (name: string) =>
    setOpenMenu((current) => (current === name ? null : name));

  return (
    <>
      <header className="site-header" ref={navRef}>
        <div className="nav-grid">
          <BrandLink />

          <nav className="primary-nav" aria-label="Main navigation">
            {(["Platform", "Features"] as const).map((name) => (
              <div className="nav-menu-wrap" key={name}>
                <button
                  className={`nav-menu-trigger ${openMenu === name ? "is-open" : ""}`}
                  aria-expanded={openMenu === name}
                  onClick={() => toggleMenu(name)}
                >
                  {name}
                  <MenuChevron />
                </button>
                <div
                  className={`nav-dropdown ${openMenu === name ? "is-open" : ""}`}
                  aria-hidden={openMenu !== name}
                >
                  {menus[name].map((item) => (
                    <a
                      key={item.href + item.label}
                      href={item.href}
                      tabIndex={openMenu === name ? 0 : -1}
                      onClick={() => setOpenMenu(null)}
                    >
                      {item.label}
                      <span>
                        <ArrowIcon diagonal />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <a className="nav-direct" href="#early-access">
              Early access
            </a>
            <div className="nav-menu-wrap">
              <button
                className={`nav-menu-trigger ${openMenu === "Docs" ? "is-open" : ""}`}
                aria-expanded={openMenu === "Docs"}
                onClick={() => toggleMenu("Docs")}
              >
                Docs
                <MenuChevron />
              </button>
              <div
                className={`nav-dropdown ${openMenu === "Docs" ? "is-open" : ""}`}
                aria-hidden={openMenu !== "Docs"}
              >
                {menus.Docs.map((item) => (
                  <a
                    key={item.href + item.label}
                    href={item.href}
                    tabIndex={openMenu === "Docs" ? 0 : -1}
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.label}
                    <span>
                      <ArrowIcon diagonal />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </nav>

          <div className="nav-actions">
            <button className="sign-in-link" onClick={onSignIn}>
              Workspace access
            </button>
            <a href="#early-access" className="nav-cta">
              <span>Request early access</span>
              <span className="nav-cta-arrow">
                <ArrowIcon />
              </span>
            </a>
            <button
              className="mobile-nav-toggle"
              aria-label="Open mobile navigation drawer"
              aria-expanded={mobileDrawerOpen}
              onClick={() => setMobileDrawerOpen(true)}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onSignIn={onSignIn}
      />
    </>
  );
}
