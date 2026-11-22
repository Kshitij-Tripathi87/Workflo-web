# Workflo cinematic photography

This directory contains optimized still-image assets for the scroll-driven execution story.

| File | Scene |
| --- | --- |
| `pod.webp` | Exterior machine / hero and closing contact backdrop |
| `portal.webp` | Gateway ring |
| `hall.webp` | Execution chamber |
| `path.webp` | Branching execution pathways |
| `hero-chamber.webp` | Sealed glass module |

The scene controller synchronizes camera-like transforms, crossfades, a masked near-floor plane, and a floor-attached light sweep. Two CSS fog planes drift in opposing directions. Mobile uses a separate image-led scene sequence.

## Rendering note

These are flattened images, not reconstructed 3D assets. The lower masked plane creates a restrained 2.5D depth cue; it is not a true depth map or object cutout. Large camera orbits, real foreground occlusion, and physically correct parallax require segmented layers or per-image depth maps. The current implementation does not claim those capabilities.

The committed delivery variants are 640 x 360 WebP. Replace them with higher-resolution art-directed exports before production, retaining these filenames or updating the image manifest in `src/components/sandbox/SandboxCanvas.tsx`.
