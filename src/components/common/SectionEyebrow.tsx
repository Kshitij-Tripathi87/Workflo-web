import React from "react";

export function SectionEyebrow({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-eyebrow">
      <span>{number}</span>
      <i />
      {children}
    </div>
  );
}
