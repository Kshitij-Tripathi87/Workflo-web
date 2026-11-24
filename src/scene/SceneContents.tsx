import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, damp, stage } from "../scroll/stage";
import { samplePhase } from "./phases";
import { Atmosphere } from "./Atmosphere";
import { Chamber } from "./Chamber";
import { Ribbons } from "./Ribbons";
import { Traces } from "./Traces";

type Props = {
  reduced: boolean;
  compact: boolean;
  hovered: number | null;
  onHover: (index: number | null) => void;
  onAnchor: (point: { x: number; y: number } | null) => void;
};

export function SceneContents({ reduced, compact, hovered, onHover, onAnchor }: Props) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);

  const rig = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const drag = useRef({ active: false, startX: 0, base: 0, target: 0, offset: 0 });
  const motion = useRef({ progress: 0, pointerX: 0, pointerY: 0 });

  useEffect(() => {
    if (reduced) return;

    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Execution chamber. Drag, or use the left and right arrow keys, to inspect the structure.",
    );

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.current.active = true;
      drag.current.startX = event.clientX;
      drag.current.base = drag.current.target;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.target = clamp(
        drag.current.base + (event.clientX - drag.current.startX) * 0.0026,
        -0.2,
        0.2,
      );
    };

    const onPointerUp = () => {
      drag.current.active = false;
      drag.current.target = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const step = 0.06;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        drag.current.target = clamp(drag.current.target - step, -0.2, 0.2);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        drag.current.target = clamp(drag.current.target + step, -0.2, 0.2);
      } else if (event.key === "Home") {
        drag.current.target = 0;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("keydown", onKeyDown);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("keydown", onKeyDown);
    };
  }, [gl, reduced]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = reduced ? 0 : stage.progress;

    motion.current.progress = damp(motion.current.progress, target, 5.5, dt);
    const sample = samplePhase(motion.current.progress);

    motion.current.pointerX = damp(motion.current.pointerX, reduced ? 0 : state.pointer.x, 3.2, dt);
    motion.current.pointerY = damp(motion.current.pointerY, reduced ? 0 : state.pointer.y, 3.2, dt);

    if (!reduced) {
      drag.current.offset = damp(drag.current.offset, drag.current.target, 4.5, dt);
    }

    if (rig.current) {
      rig.current.rotation.y = motion.current.pointerX * 0.085 + drag.current.offset;
      rig.current.rotation.x = -motion.current.pointerY * 0.045;
    }

    const targetZ = THREE.MathUtils.lerp(sample.current.camera.z, sample.next.camera.z, sample.t);
    const targetY = THREE.MathUtils.lerp(sample.current.camera.y, sample.next.camera.y, sample.t);

    camera.position.z = damp(camera.position.z, targetZ, 3.4, dt);
    camera.position.y = damp(camera.position.y, targetY, 3.4, dt);
    camera.lookAt(0, 0, 0);

    if (keyLight.current) {
      keyLight.current.position.x = motion.current.pointerX * 5.5;
      keyLight.current.position.y = motion.current.pointerY * 3.5 + 2.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight ref={keyLight} position={[4, 3, 6]} intensity={1.7} color="#f1f2ee" />
      <pointLight position={[0, 0, 0]} intensity={compact ? 2.2 : 3} distance={7} color="#c7f36b" />

      <group ref={rig}>
        <group position={compact ? [0, -0.6, 0] : [1.2, 0, 0]} scale={compact ? 0.86 : 1}>
          <Chamber
            reduced={reduced}
            compact={compact}
            hovered={hovered}
            onHover={onHover}
            onAnchor={onAnchor}
          />
          <Traces reduced={reduced} compact={compact} />
          <Atmosphere compact={compact} reduced={reduced} />
          <Ribbons reduced={reduced} compact={compact} />
        </group>
      </group>
    </>
  );
}
