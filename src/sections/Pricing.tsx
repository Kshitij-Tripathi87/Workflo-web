import React, { FormEvent, useState } from "react";
import { SectionEyebrow } from "../components/common/SectionEyebrow";
import { ArrowIcon } from "../components/navigation/Icons";

type Status = "idle" | "sending" | "sent" | "error";

export function Pricing() {
  const [status,setStatus] = useState<Status>("idle");
  const [feedback,setFeedback] = useState("");
  const [fields,setFields] = useState({
    name:"", email:"", company:"", role:"", teamSize:"2-5",
    useCase:"", workflow:"", consentToReply:false, website:""
  });
  const update=(key:keyof typeof fields,value:string|boolean)=>setFields(current=>({...current,[key]:value}));

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setStatus("sending"); setFeedback("");
    try{
      const response=await fetch("/api/v1/early-access",{
        method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(fields)
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||!payload.accepted) throw new Error("The application could not be confirmed.");
      setStatus("sent");
      setFeedback("Your early-access application has been received. We will review it and contact you at the address provided.");
      setFields({name:"",email:"",company:"",role:"",teamSize:"2-5",useCase:"",workflow:"",consentToReply:false,website:""});
    }catch{
      setStatus("error"); setFeedback("We could not submit your application. Please try again.");
    }
  }

  return (
    <section className="pricing-section section-pad" id="early-access">
      <div className="early-access-intro">
        <SectionEyebrow number="13">EARLY ACCESS / ENGINEERING PREVIEW</SectionEyebrow>
        <h2>Bring us the workflow<br/>you need to verify.</h2>
        <p>Workflo is opening access to teams that want controlled software verification and inspectable execution evidence. Tell us what you need to test.</p>
        <div className="early-access-facts">
          <div><span>01</span><b>Review</b><small>We review the use case and environment.</small></div>
          <div><span>02</span><b>Scope</b><small>We confirm whether the current product fits.</small></div>
          <div><span>03</span><b>Invite</b><small>Selected teams receive an access follow-up.</small></div>
        </div>
        <a href="#contact" className="text-link">Prefer a conversation? Contact the team <ArrowIcon/></a>
      </div>
      <form className="early-access-form" onSubmit={submit} aria-describedby="early-access-status">
        <div className="early-access-form-heading"><span>APPLICATION / 01</span><span>NO PAYMENT REQUIRED</span></div>
        <div className="early-access-grid">
          <label>Full name<input required minLength={2} maxLength={120} autoComplete="name" value={fields.name} onChange={e=>update("name",e.target.value)}/></label>
          <label>Work email<input required type="email" maxLength={254} autoComplete="email" value={fields.email} onChange={e=>update("email",e.target.value)}/></label>
          <label>Company<input required minLength={2} maxLength={160} autoComplete="organization" value={fields.company} onChange={e=>update("company",e.target.value)}/></label>
          <label>Role<input maxLength={120} autoComplete="organization-title" value={fields.role} onChange={e=>update("role",e.target.value)}/></label>
          <label className="early-access-wide">Team size<select value={fields.teamSize} onChange={e=>update("teamSize",e.target.value)}><option value="1">1</option><option value="2-5">2–5</option><option value="6-20">6–20</option><option value="21-50">21–50</option><option value="51-200">51–200</option><option value="200+">200+</option></select></label>
          <label className="early-access-wide">What would you use Workflo to verify?<textarea rows={4} minLength={20} maxLength={3000} required value={fields.useCase} onChange={e=>update("useCase",e.target.value)}/></label>
          <label className="early-access-wide">Current development and testing workflow (optional)<textarea rows={3} maxLength={2000} value={fields.workflow} onChange={e=>update("workflow",e.target.value)}/></label>
        </div>
        <label className="early-access-consent"><input type="checkbox" required checked={fields.consentToReply} onChange={e=>update("consentToReply",e.target.checked)}/> Workflo may use these details to review this application and contact me about early access.</label>
        <label className="early-access-honeypot" aria-hidden="true">Leave blank<input tabIndex={-1} autoComplete="off" value={fields.website} onChange={e=>update("website",e.target.value)}/></label>
        <button className="button-dark" type="submit" disabled={status==="sending"}>{status==="sending"?"Submitting…":"Submit application"} <ArrowIcon/></button>
        <p id="early-access-status" className={`early-access-feedback is-${status}`} role="status" aria-live="polite">{feedback}</p>
        <small className="early-access-privacy">Application information is used to review and respond to this request. See the <a href="/privacy.html">Privacy Policy</a>.</small>
      </form>
    </section>
  );
}
