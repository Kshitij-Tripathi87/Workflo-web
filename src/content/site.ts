export type NavLink = { to: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { to: "/product", label: "Product" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/platform", label: "Platform" },
  { to: "/security", label: "Security" },
  { to: "/integrations", label: "Integrations" },
  { to: "/docs", label: "Documentation" },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { to: "/product", label: "Overview" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/platform", label: "Platform" },
      { to: "/security", label: "Security" },
      { to: "/integrations", label: "Integrations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/docs", label: "Documentation" },
      { to: "/docs#quickstart", label: "Quickstart" },
      { to: "/docs#cli", label: "CLI reference" },
      { to: "/changelog", label: "Changelog" },
      { to: "/early-access", label: "Early access" },
    ],
  },
];
