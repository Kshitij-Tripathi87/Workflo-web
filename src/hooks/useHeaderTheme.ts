import {RefObject,useEffect} from "react";
/** Fixed nav stays light over editorial content and dark over the execution story. */
export function useHeaderTheme(stageRef:RefObject<HTMLDivElement|null>){
 useEffect(()=>{
  const stage=stageRef.current,header=document.querySelector<HTMLElement>(".site-header");
  const story=stage?.closest<HTMLElement>(".story");if(!stage||!header||!story)return;
  let raf=0;
  const update=()=>{raf=0;const rect=story.getBoundingClientRect();const overStory=rect.top<=76&&rect.bottom>76;header.classList.toggle("is-light",!overStory);};
  const schedule=()=>{if(!raf)raf=window.requestAnimationFrame(update);};
  window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule,{passive:true});update();
  return()=>{window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);if(raf)window.cancelAnimationFrame(raf);header.classList.remove("is-light");};
 },[stageRef]);
}
