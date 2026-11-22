import React from "react";
import {SectionEyebrow} from "../components/common/SectionEyebrow";
import {ArrowIcon} from "../components/navigation/Icons";
export function Contact(){
 return <section className="contact-section" id="contact">
  <img className="contact-photo" src="/media/pod.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" onError={event=>{event.currentTarget.style.display="none";}}/>
  <div className="contact-photo-grade" aria-hidden="true"/><div className="contact-noise" aria-hidden="true"/>
  <div className="contact-content"><SectionEyebrow number="14">MAKE THE NEXT CHANGE VERIFIABLE</SectionEyebrow><h2>Ship with a clearer<br/>kind of confidence.</h2><p>Bring your source, runtime and verification needs. Start with the boundary you need to trust.</p><a className="button-light" href="#platform">Explore Workflo <ArrowIcon/></a></div>
  <div className="contact-side-note"><span>WORKFLO / AUTONOMOUS QUALITY ENGINEERING</span><i/><b>CONTROLLED EXECUTION.<br/>EVIDENCE THAT CONNECTS.</b></div>
 </section>;
}
