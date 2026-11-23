import React, { useEffect, useRef } from "react";
import { BrandLink } from "./BrandLink";
import { ArrowIcon } from "./Icons";

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
};

export function MobileDrawer({ isOpen, onClose, onSignIn }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const navGroups = [
    {
      title: "Platform",
      items: [
        { label: "Execution environment", href: "#platform", desc: "Change → Execute → Verify" },
        { label: "How a run works", href: "#run", desc: "Five-stage execution timeline" },
        { label: "Sandbox architecture", href: "#architecture", desc: "Isolation boundary & runtime" },
      ],
    },
    {
      title: "Features & Solutions",
      items: [
        { label: "Workflo solutions", href: "#solutions", desc: "Pull request verification & QA" },
        { label: "Core capabilities", href: "#features", desc: "Revision-aware verification" },
        { label: "Security & isolation", href: "#security", desc: "Policy boundaries & teardown" },
        { label: "Evidence receipts", href: "#evidence", desc: "Cryptographic proof of run" },
        { label: "Integrations", href: "#integrations", desc: "CI/CD & source connectors" },
      ],
    },
    {
      title: "Commercial & Docs",
      items: [
        { label: "Pricing / Workflow sizing", href: "#pricing", desc: "Tailored to your repository" },
        { label: "Discuss your workflow", href: "#contact", desc: "Connect with the Workflo team" },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="mobile-drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Mobile Navigation"
    >
      <div className="mobile-drawer-panel" ref={drawerRef}>
        <div className="mobile-drawer-header">
          <BrandLink />
          <button
            className="mobile-drawer-close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-drawer-content">
          {navGroups.map((group) => (
            <div className="mobile-drawer-group" key={group.title}>
              <span className="mono-label">{group.title}</span>
              <div className="mobile-drawer-links">
                {group.items.map((item) => (
                  <a
                    key={item.href + item.label}
                    href={item.href}
                    className="mobile-drawer-link"
                    onClick={onClose}
                  >
                    <div>
                      <div className="mobile-link-label">{item.label}</div>
                      <div className="mobile-link-desc">{item.desc}</div>
                    </div>
                    <span className="mobile-link-arrow">
                      <ArrowIcon diagonal />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mobile-drawer-footer">
          <button
            className="mobile-drawer-signin"
            onClick={() => {
              onClose();
              onSignIn();
            }}
          >
            Sign in
          </button>
          <a
            href="#early-access"
            className="mobile-drawer-cta"
            onClick={onClose}
          >
            <span>Get started</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
