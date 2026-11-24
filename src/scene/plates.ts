/**
 * Environment plates ship at three widths, all 16:9:
 *   1600x900  — the original file, `plate-<id>.webp`
 *   2560x1440 — `plate-<id>-2560.webp`
 *   3840x2160 — `plate-<id>-3840.webp`
 *
 * Browsers pick one, so phones never download the 4K file.
 */
const PLATE_WIDTHS = [1600, 2560, 3840] as const;

export function plateSrcSet(src: string) {
  return PLATE_WIDTHS.map((w) =>
    w === 1600 ? `${src} ${w}w` : `${src.replace(/\.webp$/, "")}-${w}.webp ${w}w`,
  ).join(", ");
}
