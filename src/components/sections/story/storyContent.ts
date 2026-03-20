export type StoryCTA = {
  label: string;
  href: string;
};

export const storyContent = {
  badge: "STORY / WHO WE ARE",
  title: "Nebula core thinking, engineered to move you",
  subtitle:
    "A premium, editorial narrative space that turns interaction into atmosphere. Sculpted energy, calm motion, and clarity-first design.",
  paragraph:
    "ORBIT is built as a system of depth and intent. This experience explores how subtle forces can guide attention without stealing the spotlight.",
  cta: { label: "Explore our vision", href: "#about" } satisfies StoryCTA,
} as const;

