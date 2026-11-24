import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp, stage } from "../scroll/stage";

function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

type Props = {
  compact: boolean;
  reduced: boolean;
};

export function Atmosphere({ compact, reduced }: Props) {
  const count = compact ? 18 : 40;
  const points = useRef<THREE.Points>(null);
  const spin = useRef(0);

  const geometry = useMemo(() => {
    const random = makeRandom(19);
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const radius = 2.4 + random() * 3.4;
      const angle = random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (random() - 0.5) * 5.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 0.6;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, [count]);

  useFrame((_, delta) => {
    if (reduced || !points.current) return;
    spin.current = damp(spin.current, stage.progress, 3, delta);
    points.current.rotation.y = spin.current * 0.32;
    points.current.position.y = spin.current * 0.28;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.022}
        color="#a7adb1"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
