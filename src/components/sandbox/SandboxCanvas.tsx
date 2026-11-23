import React, { forwardRef } from "react";
type SandboxCanvasProps={backgroundCanvasRef:React.RefObject<HTMLCanvasElement|null>;foregroundCanvasRef:React.RefObject<HTMLCanvasElement|null>};
const PHOTOS=[
 {key:"exterior",src:"/media/pod.webp",priority:true},
 {key:"portal",src:"/media/portal.webp",priority:false},
 {key:"hall",src:"/media/hall.webp",priority:false},
 {key:"path",src:"/media/path.webp",priority:false},
 {key:"sealed",src:"/media/hero-chamber.webp",priority:false},
] as const;
const hideOnError=(event:React.SyntheticEvent<HTMLImageElement>)=>{event.currentTarget.style.display="none";};
export const SandboxCanvas=forwardRef<HTMLDivElement,SandboxCanvasProps>((_props,_ref)=>(
 <>
  <div className="scene-backdrop" aria-hidden="true"/>
  <div className="scene-photos" aria-hidden="true">
   {PHOTOS.map(photo=>(
    <div className={`scene-photo scene-photo-${photo.key}`} data-photo={photo.key} key={photo.key}>
     <img className="scene-photo-base" src={photo.src} alt="" draggable={false} decoding="async" fetchPriority={photo.priority?"high":"auto"} loading={photo.priority?"eager":"lazy"} onError={hideOnError}/>
     <img className="scene-photo-near" src={photo.src} alt="" draggable={false} decoding="async" loading="lazy" aria-hidden="true" onError={hideOnError}/>
     <span className="scene-photo-scrim"/>
     <span className="scene-floor-scan"/>
    </div>
   ))}
  </div>
  <div className="scene-fog scene-fog-a" aria-hidden="true"/>
  <div className="scene-fog scene-fog-b" aria-hidden="true"/>
  <div className="scene-mist" aria-hidden="true"/>
  <div className="scene-grain" aria-hidden="true"/>
 </>
));
SandboxCanvas.displayName="SandboxCanvas";
