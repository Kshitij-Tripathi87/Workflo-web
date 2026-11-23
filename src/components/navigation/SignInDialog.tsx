import React, { useEffect, useRef } from "react";
import { BrandLink } from "./BrandLink";
import { SectionEyebrow } from "../common/SectionEyebrow";

const workspaceUrl = import.meta.env.VITE_WORKSPACE_URL;

export function SignInDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      className="access-dialog"
      ref={dialogRef}
      aria-labelledby="workspace-access-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Close workspace access dialog">×</button>
      <BrandLink />
      <SectionEyebrow number="WORKSPACE">ACCESS</SectionEyebrow>
      <h2 id="workspace-access-title">Workflo workspace</h2>
      {workspaceUrl ? (
        <>
          <p>Continue to your organisation’s Workflo workspace. Access is controlled by that workspace’s identity provider.</p>
          <a className="button-dark" href={workspaceUrl}>Open workspace <span aria-hidden="true">↗</span></a>
        </>
      ) : (
        <>
          <p>Workspace sign-in is not enabled on this public website yet. No credentials are collected here. Early-access applications are open for teams evaluating the product.</p>
          <a className="button-dark" href="#early-access" onClick={onClose}>Request early access <span aria-hidden="true">↗</span></a>
        </>
      )}
    </dialog>
  );
}
