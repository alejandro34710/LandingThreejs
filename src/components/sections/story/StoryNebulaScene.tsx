import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useRef, type MutableRefObject } from "react";
import { Group, MeshPhysicalMaterial, AdditiveBlending, Mesh } from "three";
import type { StoryInteractionValue } from "./useStoryInteraction";

function QuantumPrismImpl({
  interaction,
  reducedMotion,
}: {
  interaction: MutableRefObject<StoryInteractionValue>;
  reducedMotion: boolean;
}) {
  const masterGroup = useRef<Group | null>(null);
  const coreRef = useRef<Mesh | null>(null);
  const ringRef = useRef<Mesh | null>(null);
  const glassMatRef = useRef<MeshPhysicalMaterial | null>(null);

  // Inercia/rotación manejada localmente para evitar mutar `interaction` (props)
  const localRotXRef = useRef(0);
  const localRotYRef = useRef(0);
  const localVelXRef = useRef(0);
  const localVelYRef = useRef(0);
  const prevInputVelXRef = useRef(0);
  const prevInputVelYRef = useRef(0);
  const hasInitInputVelRef = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const i = interaction.current;

    // Delta de velocidad desde el input del hook.
    // Interpretamos `vel*` como "acumulador de incrementos" y aplicamos solo el delta.
    if (!hasInitInputVelRef.current) {
      prevInputVelXRef.current = i.velX;
      prevInputVelYRef.current = i.velY;
      hasInitInputVelRef.current = true;
    }

    const deltaVelX = i.velX - prevInputVelXRef.current;
    const deltaVelY = i.velY - prevInputVelYRef.current;
    prevInputVelXRef.current = i.velX;
    prevInputVelYRef.current = i.velY;

    const pulse = i.pulse;
    const hover = reducedMotion ? 0 : i.hover;

    if (!reducedMotion) {
      localVelXRef.current += deltaVelX;
      localVelYRef.current += deltaVelY;

      if (i.isDragging) {
        localRotXRef.current += localVelXRef.current;
        localRotYRef.current += localVelYRef.current;
        localVelXRef.current *= 0.88;
        localVelYRef.current *= 0.88;
      } else {
        localVelXRef.current *= 0.9;
        localVelYRef.current *= 0.9;
        localRotXRef.current += (0 - localRotXRef.current) * 0.05;
        localRotYRef.current += (0 - localRotYRef.current) * 0.05;
      }
    } else {
      localRotXRef.current = 0;
      localRotYRef.current = 0;
      localVelXRef.current = 0;
      localVelYRef.current = 0;
    }

    // Animación del contenedor principal
    if (masterGroup.current) {
      masterGroup.current.rotation.x =
        localRotXRef.current * 0.6 + i.parallaxY * 0.2;
      masterGroup.current.rotation.y =
        t * 0.1 + localRotYRef.current * 0.6 + i.parallaxX * 0.2;
      
      const s = 1 + hover * 0.05 + pulse * 0.08;
      masterGroup.current.scale.set(s, s, s);
    }

    // Animaciones independientes internas
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.5;
      coreRef.current.rotation.y = t * 0.4;
      const coreScale = 1 + pulse * 0.3; // El núcleo late fuerte al click
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = 1.5 + Math.sin(t * 0.5) * 0.2;
      ringRef.current.rotation.y = t * 0.8;
    }

    if (glassMatRef.current) {
      glassMatRef.current.emissiveIntensity = hover * 0.5 + pulse;
    }
  });

  return (
    <group ref={masterGroup}>
      <Float speed={reducedMotion ? 0 : 3} rotationIntensity={0.5} floatIntensity={1}>
        
        {/* CAPA 1: Diamante exterior (Cristal esmerilado) */}
        <mesh>
          <icosahedronGeometry args={[1.4, 0]} /> {/* 0 = Caras planas estilo diamante */}
          <meshPhysicalMaterial
            ref={glassMatRef}
            color="#ffffff"
            transmission={0.9}
            opacity={1}
            transparent
            thickness={2}
            roughness={0.15} // Ligeramente esmerilado
            ior={1.6}
            clearcoat={1}
            emissive="#00e5ff"
            emissiveIntensity={0}
            depthWrite={true}
          />
        </mesh>

        {/* CAPA 2: Anillo de datos u órbita (Neon) */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.7, 0.02, 16, 100]} />
          <meshBasicMaterial 
            color="#00e5ff" 
            transparent 
            opacity={0.6} 
            blending={AdditiveBlending} 
          />
        </mesh>

        {/* CAPA 3: Núcleo denso de energía */}
        <mesh ref={coreRef}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color="#00aaff"
            emissive="#00e5ff"
            emissiveIntensity={2}
            roughness={0.2}
            metalness={1}
          />
        </mesh>

      </Float>
    </group>
  );
}

function StoryNebulaScene({
  interactionRef,
  reducedMotion,
}: {
  interactionRef: MutableRefObject<StoryInteractionValue>;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 6], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <Environment preset="studio" />
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={3} color="#00e5ff" />
      <pointLight position={[-3, -3, -3]} intensity={2} color="#ff00e5" />
      
      <QuantumPrismImpl interaction={interactionRef} reducedMotion={reducedMotion} />
    </Canvas>
  );
}

export default StoryNebulaScene;