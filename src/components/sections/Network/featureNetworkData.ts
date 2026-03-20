export type FeatureNetworkItem = {
  id: string;
  title: string;
  description: string;
  badge: string;
  tone: "cyan" | "blue" | "violet" | "indigo";
  position: {
    desktop: { x: number; y: number };
    mobile: { x: number; y: number };
  };
  miniRows: string[];
};

export const featureNetworkItems: FeatureNetworkItem[] = [
  {
    id: "workflows",
    title: "Workflows",
    description: "Orchestrate complex tasks with adaptive routes and smart checkpoints.",
    badge: "Flow Engine",
    tone: "cyan",
    position: {
      desktop: { x: 22, y: 23 },
      mobile: { x: 50, y: 15 },
    },
    miniRows: ["Draft proposals", "Review handoff", "Client delivery"],
  },
  {
    id: "task-lists",
    title: "Task Lists",
    description: "Prioritize actions by context, urgency, and team dependencies.",
    badge: "Ops Layer",
    tone: "blue",
    position: {
      desktop: { x: 22, y: 75 },
      mobile: { x: 50, y: 40 },
    },
    miniRows: ["Critical queue", "SLA monitor", "Escalation ready"],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Visualize operational performance in real time with actionable signals.",
    badge: "Metrics Core",
    tone: "violet",
    position: {
      desktop: { x: 78, y: 23 },
      mobile: { x: 50, y: 64 },
    },
    miniRows: ["Trend pulse", "Conversion lift", "Session health"],
  },
  {
    id: "insights",
    title: "Insights",
    description: "Discover patterns and recommendations for high-impact decisions.",
    badge: "Signal AI",
    tone: "indigo",
    position: {
      desktop: { x: 78, y: 75 },
      mobile: { x: 50, y: 86 },
    },
    miniRows: ["Weekly digest", "Risk alerts", "Next best action"],
  },
];
