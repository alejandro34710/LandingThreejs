import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, Float, Sphere, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Color, Group, MathUtils, Vector3, Mesh } from "three";
import SceneLights from "../../three/SceneLights";
import usePerformanceMode from "../../../hooks/usePerformanceMode";

type Parallax = { x: number; y: number };

type FinalOrbitalObjectProps = {
  parallax: Parallax;
  reducedMotion: boolean;
};

type InteractionRefs = {
  dragRef: React.MutableRefObject<{ x: number; y: number; vx: number; vy: number }>;
  pulseRef: React.MutableRefObject<{ requested: boolean; t0: number }>;
};

// Componente para los pequeños satélites que orbitan los anillos
function OrbitingSatellite({
  radius,
  speed,
  color,
  offsetAngle,
  isLowPowerMode,
}: {
  radius: number;
  speed: number;
  color: string;
  offsetAngle: number;
  isLowPowerMode: boolean;
}) {
  const ref = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offsetAngle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.04, isLowPowerMode ? 10 : 14, isLowPowerMode ? 10 : 14]} />
        <meshBasicMaterial color={new Color(color)} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ClosureRig({
  parallax,
  reducedMotion,
  dragRef,
  pulseRef,
  isLowPowerMode,
}: FinalOrbitalObjectProps & InteractionRefs & { isLowPowerMode: boolean }) {
  const rigRef = useRef<Group | null>(null);
  const outerCoreRef = useRef<Mesh | null>(null);
  const innerCoreRef = useRef<Mesh | null>(null);
  const ringsRef = useRef<Array<Group | null>>([]);

  const parallaxCurrent = useRef({ x: 0, y: 0 });
  const targetLookAt = useRef(new Vector3(0, 0, 0));

  // Paleta de colores Premium Sci-Fi
  const coreColor = useMemo(() => new Color("#0ea5e9"), []); // Sky Blue
  const innerEnergyColor = useMemo(() => new Color("#818cf8"), []); // Indigo
  const glowColor = useMemo(() => new Color("#22d3ee"), []); // Cyan
  
  const ringsData = useMemo(() => [
    { r: 1.4, tube: 0.008, color: "#38bdf8", speed: 0.2, satellites: 1 },
    { r: 1.8, tube: 0.015, color: "#818cf8", speed: 0.1, satellites: 2 },
    { r: 2.2, tube: 0.005, color: "#c084fc", speed: -0.15, satellites: 1 },
  ], []);

  useFrame(({ clock, camera }) => {
    const rig = rigRef.current;
    if (!rig) return;

    const t = clock.getElapsedTime();
    const idleAuto = reducedMotion ? 0 : 1;

    // Pulso por click: sube brillo y luego cae
    let pulse = 0;
    if (pulseRef.current.requested) {
      const dt = t - pulseRef.current.t0;
      // Attack rápido y decay suave (~0.9s)
      pulse = Math.exp(-dt * 3.2) * (1 - Math.exp(-dt * 20));
      if (dt > 1.2) pulseRef.current.requested = false;
    }

    // Decaimiento suave del "momentum" cuando sueltas el drag
    dragRef.current.vx *= 0.92;
    dragRef.current.vy *= 0.92;
    dragRef.current.x += dragRef.current.vx;
    dragRef.current.y += dragRef.current.vy;

    // Suavizado del Parallax
    const pxT = reducedMotion ? 0 : parallax.x;
    const pyT = reducedMotion ? 0 : parallax.y;
    parallaxCurrent.current.x = MathUtils.lerp(parallaxCurrent.current.x, pxT, 0.05);
    parallaxCurrent.current.y = MathUtils.lerp(parallaxCurrent.current.y, pyT, 0.05);

    // Movimiento orgánico del Rig completo
    const breath = 1 + Math.sin(t * 1.5) * 0.015 * idleAuto;
    const floatY = Math.sin(t * 0.8) * 0.05 * idleAuto;

    rig.rotation.x =
      Math.sin(t * 0.3) * 0.05 * idleAuto +
      parallaxCurrent.current.y * 0.15 * idleAuto +
      dragRef.current.y * 0.6;
    rig.rotation.y =
      t * 0.05 * idleAuto +
      parallaxCurrent.current.x * 0.2 * idleAuto +
      dragRef.current.x * 0.6;
    rig.rotation.z = Math.sin(t * 0.2) * 0.02 * idleAuto;
    rig.position.y = floatY;
    rig.scale.setScalar(breath * (1 + pulse * 0.03));

    // Animación del Núcleo (Core)
    if (outerCoreRef.current && innerCoreRef.current) {
      outerCoreRef.current.rotation.y = t * 0.1 * idleAuto;
      outerCoreRef.current.rotation.z = t * 0.05 * idleAuto;
      
      const innerScale = 0.65 + Math.sin(t * 3) * 0.02 * idleAuto;
      innerCoreRef.current.scale.setScalar(innerScale * (1 + pulse * 0.08));
      innerCoreRef.current.rotation.y = -t * 0.2 * idleAuto;

      // Un poco más de energía visual con el pulso
      const innerMat = innerCoreRef.current.material as unknown as { emissiveIntensity?: number };
      const outerMat = outerCoreRef.current.material as unknown as { emissiveIntensity?: number };
      if (typeof innerMat.emissiveIntensity === "number") innerMat.emissiveIntensity = 2 + pulse * 2.2;
      if (typeof outerMat.emissiveIntensity === "number") outerMat.emissiveIntensity = 0.2 + pulse * 0.6;
    }

    // Animación de los Anillos
    ringsRef.current.forEach((ringGroup, idx) => {
      if (!ringGroup) return;
      const data = ringsData[idx];
      ringGroup.rotation.x = Math.sin(t * 0.1 + idx) * 0.2 * idleAuto;
      ringGroup.rotation.y = t * data.speed * idleAuto;
    });

    // Seguimiento de cámara suave
    camera.position.x = parallaxCurrent.current.x * 0.5;
    camera.position.y = parallaxCurrent.current.y * 0.5;
    camera.position.z = 9;
    camera.lookAt(targetLookAt.current);
  });

  return (
    <group ref={rigRef}>
      <SceneLights />
      
      <Environment preset="city" />

      {/* --- NÚCLEO COMPLEJO --- */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group>
          <mesh ref={innerCoreRef}>
            <icosahedronGeometry args={[1, 3]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={innerEnergyColor}
              emissiveIntensity={2}
              wireframe={true}
              transparent
              opacity={0.8}
            />
          </mesh>

          <mesh ref={outerCoreRef}>
            <sphereGeometry args={[1.05, isLowPowerMode ? 28 : 64, isLowPowerMode ? 28 : 64]} />
            {isLowPowerMode ? (
              <meshStandardMaterial
                color="#020617"
                emissive={coreColor}
                emissiveIntensity={0.16}
                transparent
                opacity={0.68}
                metalness={0.45}
                roughness={0.3}
              />
            ) : (
              <meshPhysicalMaterial
                color="#020617"
                emissive={coreColor}
                emissiveIntensity={0.2}
                transparent
                opacity={0.7}
                metalness={0.9}
                roughness={0.05}
                clearcoat={1}
                clearcoatRoughness={0.1}
                ior={1.5}
                thickness={2}
                transmission={0.9}
              />
            )}
          </mesh>

          <Sphere args={[1.3, 32, 32]}>
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.04}
              depthWrite={false}
              blending={2}
            />
          </Sphere>
        </group>
      </Float>

      {/* --- ANILLOS TECNOLÓGICOS Y SATÉLITES --- */}
      {ringsData.map((ring, idx) => (
        <group 
          key={`ring-group-${idx}`} 
          ref={(node) => { ringsRef.current[idx] = node; }}
          rotation={[Math.PI / 3 + idx * 0.2, 0, 0]}
        >
          <mesh>
            <torusGeometry args={[ring.r, ring.tube, isLowPowerMode ? 14 : 32, isLowPowerMode ? 44 : 100]} />
            <meshStandardMaterial
              color={ring.color}
              emissive={ring.color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>

          {!reducedMotion && Array.from({ length: ring.satellites }).map((_, satIdx) => (
            <OrbitingSatellite
              key={`sat-${idx}-${satIdx}`}
              radius={ring.r}
              speed={ring.speed * 2}
              color={ring.color}
              offsetAngle={(Math.PI * 2 / ring.satellites) * satIdx}
              isLowPowerMode={isLowPowerMode}
            />
          ))}
        </group>
      ))}

      {/* =========================================
          PARTÍCULAS ESPACIALES REALISTAS
          ========================================= */}
      
      {/* Estrellas estáticas de fondo (Espacio profundo) */}
      <Stars 
        radius={15}      // Alejadas del centro
        depth={25}       // Profundidad de campo mayor
        count={reducedMotion ? 180 : isLowPowerMode ? 300 : 2500} // Más cantidad para poblar el espacio
        factor={1.5}     // Tamaño base muy pequeño (antes estaba en 4)
        saturation={0.5} // Ligero tinte de color realista
        fade             // Que se difuminen en los bordes
        speed={0.2}      // Titileo muy lento
      />
      
      {/* Polvo estelar (Sparkles) interactuando alrededor del objeto */}
      <Sparkles
        count={reducedMotion ? 10 : isLowPowerMode ? 18 : 60}
        scale={6}        // Rango amplio
        size={0.6}       // Tamaño de la partícula mucho más fino
        speed={0.15}     // Movimiento pausado
        color="#cffafe"  // Tinte cyan ultra claro
        opacity={0.3}    // Semitransparente, como polvo
        noise={0.8}
      />
    </group>
  );
}

function FinalOrbitalObject({ parallax, reducedMotion }: FinalOrbitalObjectProps) {
  const { isLowPowerMode } = usePerformanceMode();
  const quality = useMemo(() => {
    return { dpr: isLowPowerMode ? 1 : 1.25 };
  }, [isLowPowerMode]);

  const isDragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pulseRef = useRef<{ requested: boolean; t0: number }>({ requested: false, t0: 0 });

  useEffect(() => {}, []);

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 9], fov: 35 }}
      dpr={[1, quality.dpr]}
      gl={{ antialias: !isLowPowerMode, alpha: true, logarithmicDepthBuffer: false }}
      onPointerDown={(e) => {
        isDragging.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        // Captura para seguir recibiendo eventos aunque salgas del canvas
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!isDragging.current) return;
        if (!lastPointer.current) {
          lastPointer.current = { x: e.clientX, y: e.clientY };
          return;
        }
        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;
        lastPointer.current = { x: e.clientX, y: e.clientY };

        // Normalización simple: sensibilidad estable por pixel
        const s = 0.0022;
        dragRef.current.vx = MathUtils.clamp(dragRef.current.vx + dx * s, -0.08, 0.08);
        dragRef.current.vy = MathUtils.clamp(dragRef.current.vy + dy * s, -0.08, 0.08);
        dragRef.current.x += dx * s;
        dragRef.current.y += dy * s;
      }}
      onPointerUp={(e) => {
        isDragging.current = false;
        lastPointer.current = null;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      }}
      onPointerCancel={() => {
        isDragging.current = false;
        lastPointer.current = null;
      }}
      onPointerLeave={() => {
        isDragging.current = false;
        lastPointer.current = null;
      }}
      onClick={() => {
        pulseRef.current.requested = true;
        pulseRef.current.t0 = performance.now() / 1000;
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{ background: "transparent", touchAction: "none" }}
    >
      <fog attach="fog" args={["#020308", 8, 20]} /> 
      <ClosureRig
        parallax={parallax}
        reducedMotion={reducedMotion}
        dragRef={dragRef}
        pulseRef={pulseRef}
        isLowPowerMode={isLowPowerMode}
      />
    </Canvas>
  );
}

export default FinalOrbitalObject;