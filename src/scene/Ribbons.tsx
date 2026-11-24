import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, damp, stage } from "../scroll/stage";
import { PHASES } from "./phases";

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 384;

function makeWordTexture(word: string): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.font = '700 205px "Archivo Variable", Archivo, system-ui, sans-serif';

  const chars = [...word];
  const tracking = 14;
  const widths = chars.map((char) => ctx.measureText(char).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + tracking * (chars.length - 1);
  const stretch = Math.min(1.24, 1860 / Math.max(total, 1));

  ctx.save();
  ctx.translate(TEXTURE_WIDTH / 2 - (total * stretch) / 2, TEXTURE_HEIGHT / 2);
  ctx.scale(stretch, 1);

  let x = 0;
  for (let i = 0; i < chars.length; i += 1) {
    ctx.fillText(chars[i], x, 0);
    x += widths[i] + tracking;
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function ribbonGeometry(width: number, height: number, bend: number, segments = 64) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const x = (t - 0.5) * width;
    const z = (Math.cos((t - 0.5) * Math.PI) - 1) * bend;
    positions.push(x, -height / 2, z, x, height / 2, z);
    uvs.push(t, 0, t, 1);
  }

  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

type Props = {
  reduced: boolean;
  compact: boolean;
};

export function Ribbons({ reduced, compact }: Props) {
  const indices = compact ? [0, 2, 4] : [0, 1, 2, 3, 4];
  const words = indices.map((index) => PHASES[index].word);
  const wordKey = words.join("|");
  const [fontsReady, setFontsReady] = useState(false);

  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const smooth = useRef(0);
  const camera = useThree((state) => state.camera);
  const viewport = useThree((state) => state.size);

  useEffect(() => {
    let cancelled = false;
    const load = document.fonts?.load('700 205px "Archivo Variable"');

    if (!load) {
      setFontsReady(true);
      return;
    }

    load
      .then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const textures = useMemo(() => words.map((word) => makeWordTexture(word)), [wordKey, fontsReady]);

  useEffect(() => {
    return () => {
      textures.forEach((texture) => texture?.dispose());
    };
  }, [textures]);

  const geometry = useMemo(
    () => ribbonGeometry(compact ? 4.9 : 5.3, compact ? 0.95 : 1.12, 0.55),
    [compact],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const base = useMemo(() => new THREE.Color("#f1f2ee"), []);
  const accent = useMemo(() => new THREE.Color("#c7f36b"), []);
  const worldAnchor = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const target = reduced ? 0 : stage.progress;
    smooth.current = damp(smooth.current, target, 5, delta);
    const phasePosition = smooth.current * (PHASES.length - 1);

    indices.forEach((phaseIndex, slot) => {
      const mesh = meshes.current[slot];
      const material = materials.current[slot];
      if (!mesh || !material) return;

      const offset = phaseIndex - phasePosition;
      const distance = Math.abs(offset);
      const opacity = clamp(1 - distance * 1.22, 0, 1);

      material.opacity = opacity * 0.94;
      material.color.lerpColors(base, accent, clamp(0.62 - distance * 0.85, 0, 0.62));

      // The ribbon group itself sits off-centre in the rig; cancel that so the
      // word is centred in the viewport and cannot run off an edge.
      if (mesh.parent) {
        mesh.parent.getWorldPosition(worldAnchor);
        mesh.position.x = -worldAnchor.x;
      }
      mesh.position.y = offset * (compact ? 0.92 : 1.05);
      mesh.position.z = 1.55 - distance * 1.45;

      // Keep the word inside the frustum on tall viewports rather than
      // letting the last letter fall off the right edge.
      const fov = (camera as THREE.PerspectiveCamera).fov ?? 42;
      const aspect = viewport.width / Math.max(viewport.height, 1);
      const dist = Math.max(camera.position.z - mesh.position.z, 0.1);
      const visibleWidth = 2 * Math.tan((fov * Math.PI) / 360) * dist * aspect;
      const fit = Math.min(1, (visibleWidth * 0.94) / (compact ? 4.9 : 5.3));

      mesh.scale.setScalar((compact ? 0.86 : 0.94) * (1 - distance * 0.06) * fit);
      mesh.rotation.y = offset * 0.16;
      mesh.visible = opacity > 0.012;
    });
  });

  return (
    <group>
      {indices.map((phaseIndex, slot) => {
        const texture = textures[slot];
        if (!texture) return null;

        return (
          <mesh
            key={PHASES[phaseIndex].id}
            ref={(node) => {
              meshes.current[slot] = node;
            }}
            geometry={geometry}
            position={[
              0,
              indices[slot] * (compact ? 0.92 : 1.05),
              1.55 - indices[slot] * 1.45,
            ]}
            visible={slot === 0}
          >
            <meshBasicMaterial
              ref={(node) => {
                materials.current[slot] = node;
              }}
              map={texture}
              transparent
              opacity={slot === 0 ? 0.94 : 0}
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
