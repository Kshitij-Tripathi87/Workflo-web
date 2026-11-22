import React, { FormEvent, useEffect, useRef, useState } from "react";
import { BrandLink } from "./BrandLink";
import { ArrowIcon } from "./Icons";
import { SectionEyebrow } from "../common/SectionEyebrow";

export function SignInDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <dialog
      className="access-dialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <button
        className="dialog-close"
        onClick={onClose}
        aria-label="Close sign in dialog"
      >
        ✕
      </button>
      <BrandLink />
      <SectionEyebrow number="WORKSPACE">ACCESS</SectionEyebrow>
      <h2>Sign in to Workflo.</h2>
      <p>
        This preview is not connected to a live workspace. Use your
        organization-provided sign-in link to access a deployed Workflo
        environment.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="workflo-email">Work email</label>
        <input
          ref={inputRef}
          id="workflo-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <button className="button-dark" type="submit">
          {submitted ? "Request noted" : "Continue"}
          <ArrowIcon />
        </button>
      </form>
      {submitted && (
        <p className="dialog-note" role="status">
          No sign-in request was sent. Connect your identity provider to enable
          workspace access.
        </p>
      )}
    </dialog>
  );
}
