import { useMemo } from "react";
import type { FeatureNetworkItem } from "./featureNetworkData";

type FeatureConnectionLinesProps = {
  items: FeatureNetworkItem[];
  activeCount: number;
  highlightIndex: number | null;
  pathRefs: React.MutableRefObject<Array<SVGPathElement | null>>;
  dotRefs: React.MutableRefObject<Array<SVGCircleElement | null>>;
  mobile: boolean;
};

// Función matemática para generar el "Rayo" (Lightning Bolt)
function getLightningPathDefinition(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  index: number,
): string {
  const numSegments = 5;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);

  const perpX = -dy / length;
  const perpY = dx / length;

  let path = `M ${fromX} ${fromY}`;

  for (let i = 1; i < numSegments; i++) {
    const t = i / numSegments;
    const chaosT = t + ((index * i) % 3) * 0.04 - 0.04;

    const baseX = fromX + dx * chaosT;
    const baseY = fromY + dy * chaosT;

    const direction = i % 2 === 0 ? 1 : -1;
    const amplitude = 18 + (index % 4) * 8;

    const pointX = baseX + perpX * amplitude * direction;
    const pointY = baseY + perpY * amplitude * direction;

    path += ` L ${pointX.toFixed(2)} ${pointY.toFixed(2)}`;
  }

  path += ` L ${toX} ${toY}`;
  return path;
}

function FeatureConnectionLines({
  items,
  activeCount,
  highlightIndex,
  pathRefs,
  dotRefs,
  mobile,
}: FeatureConnectionLinesProps) {
  const core = useMemo(
    () => ({
      x: 500,
      y: 360,
    }),
    [],
  );

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1000 720"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="feature-network-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.85" />
        </linearGradient>

        <filter id="feature-network-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.5" result="blurred1" />
          <feGaussianBlur stdDeviation="10" result="blurred2" />
          <feMerge>
            <feMergeNode in="blurred2" />
            <feMergeNode in="blurred1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {items.map((item, index) => {
        const position = mobile ? item.position.mobile : item.position.desktop;
        const x = (position.x / 100) * 1000;
        const y = (position.y / 100) * 720;

        const path = getLightningPathDefinition(core.x, core.y, x, y, index);
        const emphasized = highlightIndex === index;
        const isActive = index < activeCount;

        return (
          <g key={item.id}>
            <path
              d={path}
              stroke="url(#feature-network-stroke)"
              strokeWidth={isActive || emphasized ? 2.5 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="bevel"
              ref={(node) => {
                pathRefs.current[index] = node;
              }}
              opacity={isActive || emphasized ? 1 : 0}
              filter={isActive || emphasized ? "url(#feature-network-glow)" : undefined}
            />
            <circle
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
              r="5"
              cx={core.x}
              cy={core.y}
              fill="#ffffff"
              filter="url(#feature-network-glow)"
              opacity={0}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default FeatureConnectionLines;
