import { Link } from "../lib/router";
import { FOOTER_COLUMNS } from "../content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                <rect x="0.75" y="0.75" width="16.5" height="16.5" stroke="#292e31" fill="none" />
                <rect x="4.25" y="4.25" width="9.5" height="9.5" stroke="#c7f36b" fill="none" />
                <rect x="7.25" y="7.25" width="3.5" height="3.5" fill="#f1f2ee" />
              </svg>
              <span className="text-[14px] font-medium">Workflo</span>
            </div>
            <p className="mt-4 max-w-[38ch] text-[13px] leading-relaxed text-muted">
              Controlled execution, observable activity and evidence-backed trust for software
              teams.
            </p>
            <p className="mt-4 max-w-[44ch] font-mono text-[10.5px] leading-relaxed text-muted/70">
              Workflo is pre-release. Commands, interfaces and receipts shown on this site are
              illustrative and do not describe a shipped product.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="label mb-4">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[13px] text-muted transition-colors hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted/70">
            © {year} WORKFLO
          </p>
          <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted/70">
            SOFTWARE EXECUTION · INDEPENDENTLY VERIFIED
          </p>
        </div>
      </div>
    </footer>
  );
}
