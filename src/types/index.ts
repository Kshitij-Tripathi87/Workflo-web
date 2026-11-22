export type Point3 = {
  x: number;
  y: number;
  z: number;
};

export type Camera = {
  z: number;
  x: number;
  y: number;
  focal: number;
  centerX: number;
  centerY: number;
};

export type ExecutionStep = {
  label: string;
  note: string;
};

export type HotspotItem = {
  id: string;
  title: string;
  text: string;
};

export type SolutionCardItem = {
  id: string;
  title: string;
  description: string;
  visual: "revision" | "quality" | "evidence";
  destination: string;
};
