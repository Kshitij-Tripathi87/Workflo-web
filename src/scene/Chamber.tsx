import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { damp, lerp, stage } from "../scroll/stage";
import { samplePhase } from "./phases";

export const LAYERS = [
  {
    id: "execution",
    label: "Execution boundary",
    detail: "Repository, revision, dependencies and runtime are pinned before the run starts.",
  },
  {
    id: "isolation",
    label: "Isolation boundary",
    detail: "Filesystem, process and network limits are declared per execution.",
  },
  {
    id: "policy",
    label: "Policy surface",
    detail: "Security policies are applied around the run and evaluated against recorded activity.",
  },
] as const;

const SHELLS: { size: [number, number, number]; opacity: number }[] = [
  { size: [3.6, 3.0, 3.6], opacity: 0.05 },
  { size: [2.7, 2.35, 2.7], opacity: 0.062 },
  { size: [1.9, 1.7, 1.9], opacity: 0.082 },
];

const MARKERS: [number, number, number][] = [
  [1.56, 1.24, 1.84],
  [1.12, 0.9, 1.4],
  [0.76, 0.6, 1.0],
];

const DISCS = [0, 1, 2, 3, 4];

type Props = {
  reduced: boolean;
  compact: boolean;
  hovered: number | null;
  onHover: (index: number | null) => void;
  onAnchor: (point: { x: number; y: number } | null) => void;
};

export function Chamber({ hovered, onHover, onAnchor, reduced }: Props) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const groups = useRef<(THREE.Group | null)[]>([]);
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const edgeMaterials = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const markerRefs = useRef<(THREE.Object3D | null)[]>([]);
  const core = useRef<THREE.Group>(null);
  const smooth = useRef(0);
  const world = useMemo(() => new THREE.Vector3(), []);

  const edgeGeometries = useMemo(
    () =>
      SHELLS.map(({ size: dims }) => {
        const box = new THREE.BoxGeometry(...dims);
        const edges = new THREE.EdgesGeometry(box, 15);
        box.dispose();
        return edges;
      }),
    [],
  );

  useEffect(() => {
    return () => {
      edgeGeometries.forEach((geometry) => geometry.dispose());
    };
  }, [edgeGeometries]);

  useEffect(() => {
    if (hovered === null) onAnchor(null);
  }, [hovered, onAnchor]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = reduced ? 0 : stage.progress;
    smooth.current = damp(smooth.current, target, 5.5, dt);

    const sample = samplePhase(smooth.current);
    const spread = lerp(sample.current.chamber.spread, sample.next.chamber.spread, sample.t);
    const boundary = lerp(
      sample.current.chamber.boundary,
      sample.next.chamber.boundary,
      sample.t,
    );

    groups.current.forEach((group, index) => {
      if (!group) return;
      group.scale.setScalar(spread * (1 + index * 0.015));

      const material = materials.current[index];
      if (material) {
        material.opacity = damp(material.opacity, boundary * SHELLS[index].opacity, 4, dt);
      }

      const edge = edgeMaterials.current[index];
      if (edge) {
        const targetEdge = (hovered === index ? 0.92 : 0.34) * (0.45 + boundary * 0.55);
        edge.opacity = damp(edge.opacity, targetEdge, 6, dt);
      }
    });

    if (core.current) {
      core.current.rotation.y = smooth.current * Math.PI * 0.85;
      core.current.rotation.x = 0.22 + smooth.current * 0.12;
    }

    if (hovered !== null) {
      const marker = markerRefs.current[hovered];
      if (marker) {
        world.setFromMatrixPosition(marker.matrixWorld);
        world.project(camera);
        onAnchor({
          x: (world.x * 0.5 + 0.5) * size.width,
          y: (-world.y * 0.5 + 0.5) * size.height,
        });
      }
    }
  });

  return (
    <group>
      {SHELLS.map((shell, index) => (
        <group
          key={LAYERS[index].id}
          ref={(node) => {
            groups.current[index] = node;
          }}
          rotation={[0.2, index * 0.42 + 0.55, index * 0.03]}
        >
          <mesh>
            <boxGeometry args={shell.size} />
            <meshStandardMaterial
              ref={(node) => {
                materials.current[index] = node;
              }}
              color="#f1f2ee"
              transparent
              opacity={shell.opacity}
              metalness={0.2}
              roughness={0.42}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <lineSegments geometry={edgeGeometries[index]}>
            <lineBasicMaterial
              ref={(node) => {
                edgeMaterials.current[index] = node;
              }}
              color={index === 2 ? "#c7f36b" : "#f1f2ee"}
              transparent
              opacity={0.34}
              depthWrite={false}
            />
          </lineSegments>
        </group>
      ))}

      <group ref={core}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.0075, 8, 128]} />
          <meshStandardMaterial
            color="#c7f36b"
            emissive="#c7f36b"
            emissiveIntensity={0.5}
            metalness={0.4}
            roughness={0.3}
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.85, 0]}>
          <torusGeometry args={[0.62, 0.0045, 8, 128]} />
          <meshStandardMaterial
            color="#f1f2ee"
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.28}
          />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#f1f2ee" wireframe transparent opacity={0.45} />
        </mesh>
        {DISCS.map((disc) => (
          <mesh key={disc} position={[0, (disc - 2) * 0.15, 0]}>
            <boxGeometry args={[0.6 - disc * 0.055, 0.012, 0.6 - disc * 0.055]} />
            <meshStandardMaterial
              color="#f1f2ee"
              metalness={0.75}
              roughness={0.28}
              transparent
              opacity={0.32}
            />
          </mesh>
        ))}
      </group>

      {MARKERS.map((position, index) => (
        <group key={LAYERS[index].id} position={position}>
          <mesh
            ref={(node) => {
              markerRefs.current[index] = node;
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              onHover(index);
            }}
            onPointerOut={() => onHover(null)}
          >
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.028, 20]} />
            <meshBasicMaterial
              color={hovered === index ? "#c7f36b" : "#90969a"}
              transparent
              opacity={hovered === index ? 0.95 : 0.55}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.052, 0.058, 28]} />
            <meshBasicMaterial
              color="#c7f36b"
              transparent
              opacity={hovered === index ? 0.6 : 0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
