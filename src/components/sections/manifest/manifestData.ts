export type ManifestVisualKind = "geometric" | "modules" | "tracking";

export type ManifestCardData = {
  id: string;
  number: "01" | "02" | "03";
  title: string;
  description: string;
  visualKind: ManifestVisualKind;
};

export const manifestCards: ManifestCardData[] = [
  {
    id: "add-contacts",
    number: "01",
    title: "Add contacts",
    description:
      "Get up and running in minutes - upload or import contacts and start sending immediately.",
    visualKind: "geometric",
  },
  {
    id: "create-emails",
    number: "02",
    title: "Create emails",
    description:
      "Quickly write and send marketing emails with templates, audiences, and segments.",
    visualKind: "modules",
  },
  {
    id: "send-and-track",
    number: "03",
    title: "Send and track",
    description:
      "See your progress at a glance as you grow your email list and lifecycle revenue.",
    visualKind: "tracking",
  },
];

