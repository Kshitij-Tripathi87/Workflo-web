export type NavLink = { to: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { to: "/product", label: "Product" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/about", label: "About" },
  { to: "/docs", label: "Documentation" },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { to: "/product", label: "Overview" },
      { to: "/how-it-works", label: "How it works" },
      { to: "/about", label: "Company" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/docs", label: "Documentation" },
      { to: "/docs#receipt-inspector", label: "Receipt Inspector" },
      { to: "/docs#cli", label: "CLI reference" },
      { to: "/changelog", label: "Changelog" },
      { to: "/early-access", label: "Early access" },
    ],
  },
];
