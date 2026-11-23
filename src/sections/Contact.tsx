import React, { FormEvent, useState } from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    inquiryType: "product",
    message: "",
    consentToReply: false,
    website: "",
  });

  const update = (key: keyof typeof fields, value: string | boolean) =>
    setFields((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.accepted) throw new Error("Submission could not be confirmed.");
      setStatus("sent");
      setMessage("Your enquiry has been received. The Workflo team can follow up using the email you provided.");
      setFields({ name: "", email: "", company: "", role: "", inquiryType: "product", message: "", consentToReply: false, website: "" });
    } catch {
      setStatus("error");
      setMessage("We could not submit your enquiry. Please try again, or email the team directly.");
    }
  }

  return (
    <section className="contact-section" id="contact">
      <img className="contact-photo" src="/media/pod.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"/>
      <div className="contact-photo-grade" aria-hidden="true"/>
      <div className="contact-noise" aria-hidden="true"/>
      <div className="contact-content">
        <SectionEyebrow number="14">START A TECHNICAL CONVERSATION</SectionEyebrow>
        <h2>Bring us the<br/>workflow you need to trust.</h2>
        <p>Tell us about your repository, runtime and verification requirements. We will use the details only to respond to this enquiry.</p>
        <form className="contact-form" onSubmit={submit} aria-describedby="contact-status">
          <div className="contact-form-grid">
            <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={120} value={fields.name} onChange={e=>update("name",e.target.value)}/></label>
            <label>Work email<input name="email" type="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={e=>update("email",e.target.value)}/></label>
            <label>Company<input name="company" autoComplete="organization" maxLength={160} value={fields.company} onChange={e=>update("company",e.target.value)}/></label>
            <label>Role<input name="role" autoComplete="organization-title" maxLength={120} value={fields.role} onChange={e=>update("role",e.target.value)}/></label>
            <label className="contact-form-wide">What is this about?
              <select value={fields.inquiryType} onChange={e=>update("inquiryType",e.target.value)}>
                <option value="product">Product evaluation</option><option value="security">Security and architecture</option><option value="partnership">Partnership</option><option value="privacy">Privacy or data request</option><option value="other">Something else</option>
              </select>
            </label>
            <label className="contact-form-wide">What are you trying to verify?
              <textarea required minLength={10} maxLength={5000} rows={4} value={fields.message} onChange={e=>update("message",e.target.value)}/>
            </label>
          </div>
          <label className="contact-consent"><input type="checkbox" required checked={fields.consentToReply} onChange={e=>update("consentToReply",e.target.checked)}/> I agree that Workflo may use these details to respond to this enquiry.</label>
          <label className="contact-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={fields.website} onChange={e=>update("website",e.target.value)}/></label>
          <button className="button-light" type="submit" disabled={status==="sending"}>{status==="sending"?"Sending…":"Send enquiry"} <ArrowIcon/></button>
          <p id="contact-status" role="status" aria-live="polite" className={`contact-feedback is-${status}`}>{message}</p>
        </form>
      </div>
      <div className="contact-side-note"><span>WORKFLO / AUTONOMOUS QUALITY ENGINEERING</span><i/><b>CONTROLLED EXECUTION.<br/>EVIDENCE THAT CONNECTS.</b></div>
    </section>
  );
}
