import { Camera, Point3 } from "../../types";

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(start: number, end: number, value: number): number {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const NEAR_PLANE = 0.16;

/**
 * Project a 3D point into 2D camera coordinates.
 * Returns null if the point is behind the near plane.
 */
export function projectPoint(
  point: Point3,
  camera: Camera,
  pointerX: number,
  pointerY: number,
): [number, number] | null {
  const depth = camera.z - point.z;
  if (depth < NEAR_PLANE) return null;
  const scale = camera.focal / depth;
  return [
    camera.centerX + (point.x - camera.x) * scale + pointerX * 13,
    camera.centerY - (point.y - camera.y) * scale + pointerY * 10,
  ];
}

/**
 * 3D Line with Cohen-Sutherland near-plane clipping.
 * Prevents entire triangles and polygons from flashing out of existence when
 * a single vertex gets close to or crosses the camera near plane.
 */
export function line3d(
  ctx: CanvasRenderingContext2D,
  a: Point3,
  b: Point3,
  camera: Camera,
  pointerX: number,
  pointerY: number,
): void {
  const da = camera.z - a.z;
  const db = camera.z - b.z;

  // Both behind or too close to near plane
  if (da < NEAR_PLANE && db < NEAR_PLANE) return;

  let p1: Point3 = a;
  let p2: Point3 = b;

  // Point A is clipped
  if (da < NEAR_PLANE) {
    const t = (NEAR_PLANE - da) / (db - da);
    p1 = {
      x: a.x + t * (b.x - a.x),
      y: a.y + t * (b.y - a.y),
      z: a.z + t * (b.z - a.z),
    };
  } else if (db < NEAR_PLANE) {
    // Point B is clipped
    const t = (NEAR_PLANE - da) / (db - da);
    p2 = {
      x: a.x + t * (b.x - a.x),
      y: a.y + t * (b.y - a.y),
      z: a.z + t * (b.z - a.z),
    };
  }

  const pa = projectPoint(p1, camera, pointerX, pointerY);
  const pb = projectPoint(p2, camera, pointerX, pointerY);
  if (!pa || !pb) return;

  ctx.moveTo(pa[0], pa[1]);
  ctx.lineTo(pb[0], pb[1]);
}

/**
 * Generate triangulated wireframe mesh on a surface face.
 */
export function meshFace(
  ctx: CanvasRenderingContext2D,
  makePoint: (u: number, v: number) => Point3,
  camera: Camera,
  pointerX: number,
  pointerY: number,
  alpha: number,
  frontOnly = false,
): void {
  const isNarrow = typeof window !== "undefined" && window.innerWidth <= 1100;
  const columns = isNarrow ? 9 : 14;
  const rows = isNarrow ? 6 : 9;

  ctx.beginPath();
  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    for (let column = 0; column < columns; column += 1) {
      const u0 = column / columns;
      const u1 = (column + 1) / columns;
      line3d(ctx, makePoint(u0, v), makePoint(u1, v), camera, pointerX, pointerY);
    }
  }
  for (let column = 0; column <= columns; column += 1) {
    const u = column / columns;
    for (let row = 0; row < rows; row += 1) {
      const v0 = row / rows;
      const v1 = (row + 1) / rows;
      line3d(ctx, makePoint(u, v0), makePoint(u, v1), camera, pointerX, pointerY);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u0 = column / columns;
      const u1 = (column + 1) / columns;
      const v0 = row / rows;
      const v1 = (row + 1) / rows;
      if ((row + column) % 2 === 0) {
        line3d(ctx, makePoint(u0, v0), makePoint(u1, v1), camera, pointerX, pointerY);
      } else {
        line3d(ctx, makePoint(u1, v0), makePoint(u0, v1), camera, pointerX, pointerY);
      }
    }
  }
  ctx.lineWidth = frontOnly ? 0.72 : 0.6;
  ctx.strokeStyle = `rgba(61, 78, 76, ${alpha})`;
  ctx.stroke();
}

/**
 * Master draw routine for the Workflo Sandbox.
 */
