import { mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const handlers = [
  "contact",
  "early-access",
  "health",
  "dispatch-notification",
  "notify",
];

await mkdir("dist/handlers", { recursive: true });
for (const handler of handlers) {
  await build({
    entryPoints: [`src/handlers/${handler}.ts`],
    outfile: `dist/handlers/${handler}.js`,
    bundle: true,
    packages: "bundle",
    platform: "node",
    target: "node26",
    format: "esm",
    treeShaking: true,
    sourcemap: false,
    legalComments: "none",
  });
}
await writeFile("dist/package.json", JSON.stringify({ type: "module" }, null, 2) + "\n");
console.log(`Bundled ${handlers.length} self-contained Node.js 26 Lambda handlers.`);
