import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function OrbitCore() {
  const coreRef = useRef<Group | null>(null);

  useFrame(({ clock }, delta) => {
    const core = coreRef.current;

    if (!core) {
      return;
    }

    const elapsed = clock.getElapsedTime();

    core.rotation.x = Math.sin(elapsed * 0.2) * 0.12;
    core.rotation.y += delta * 0.12;
    core.rotation.z = Math.sin(elapsed * 0.14) * 0.04;
    core.position.y = Math.sin(elapsed * 0.9) * 0.05;
  });

  return (
    <Float speed={0.5} rotationIntensity={0.04} floatIntensity={0.08}>
      <group ref={coreRef} scale={0.88}>
        <mesh>
          <sphereGeometry args={[1.02, 96, 96]} />
          <meshPhysicalMaterial
            color="#f3f7ff"
            metalness={0.18}
            roughness={0.16}
            clearcoat={0.88}
            clearcoatRoughness={0.22}
            sheen={0.52}
            sheenColor="#8b9cff"
            sheenRoughness={0.45}
            emissive="#16234d"
            emissiveIntensity={0.08}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[1.12, 96, 96]} />
          <meshStandardMaterial
            color="#7a8ada"
            transparent
            opacity={0.08}
            metalness={0.06}
            roughness={0.5}
            emissive="#41207a"
            emissiveIntensity={0.06}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default OrbitCore;
