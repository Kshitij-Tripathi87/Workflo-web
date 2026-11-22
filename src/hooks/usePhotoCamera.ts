import { RefObject, useEffect } from "react";
import { clamp, smoothstep } from "../components/sandbox/CameraController";

type Props = { storyRef: RefObject<HTMLElement | null>; stageRef: RefObject<HTMLDivElement | null> };
type Pose = { x:number; y:number; scale:number; rotate:number };
type Shot = { key:string; start:number; end:number; pose:(t:number,px:number,py:number,w:number,h:number)=>Pose };

const SHOTS: Shot[] = [
 {key:"exterior",start:0,end:.22,pose:(t,px,py,w,h)=>({x:-px*9-t*w*.012,y:-py*6+t*h*.008,scale:1.035+.17*t,rotate:0})},
 {key:"portal",start:.12,end:.43,pose:(t,px,py,w)=>({x:-px*14-w*.012*t,y:-py*8,scale:1.04+.72*Math.pow(t,1.7),rotate:-.75*t})},
 {key:"hall",start:.36,end:.60,pose:(t,px,py,w,h)=>({x:-px*15+(t-.5)*w*.016,y:-py*7+(.5-t)*h*.09,scale:1.12+.06*t,rotate:(t-.5)*.65})},
 {key:"path",start:.53,end:.78,pose:(t,px,py,w)=>({x:-px*12+(.5-t)*w*.028,y:-py*7,scale:1.06+.22*t,rotate:.35*(1-t)})},
 {key:"sealed",start:.70,end:1,pose:(t,px,py,w)=>({x:-px*11+(.5-t)*w*.044,y:-py*6,scale:1.10+.13*t,rotate:(t-.5)*.8})},
];
const setVar=(stage:HTMLElement,name:string,value:number)=>stage.style.setProperty(name,value.toFixed(4));

/** One scroll-synchronised RAF clock drives camera poses, fades and scene-local floor scans. */
export function usePhotoCamera({storyRef,stageRef}:Props) {
 useEffect(()=>{
  const story=storyRef.current, stage=stageRef.current;
  if(!story||!stage) return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile=window.matchMedia("(max-width: 760px)");
  const records=SHOTS.map(shot=>({shot,element:stage.querySelector<HTMLElement>(`[data-photo="${shot.key}"]`),near:stage.querySelector<HTMLElement>(`[data-photo="${shot.key}"] .scene-photo-near`)}));
  if(records.some(r=>!r.element)) return;
  let raf=0,last=performance.now(),progress=0,px=0,py=0,targetX=0,targetY=0;
  let scrollable=Math.max(1,story.offsetHeight-window.innerHeight);
  const schedule=()=>{if(!raf)raf=window.requestAnimationFrame(paint);};
  const paint=()=>{
   raf=0;const now=performance.now(),dt=Math.min((now-last)/1000,.1);last=now;
   const raw=clamp(-story.getBoundingClientRect().top/scrollable);
   progress+=(raw-progress)*(1-Math.exp(-8*dt));if(Math.abs(raw-progress)<.0005)progress=raw;
   const pa=1-Math.exp(-5*dt);px+=(targetX-px)*pa;py+=(targetY-py)*pa;
   const w=window.innerWidth,h=window.innerHeight,animate=!reduced.matches,compact=mobile.matches;
   records.forEach(({shot,element,near})=>{
    if(!element)return;const t=smoothstep(shot.start,shot.end,progress);
    const pose=!animate?{x:0,y:0,scale:1.035,rotate:0}:compact?{x:-px*4,y:-py*3+(t-.5)*5,scale:1.02+t*.075,rotate:0}:shot.pose(t,px,py,w,h);
    element.style.transform=`translate3d(${pose.x.toFixed(2)}px,${pose.y.toFixed(2)}px,0) rotate(${pose.rotate.toFixed(3)}deg) scale(${pose.scale.toFixed(4)})`;
    if(near)near.style.transform=`translate3d(${(-px*(compact?4:9)).toFixed(2)}px,${(t*(compact?5:11)).toFixed(2)}px,0) scale(${(1+t*(compact?.012:.028)).toFixed(4)})`;
   });
   const transitions:[string,number][]=[["portal",smoothstep(.105,.225,progress)],["hall",smoothstep(.345,.455,progress)],["path",smoothstep(.515,.625,progress)],["sealed",smoothstep(.69,.80,progress)]];
   transitions.forEach(([key,value])=>setVar(stage,`--photo-${key}`,animate?value:0));
   setVar(stage,"--floor-scan",animate?1:0);setVar(stage,"--scan-progress",progress);
   if(Math.abs(raw-progress)>.0008||Math.abs(targetX-px)>.002||Math.abs(targetY-py)>.002)schedule();
  };
  const onPointer=(event:PointerEvent)=>{if(event.pointerType==="touch"||mobile.matches||reduced.matches)return;targetX=clamp((event.clientX/Math.max(1,window.innerWidth)-.5)*2,-1,1);targetY=clamp((event.clientY/Math.max(1,window.innerHeight)-.5)*2,-1,1);schedule();};
  const onResize=()=>{scrollable=Math.max(1,story.offsetHeight-window.innerHeight);schedule();};
  window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("pointermove",onPointer,{passive:true});window.addEventListener("resize",onResize,{passive:true});reduced.addEventListener("change",onResize);mobile.addEventListener("change",onResize);schedule();
  return()=>{window.removeEventListener("scroll",schedule);window.removeEventListener("pointermove",onPointer);window.removeEventListener("resize",onResize);reduced.removeEventListener("change",onResize);mobile.removeEventListener("change",onResize);if(raf)window.cancelAnimationFrame(raf);};
 },[storyRef,stageRef]);
}
