import React from "react";
import { LogoMark } from "./Icons";

export function BrandLink() {
  return (
    <a href="#top" className="brand-link" aria-label="Workflo home">
      <LogoMark />
      <span>workflo</span>
    </a>
  );
}
