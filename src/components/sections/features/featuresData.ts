export type FeatureItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  chip: string;
  accentFrom: string;
  accentTo: string;
};

export const featuresData: FeatureItem[] = [
  {
    id: "motion-layout",
    eyebrow: "Orbital Layer",
    title: "Orbital Motion Matrix",
    description:
      "Trayectorias de interfaz calibradas como orbitas: fluidas, precisas y con microimpulsos cinematograficos.",
    chip: "Thruster Motion",
    accentFrom: "#22d3ee",
    accentTo: "#6366f1",
  },
  {
    id: "canvas-core",
    eyebrow: "Nebula Core",
    title: "Deep-space Canvas",
    description:
      "Escena WebGL integrada como camara de mision para pasar de vista sutil a inmersion espacial sin romper la composicion.",
    chip: "Cosmic Layer",
    accentFrom: "#818cf8",
    accentTo: "#a855f7",
  },
  {
    id: "premium-rhythm",
    eyebrow: "Stellar Grid",
    title: "Stellar Rhythm System",
    description:
      "Jerarquia y cadencia inspiradas en mapas estelares para mantener lectura clara con presencia premium.",
    chip: "Gravity Rhythm",
    accentFrom: "#38bdf8",
    accentTo: "#06b6d4",
  },
  {
    id: "composable-modules",
    eyebrow: "Constellation",
    title: "Constellation Modules",
    description:
      "Modulos desacoplados como una constelacion activa: cada bloque se conecta para expandir narrativa, UI y tecnologia.",
    chip: "Mission-ready Stack",
    accentFrom: "#c084fc",
    accentTo: "#f472b6",
  },
];

export const defaultFeatureId = featuresData[0]?.id ?? "motion-layout";
