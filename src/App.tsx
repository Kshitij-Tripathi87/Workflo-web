import React, { useRef, useState } from "react";
import "./cinematic.css";
import { Navigation } from "./components/navigation/Navigation";
import { SignInDialog } from "./components/navigation/SignInDialog";
import { OpeningSequence } from "./components/common/OpeningSequence";
import { useScrollStory } from "./hooks/useScrollStory";
import { usePhotoCamera } from "./hooks/usePhotoCamera";
import { useHeaderTheme } from "./hooks/useHeaderTheme";
import { HeroStory } from "./sections/HeroStory";
import { Solutions } from "./sections/Solutions";
import { Platform } from "./sections/Platform";
import { Features } from "./sections/Features";
import { HowItWorks } from "./sections/HowItWorks";
import { Architecture } from "./sections/Architecture";
import { Security } from "./sections/Security";
import { Evidence } from "./sections/Evidence";
import { Integrations } from "./sections/Integrations";
import { Pricing } from "./sections/Pricing";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";

export default function App() {
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useScrollStory({
    storyRef,
    stageRef,
    canvasRef,
    foregroundCanvasRef,
  });

  usePhotoCamera({ storyRef, stageRef });
  useHeaderTheme(stageRef);

  return (
    <div className="site-shell" id="top">
      <OpeningSequence />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navigation onSignIn={() => setSignInOpen(true)} />
      <main id="main-content">
        <HeroStory
          storyRef={storyRef}
          stageRef={stageRef}
          canvasRef={canvasRef}
          foregroundCanvasRef={foregroundCanvasRef}
        />
        <Solutions />
        <Platform />
        <Features />
        <HowItWorks />
        <Architecture />
        <Security />
        <Evidence />
        <Integrations />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
