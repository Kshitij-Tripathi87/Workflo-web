import React from "react";
import {SectionEyebrow} from "../components/common/SectionEyebrow";
import {DemoReceipt} from "../components/verification/DemoReceipt";
import {ArrowIcon} from "../components/navigation/Icons";
import {capabilityRows,executionSteps,hotspotItems} from "../data/storyData";
const mobileScenes=[
 {src:"/media/pod.webp",name:"01 / EXTERIOR MACHINE",title:"The execution facility"},
 {src:"/media/portal.webp",name:"02 / ISOLATION GATEWAY",title:"Cross the boundary"},
 {src:"/media/hall.webp",name:"03 / EXECUTION CHAMBER",title:"A controlled runtime"},
 {src:"/media/path.webp",name:"04 / EXECUTION PATHWAYS",title:"Every action has a path"},
 {src:"/media/hero-chamber.webp",name:"05 / SEALED MODULE",title:"Contained by design"},
];
export function MobileStory(){
 return <div className="story-reduced">
  <section className="reduced-hero">
   <div className="mobile-scene-frame mobile-scene-hero"><img src="/media/pod.webp" alt="Industrial execution facility above a cloud layer" fetchPriority="high"/><span className="mobile-scene-vignette"/><span className="mobile-scene-code">WF / EXTERIOR / 001</span></div>
   <div className="reduced-hero-copy"><SectionEyebrow number="01">AUTONOMOUS QUALITY ENGINEERING</SectionEyebrow><p className="reduced-brand">Workflo<span>.</span></p><h1>Every change tested.<br/>Every result verifiable.</h1><p className="reduced-lede">A controlled execution environment for software verification, autonomous QA and evidence you can inspect.</p><div className="hero-capabilities"><span>Isolated execution</span><i/><span>Autonomous QA</span><i/><span>Verifiable receipts</span></div></div>
  </section>
  <section className="mobile-scene-sequence" aria-label="The Workflo execution journey">
   {mobileScenes.slice(1).map((scene,index)=><article className={`mobile-scene-card mobile-scene-card-${index+2}`} key={scene.src}><img src={scene.src} alt="" loading="lazy" decoding="async"/><span className="mobile-scene-vignette"/><div className="mobile-scene-copy"><small>{scene.name}</small><h2>{scene.title}</h2><i/></div></article>)}
  </section>
  <section className="reduced-block"><SectionEyebrow number="06">ENTER THE SANDBOX</SectionEyebrow><h2>A run, assembled with intent.</h2><p>Each stage is prepared and recorded as part of a single execution path.</p><ol className="mobile-step-list">{executionSteps.map((step,index)=><li key={step.label}><span>0{index+1}</span><div><b>{step.label}</b><small>{step.note}</small></div><i>+</i></li>)}</ol></section>
  <section className="reduced-block reduced-boundary"><SectionEyebrow number="07">INSIDE THE ISOLATION BOUNDARY</SectionEyebrow><h2>Every run has a defined context.</h2><p>Every execution happens within a controlled environment. Workflo prepares the revision, enforces execution boundaries, governs agent actions and collects evidence from the run.</p><div className="mobile-hotspot-list">{hotspotItems.map(item=><details key={item.id}><summary><span>{item.id}</span>{item.title}<i>+</i></summary><p>{item.text}</p></details>)}</div></section>
  <section className="reduced-block reduced-verification"><SectionEyebrow number="08">VERIFICATION STATION</SectionEyebrow><h2>Execution is only half the story.<br/>Proof is what matters.</h2><DemoReceipt compact/><div className="mobile-capability-list">{capabilityRows.map((row,index)=><div key={row}><span>0{index+1}</span>{row}<ArrowIcon/></div>)}</div></section>
 </div>;
}