export function drawSandbox(
  canvas: HTMLCanvasElement | null,
  progress: number,
  pointerX: number,
  pointerY: number,
  frontOnly = false,
  width = typeof window !== "undefined" ? window.innerWidth : 1440,
  height = typeof window !== "undefined" ? window.innerHeight : 900,
): void {
  if (!canvas) return;
  width = Math.max(1, Math.round(width));
  height = Math.max(1, Math.round(height));
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.75);

  if (
    canvas.width !== Math.round(width * dpr) ||
    canvas.height !== Math.round(height * dpr)
  ) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Cinematic scroll interpolation
  const fly = smoothstep(0.12, 0.46, progress);
  const camera: Camera = {
    z: mix(18.4, 1.25, fly),
    x: mix(-0.45, 0.08, fly),
    y: mix(0.08, -0.05, fly),
    focal: mix(height * 1.56, height * 0.68, fly),
    centerX: mix(width * 0.625, width * 0.53, fly),
    centerY: mix(height * 0.505, height * 0.51, fly),
  };

  // Atmospheric warm-tinted depth haze
  if (!frontOnly) {
    const haze = ctx.createRadialGradient(
      width * 0.72,
      height * 0.46,
      8,
      width * 0.72,
      height * 0.46,
      width * 0.72,
    );
    haze.addColorStop(0, "rgba(225, 230, 228, 0.48)");
    haze.addColorStop(0.48, "rgba(238, 240, 238, 0.26)");
    haze.addColorStop(1, "rgba(247, 247, 245, 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);
  }

  // 3D Box Dimensions
  const box = { x: 4.65, y: 2.62, z: 2.42 };
  const faceFns: Array<(u: number, v: number) => Point3> = [
    (u, v) => ({ x: mix(-box.x, box.x, u), y: mix(-box.y, box.y, v), z: box.z }),
    (u, v) => ({ x: mix(-box.x, box.x, u), y: mix(-box.y, box.y, v), z: -box.z }),
    (u, v) => ({ x: -box.x, y: mix(-box.y, box.y, v), z: mix(box.z, -box.z, u) }),
    (u, v) => ({ x: box.x, y: mix(-box.y, box.y, v), z: mix(box.z, -box.z, u) }),
    (u, v) => ({ x: mix(-box.x, box.x, u), y: box.y, z: mix(box.z, -box.z, v) }),
    (u, v) => ({ x: mix(-box.x, box.x, u), y: -box.y, z: mix(box.z, -box.z, v) }),
  ];

  // Interior Execution Planes (visible as camera enters sandbox)
  if (!frontOnly && fly > 0.08) {
    const interiorOpacity =
      smoothstep(0.13, 0.3, progress) * (1 - smoothstep(0.73, 0.91, progress));

    // Base coordinate grid
    ctx.beginPath();
    for (let column = 0; column <= 12; column += 1) {
      const x = mix(-4.05, 4.05, column / 12);
      line3d(ctx, { x, y: -2.1, z: 1.4 }, { x, y: -2.1, z: -4.4 }, camera, pointerX, pointerY);
    }
    for (let depthIndex = 0; depthIndex <= 10; depthIndex += 1) {
      const z = mix(1.4, -4.4, depthIndex / 10);
      line3d(ctx, { x: -4.05, y: -2.1, z }, { x: 4.05, y: -2.1, z }, camera, pointerX, pointerY);
    }
    ctx.lineWidth = 0.55;
    ctx.strokeStyle = `rgba(80, 100, 96, ${0.19 * interiorOpacity})`;
    ctx.stroke();

    // Floating Glass Execution Platforms
    const surfaces = [
      { y: -1.62, z: -0.05, alpha: 0.35 },
      { y: -0.9, z: -1.72, alpha: 0.27 },
      { y: -0.1, z: -3.35, alpha: 0.2 },
    ];
    surfaces.forEach((surface, index) => {
      const fade = interiorOpacity * surface.alpha;
      const points: Point3[] = [
        { x: -3.7 + index * 0.18, y: surface.y, z: surface.z + 0.72 },
        { x: 3.7 - index * 0.18, y: surface.y, z: surface.z + 0.72 },
        { x: 3.7 - index * 0.18, y: surface.y, z: surface.z - 0.72 },
        { x: -3.7 + index * 0.18, y: surface.y, z: surface.z - 0.72 },
      ];
      const projected = points.map((p) => projectPoint(p, camera, pointerX, pointerY));
      if (projected.every((p): p is [number, number] => p !== null)) {
        ctx.beginPath();
        projected.forEach((p, pIdx) => {
          if (pIdx === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${fade * 0.48})`;
        ctx.fill();
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = `rgba(82, 104, 99, ${fade})`;
        ctx.stroke();

        // Cross subdivisions
        for (let grid = 1; grid < 8; grid += 1) {
          const u = grid / 8;
          ctx.beginPath();
          line3d(
            ctx,
            { x: mix(points[0].x, points[1].x, u), y: surface.y, z: surface.z + 0.72 },
            { x: mix(points[3].x, points[2].x, u), y: surface.y, z: surface.z - 0.72 },
            camera,
            pointerX,
            pointerY,
          );
          ctx.strokeStyle = `rgba(82, 104, 99, ${fade * 0.45})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }
    });

    // Module Anchor Nodes
    const modulePoints = [
      { x: -1.9, y: -0.75, z: -0.52 },
      { x: 1.6, y: 0.42, z: -1.84 },
      { x: 0.1, y: 1.08, z: -3.65 },
    ];
    modulePoints.forEach((point, index) => {
      const origin = projectPoint(point, camera, pointerX, pointerY);
      const depth = camera.z - point.z;
      if (!origin || depth < NEAR_PLANE) return;
      const s = clamp((camera.focal / depth) * 0.018, 2, 10);
      ctx.fillStyle = `rgba(177, 132, 101, ${interiorOpacity * (0.58 - index * 0.1)})`;
      ctx.beginPath();
      ctx.arc(origin[0], origin[1], s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(origin[0], origin[1], s * 2.1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(177, 132, 101, ${interiorOpacity * 0.22})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });
  }

  // Draw 3D Mesh Faces
  faceFns.forEach((face, index) => {
    if (frontOnly && index !== 0) return;
    const alpha = index === 0 ? 0.25 : index === 5 ? 0.19 : 0.13;
    meshFace(
      ctx,
      face,
      camera,
      pointerX,
      pointerY,
      frontOnly ? 0.3 : alpha * (1 - fly * 0.3),
      frontOnly,
    );
  });

  // Exterior Structural Edges
  if (!frontOnly) {
    const corners: Point3[][] = [
      [{ x: -box.x, y: -box.y, z: box.z }, { x: box.x, y: -box.y, z: box.z }],
      [{ x: -box.x, y: box.y, z: box.z }, { x: box.x, y: box.y, z: box.z }],
      [{ x: -box.x, y: -box.y, z: -box.z }, { x: box.x, y: -box.y, z: -box.z }],
      [{ x: -box.x, y: box.y, z: -box.z }, { x: box.x, y: box.y, z: -box.z }],
      [{ x: -box.x, y: -box.y, z: box.z }, { x: -box.x, y: box.y, z: box.z }],
      [{ x: box.x, y: -box.y, z: box.z }, { x: box.x, y: box.y, z: box.z }],
      [{ x: -box.x, y: -box.y, z: -box.z }, { x: -box.x, y: box.y, z: -box.z }],
      [{ x: box.x, y: -box.y, z: -box.z }, { x: box.x, y: box.y, z: -box.z }],
      [{ x: -box.x, y: -box.y, z: box.z }, { x: -box.x, y: -box.y, z: -box.z }],
      [{ x: box.x, y: -box.y, z: box.z }, { x: box.x, y: -box.y, z: -box.z }],
      [{ x: -box.x, y: box.y, z: box.z }, { x: -box.x, y: box.y, z: -box.z }],
      [{ x: box.x, y: box.y, z: box.z }, { x: box.x, y: box.y, z: -box.z }],
    ];
    ctx.beginPath();
    corners.forEach((edge) => line3d(ctx, edge[0], edge[1], camera, pointerX, pointerY));
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(61, 77, 75, ${0.29 * (1 - fly * 0.45)})`;
    ctx.stroke();

    // Scale tick marks
    if (fly < 0.18) {
      const tickAlpha = 1 - fly * 5.5;
      ctx.beginPath();
      for (let i = 0; i < 7; i += 1) {
        const x = width * (0.57 + i * 0.038);
        const y = height * (0.87 + (i % 2) * 0.012);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 9, y);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(105, 116, 113, ${0.36 * tickAlpha})`;
      ctx.stroke();
    }
  }
}
