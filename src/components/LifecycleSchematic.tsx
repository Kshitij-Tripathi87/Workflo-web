import type { LifecycleRegion } from "../content/lifecycle";

const OUTER = { x: 12, y: 12, w: 576, h: 416 };
const ISOLATION = { x: 44, y: 44, w: 512, h: 352 };
const POLICY = { x: 76, y: 76, w: 448, h: 224 };

const BLOCKS: {
  region: LifecycleRegion;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  note: string;
}[] = [
  { region: "context", x: 100, y: 100, w: 184, h: 52, label: "repository + revision", note: "pinned input" },
  { region: "environment", x: 100, y: 164, w: 184, h: 60, label: "environment", note: "deps · runtime" },
  { region: "activity", x: 300, y: 100, w: 200, h: 124, label: "observed activity", note: "tests · probes · logs" },
  { region: "evidence", x: 100, y: 236, w: 184, h: 52, label: "evidence ledger", note: "recorded" },
  { region: "teardown", x: 300, y: 236, w: 200, h: 52, label: "teardown", note: "verified" },
  { region: "receipt", x: 76, y: 316, w: 448, h: 52, label: "execution receipt", note: "signed · inspectable" },
];

const MONO = { fontFamily: "var(--font-mono)" };

function fillFor(active: boolean) {
  return {
    fill: active ? "rgba(199, 243, 107, 0.1)" : "rgba(18, 21, 24, 0.55)",
    stroke: active ? "#c7f36b" : "#292e31",
  };
}

export function LifecycleSchematic({ activeRegion }: { activeRegion: LifecycleRegion }) {
  return (
    <svg
      viewBox="0 0 600 440"
      role="img"
      aria-labelledby="schematic-title schematic-desc"
      className="w-full"
    >
      <title id="schematic-title">Execution schematic</title>
      <desc id="schematic-desc">
        Nested execution, isolation and policy boundaries containing the repository, environment,
        observed activity, evidence ledger and teardown record, with a signed receipt below.
      </desc>

      <rect {...{ x: OUTER.x, y: OUTER.y, width: OUTER.w, height: OUTER.h }} fill="none" stroke="#292e31" />
      <text x={20} y={30} {...{ fill: "#90969a" }} style={{ ...MONO, fontSize: 8.5, letterSpacing: "0.12em" }}>
        EXECUTION BOUNDARY
      </text>

      <rect
        {...{ x: ISOLATION.x, y: ISOLATION.y, width: ISOLATION.w, height: ISOLATION.h }}
        {...fillFor(activeRegion === "isolation")}
        strokeWidth={1}
      />
      <text x={52} y={62} fill="#90969a" style={{ ...MONO, fontSize: 8.5, letterSpacing: "0.12em" }}>
        ISOLATION
      </text>

      <rect
        {...{ x: POLICY.x, y: POLICY.y, width: POLICY.w, height: POLICY.h }}
        {...fillFor(activeRegion === "policy")}
        strokeWidth={1}
      />
      <text x={84} y={94} fill="#90969a" style={{ ...MONO, fontSize: 8.5, letterSpacing: "0.12em" }}>
        POLICY SURFACE
      </text>

      {BLOCKS.map((block) => {
        const active = activeRegion === block.region;
        return (
          <g key={block.region}>
            <rect
              x={block.x}
              y={block.y}
              width={block.w}
              height={block.h}
              {...fillFor(active)}
              strokeWidth={1}
            />
            <text
              x={block.x + 10}
              y={block.y + 21}
              fill={active ? "#f1f2ee" : "#d5d8d4"}
              style={{ ...MONO, fontSize: 9.5 }}
            >
              {block.label}
            </text>
            <text
              x={block.x + 10}
              y={block.y + 36}
              fill="#90969a"
              style={{ ...MONO, fontSize: 8.5 }}
            >
              {block.note}
            </text>
            {active ? <circle cx={block.x + block.w - 12} cy={block.y + 12} r={2.4} fill="#c7f36b" /> : null}
          </g>
        );
      })}
    </svg>
  );
}
