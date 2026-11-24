import { INTEGRATION_TIERS } from "../content/integrations";

export function IntegrationTiers() {
  return (
    <div className="grid gap-px border border-line bg-line md:grid-cols-3">
      {INTEGRATION_TIERS.map((tier) => (
        <div key={tier.id} className="bg-bg p-5">
          <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
            <h3 className="text-[13.5px] font-medium text-fg">{tier.label}</h3>
            <span className="font-mono text-[10px] tracking-[0.12em] text-muted/70">
              {String(tier.items.length).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{tier.note}</p>

          {tier.items.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {tier.items.map((item) => (
                <li key={item.name}>
                  <p className="text-[13px] leading-snug text-fg/90">{item.name}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 font-mono text-[11px] text-muted/60">None</p>
          )}
        </div>
      ))}
    </div>
  );
}
