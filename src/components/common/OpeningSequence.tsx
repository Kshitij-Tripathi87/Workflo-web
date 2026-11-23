import React,{useEffect,useState} from "react";
const INTRO_MS=5100;
export function OpeningSequence(){
 const [active,setActive]=useState(()=>typeof window!=="undefined"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!window.matchMedia("(max-width: 760px)").matches&&window.scrollY<40);
 useEffect(()=>{
  if(!active)return;
  const skip=()=>{if(window.scrollY>40)setActive(false);};
  window.addEventListener("scroll",skip,{passive:true});
  const id=window.setTimeout(()=>setActive(false),INTRO_MS);
  return()=>{window.removeEventListener("scroll",skip);window.clearTimeout(id);};
 },[active]);
 if(!active)return null;
 return <div className="opening" aria-hidden="true"><i className="opening-panel opening-panel-left"/><i className="opening-panel opening-panel-right"/><span className="opening-seam"/><span className="opening-label">WORKFLO / EXECUTION FACILITY / INITIALISING</span></div>;
}
