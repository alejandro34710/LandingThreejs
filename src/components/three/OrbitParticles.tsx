import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

type OrbitRing = {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  count: number;
};

const orbitRings: OrbitRing[] = [
  {
    radius: 1.68,
    tilt: [0.22, 0.15, 0.06],
    speed: 0.06,
    count: 3,
  },
  {
    radius: 2.1,
    tilt: [-0.14, 0.42, 0.1],
    speed: -0.045,
    count: 4,
  },
];

function OrbitParticles() {
  const ringRefs = useRef<Array<Group | null>>([]);

  useFrame((_, delta) => {
    ringRefs.current.forEach((ring, index) => {
      if (!ring) {
        return;
      }

      const direction = index % 2 === 0 ? 1 : -1;
      ring.rotation.y += delta * orbitRings[index].speed * direction;
      ring.rotation.z += delta * 0.004 * direction;
    });
  });

  return (
    <group>
      {orbitRings.map((ring, ringIndex) => (
        <group
          key={`${ring.radius}-${ringIndex}`}
          ref={(node) => {
            ringRefs.current[ringIndex] = node;
          }}
          rotation={ring.tilt}
        >
          {Array.from({ length: ring.count }).map((_, particleIndex) => {
            const angle = (particleIndex / ring.count) * Math.PI * 2;
            const wobble = particleIndex % 2 === 0 ? 0.012 : -0.01;

            return (
              <mesh
                key={`${ringIndex}-${particleIndex}`}
                position={[
                  Math.cos(angle) * ring.radius,
                  Math.sin(angle) * ring.radius * 0.14 + wobble,
                  Math.sin(angle) * ring.radius * 0.1,
                ]}
              >
                <sphereGeometry args={[0.016, 12, 12]} />
                <meshStandardMaterial
                  color="#d8e1ff"
                  emissive="#7c5cff"
                  emissiveIntensity={0.06}
                  metalness={0.1}
                  roughness={0.5}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

export default OrbitParticles;
