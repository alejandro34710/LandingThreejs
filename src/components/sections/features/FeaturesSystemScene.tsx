import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Line,
  OrbitControls,
  Icosahedron,
  Sphere,
  Torus
} from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import { Group, MathUtils, Mesh, type Material } from "three";
import { defaultFeatureId } from "./featuresData";

type FeaturesSystemSceneProps = {
  activeFeatureId: string;
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  onModuleSelect?: (index: number) => void;
  onCanvasClick?: () => void;
};

function SceneCore({
  activeFeatureId,
  parallaxRef,
  reducedMotion,
  onModuleSelect,
}: FeaturesSystemSceneProps) {
  const rootRef = useRef<Group | null>(null);
  const coreRef = useRef<Mesh | null>(null);
  const ringsRef = useRef<Group | null>(null);
  const nodeRefs = useRef<Array<Mesh | null>>([]);

  const points = useMemo(
    () => [
      [-1.6, 0.8, 0.2] as [number, number, number],
      [1.6, 0.5, -0.2] as [number, number, number],
      [-1.2, -1.0, 0.4] as [number, number, number],
      [1.2, -0.9, -0.3] as [number, number, number],
    ],
    [],
  );

  const activeIndex = useMemo(() => {
    switch (activeFeatureId) {
      case "motion-layout": return 0;
      case "canvas-core": return 1;
      case "premium-rhythm": return 2;
      case "composable-modules": return 3;
      default: return 0;
    }
  }, [activeFeatureId]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const root = rootRef.current;
    
    // Movimiento de paralaje base
    if (root) {
      const targetX = reducedMotion ? 0 : parallaxRef.current.y * 0.2;
      const targetY = reducedMotion ? 0 : parallaxRef.current.x * 0.3;
      root.rotation.x = MathUtils.damp(root.rotation.x, targetX, 3, delta);
      root.rotation.y = MathUtils.damp(root.rotation.y, targetY + (reducedMotion ? 0 : t * 0.05), 3, delta);
    }

    // Rotación de los anillos tecnológicos
    if (ringsRef.current && !reducedMotion) {
      ringsRef.current.children[0].rotation.x += 0.005;
      ringsRef.current.children[0].rotation.y += 0.002;
      ringsRef.current.children[1].rotation.y -= 0.008;
      ringsRef.current.children[1].rotation.z += 0.003;
    }

    // Pulso del núcleo central
    if (coreRef.current) {
      const coreScale = 1 + Math.sin(t * 2) * 0.05;
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.rotation.y += 0.01;
      coreRef.current.rotation.z += 0.005;
    }

    // Animación de los satélites (nodos)
    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      const isActive = index === activeIndex;
      const mat = node.material as Material & { emissiveIntensity?: number; wireframe?: boolean };
      
      // Orbita suave sin acumulacion de error frame a frame.
      node.position.y = points[index][1] + Math.sin(t * 2 + index) * 0.03;
      node.rotation.x += isActive ? 0.02 : 0.005;
      node.rotation.y += isActive ? 0.02 : 0.005;

      const targetScale = isActive ? 1.4 : 0.8;
      node.scale.setScalar(MathUtils.damp(node.scale.x, targetScale, 4, delta));

      if (typeof mat.emissiveIntensity === "number") {
        mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, isActive ? 2.5 : 0.5, 5, delta);
      }
    });
  });

  return (
    <group ref={rootRef} scale={1.1}>
      <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.08} floatIntensity={0.22}>
        
        {/* NÚCLEO CENTRAL (El Core) */}
        <Icosahedron ref={coreRef} args={[0.5, 0]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#000000"
            emissive="#22d3ee"
            emissiveIntensity={0.5}
            wireframe
            transparent
            opacity={0.8}
          />
        </Icosahedron>
        {/* Glow interno del núcleo */}
        <Sphere args={[0.35, 20, 20]}>
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </Sphere>

        {/* ANILLOS DE CONTENCIÓN */}
        <group ref={ringsRef}>
          <Torus args={[1.2, 0.008, 12, 72]} rotation={[Math.PI / 3, 0, 0]}>
            <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={1} />
          </Torus>
          <Torus args={[1.6, 0.004, 10, 60]} rotation={[0, Math.PI / 4, 0]}>
            <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={0.8} opacity={0.5} transparent />
          </Torus>
        </group>

        {/* NODOS SATÉLITES (Características) */}
        {points.map((p, index) => (
          <group key={`node-group-${index}`} position={p}>
            <Icosahedron
              ref={(node) => { nodeRefs.current[index] = node; }}
              args={[0.15, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onModuleSelect?.(index);
              }}
            >
              <meshPhysicalMaterial
                color={index % 2 === 0 ? "#b8e8ff" : "#e0ccff"}
                emissive={index % 2 === 0 ? "#22d3ee" : "#a855f7"}
                emissiveIntensity={0.5}
                transmission={0.9}
                roughness={0.1}
                thickness={0.5}
              />
            </Icosahedron>
            {/* Pequeño punto interior */}
            <Sphere args={[0.04, 10, 10]}>
              <meshBasicMaterial color="#ffffff" />
            </Sphere>
          </group>
        ))}

        {/* LÍNEAS DE CONEXIÓN DE DATOS */}
        <Line points={[points[0], [0,0,0], points[1]]} color="#22d3ee" lineWidth={1.5} transparent opacity={0.3} />
        <Line points={[points[2], [0,0,0], points[3]]} color="#a855f7" lineWidth={1.5} transparent opacity={0.3} />
        <Line points={[points[0], points[2]]} color="#67e8f9" lineWidth={0.5} transparent opacity={0.1} dashed dashScale={10} dashSize={1} gapSize={1} />
        <Line points={[points[1], points[3]]} color="#c084fc" lineWidth={0.5} transparent opacity={0.1} dashed dashScale={10} dashSize={1} gapSize={1} />

      </Float>
    </group>
  );
}

function FeaturesSystemScene({
  activeFeatureId = defaultFeatureId,
  parallaxRef,
  reducedMotion,
  onModuleSelect,
  onCanvasClick,
}: FeaturesSystemSceneProps) {
  const isLowPower = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMemory =
      typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
    const lowCores =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4;
    const isMobileViewport =
      typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    return lowMemory || lowCores || isMobileViewport;
  }, []);

  const dprMax = isLowPower ? 1.2 : 1.6;

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 4.5], fov: 40 }}
      dpr={[1, dprMax]}
      gl={{
        antialias: !isLowPower,
        alpha: true,
        powerPreference: "high-performance",
      }}
      frameloop={reducedMotion ? "demand" : "always"}
      onClick={() => onCanvasClick?.()}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 3, 10]} />
      
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0, 0]} intensity={isLowPower ? 1.35 : 2} color="#22d3ee" />
      <spotLight position={[3, 3, 3]} intensity={isLowPower ? 1 : 1.35} color="#8b5cf6" penumbra={1} />
      <spotLight position={[-3, -3, 3]} intensity={isLowPower ? 1 : 1.35} color="#38bdf8" penumbra={1} />

      {!isLowPower && (
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.45}
          blur={2.2}
          scale={7}
          far={4}
          color="#22d3ee"
        />
      )}
      <Environment preset={isLowPower ? "night" : "city"} />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={isLowPower ? 0.08 : 0.05}
        rotateSpeed={isLowPower ? 0.28 : 0.4}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
      
      <SceneCore
        activeFeatureId={activeFeatureId}
        parallaxRef={parallaxRef}
        reducedMotion={reducedMotion}
        onModuleSelect={onModuleSelect}
      />
    </Canvas>
  );
}

export default FeaturesSystemScene;