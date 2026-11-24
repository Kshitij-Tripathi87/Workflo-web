import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp, stage } from "../scroll/stage";
import { samplePhase } from "./phases";

const vertexShader = `
  attribute float aT;
  attribute float aSeed;
  varying float vT;
  varying float vSeed;

  void main() {
    vT = aT;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uPhase;
  uniform vec3 uLine;
  uniform vec3 uAccent;
  varying float vT;
  varying float vSeed;

  void main() {
    float head = fract(uTime * 0.11 + vSeed);
    float pulse = smoothstep(0.055, 0.0, abs(vT - head));
    float alpha = 0.05 + pulse * 0.78 * uPhase;
    vec3 color = mix(uLine, uAccent, smoothstep(0.35, 1.0, pulse));
    gl_FragColor = vec4(color, alpha);
  }
`;

function traceGeometry(count: number) {
  const positions: number[] = [];
  const ts: number[] = [];
  const seeds: number[] = [];

  for (let i = 0; i < count; i += 1) {
    const seed = (i * 0.6180339887498949) % 1;
    const angle = seed * Math.PI * 2;
    const lift = ((i % 9) / 9 - 0.5) * 1.6;

    const start = new THREE.Vector3(Math.cos(angle) * 0.3, lift * 0.3, Math.sin(angle) * 0.3);
    const end = new THREE.Vector3(
      Math.cos(angle + 1.15) * 1.5,
      lift * 1.05,
      Math.sin(angle + 1.15) * 1.5,
    );
    const midA = new THREE.Vector3()
      .lerpVectors(start, end, 0.35)
      .add(new THREE.Vector3(Math.cos(angle + 0.4) * 0.42, lift * 0.12, Math.sin(angle + 0.4) * 0.42));
    const midB = new THREE.Vector3()
      .lerpVectors(start, end, 0.7)
      .add(new THREE.Vector3(Math.cos(angle - 0.3) * 0.3, lift * 0.18, Math.sin(angle - 0.3) * 0.3));

    const points = [start, midA, midB, end];

    for (let segment = 0; segment < points.length - 1; segment += 1) {
      const a = points[segment];
      const b = points[segment + 1];
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      ts.push(segment / (points.length - 1), (segment + 1) / (points.length - 1));
      seeds.push(seed, seed);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  return geometry;
}

type Props = {
  reduced: boolean;
  compact: boolean;
};

export function Traces({ reduced, compact }: Props) {
  const count = compact ? 16 : 32;
  const geometry = useMemo(() => traceGeometry(count), [count]);
  const intensity = useRef(0.35);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0.35 },
      uLine: { value: new THREE.Color("#f1f2ee") },
      uAccent: { value: new THREE.Color("#c7f36b") },
    }),
    [],
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);

    if (reduced) return;

    const sample = samplePhase(stage.progress);
    const target =
      sample.current.chamber.trace +
      (sample.next.chamber.trace - sample.current.chamber.trace) * sample.t;
    intensity.current = damp(intensity.current, target, 4, delta);
    uniforms.uPhase.value = intensity.current;
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  );
}
