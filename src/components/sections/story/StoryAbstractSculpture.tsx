import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Preload } from "@react-three/drei";
import {
  Suspense,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
} from "three";
import type { StoryInteractionValue } from "./useStoryInteraction";
import usePerformanceMode from "../../../hooks/usePerformanceMode";

function TwinkleSpheresBackground({
  reducedMotion,
  isMobile,
}: {
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const sphereMeshesRef = useRef<Mesh[]>([]);

  const mulberry32 = (seed: number) => {
    let a = seed >>> 0;
    return () => {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const spheres = useMemo(() => {
    const count = isMobile ? 24 : 90;
    const rand = mulberry32(133742069);

    return Array.from({ length: count }, () => {
      const x = (rand() * 2 - 1) * 6.5;
      const y = (rand() * 2 - 1) * 4.5;
      const z = -(2 + rand() * 18);

      const radius = 0.02 + rand() * 0.055;
      const phase = rand() * Math.PI * 2;
      const speed = 0.55 + rand() * 1.65;
      const twinkleBias = 0.55 + rand() * 0.25;

      const hue = 0.55 + rand() * 0.22;
      const saturation = 0.85;
      const lightness = 0.55 + rand() * 0.2;
      const baseColor = new Color().setHSL(hue, saturation, lightness);

      return { x, y, z, radius, phase, speed, twinkleBias, baseColor };
    });
  }, [isMobile]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;

    const t = clock.getElapsedTime();
    for (let idx = 0; idx < spheres.length; idx += 1) {
      const mesh = sphereMeshesRef.current[idx];
      if (!mesh) continue;

      const s = spheres[idx];
      const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
      const over = Math.max(0, (tw - s.twinkleBias) / (1 - s.twinkleBias));
      const flicker = Math.pow(over, 4);
      const intensity = 0.08 + flicker * 0.95;

      mesh.scale.setScalar(0.85 + intensity * 0.75);

      const mat = mesh.material as MeshBasicMaterial | MeshBasicMaterial[];
      const targetMat = Array.isArray(mat) ? mat[0] : mat;
      targetMat.color.copy(s.baseColor).multiplyScalar(0.35 + intensity);
      targetMat.opacity = 0.06 + intensity * 0.28;
    }
  });

  return (
    <group>
      {spheres.map((s, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            if (!el) return;
            sphereMeshesRef.current[idx] = el;
          }}
          position={[s.x, s.y, s.z]}
        >
          <sphereGeometry args={[s.radius, 12, 12]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            transparent
            depthWrite={false}
            opacity={0.12}
            color={s.baseColor}
          />
        </mesh>
      ))}
    </group>
  );
}

function PremiumMobiusImpl({
  interaction,
  reducedMotion,
  isMobile,
}: {
  interaction: MutableRefObject<StoryInteractionValue>;
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const groupRef = useRef<Group | null>(null);
  const outerGlassRef = useRef<MeshPhysicalMaterial | null>(null);
  const innerCoreRef = useRef<MeshPhysicalMaterial | null>(null);

  const localRotXRef = useRef(0);
  const localRotYRef = useRef(0);
  const localVelXRef = useRef(0);
  const localVelYRef = useRef(0);

  const hoverSmoothRef = useRef(0);
  const pulseSmoothRef = useRef(0);
  const prevInputVelXRef = useRef(0);
  const prevInputVelYRef = useRef(0);
  const hasInitInputVelRef = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const i = interaction.current;

    if (!hasInitInputVelRef.current) {
      prevInputVelXRef.current = i.velX;
      prevInputVelYRef.current = i.velY;
      hasInitInputVelRef.current = true;
    }

    const deltaVelX = i.velX - prevInputVelXRef.current;
    const deltaVelY = i.velY - prevInputVelYRef.current;
    prevInputVelXRef.current = i.velX;
    prevInputVelYRef.current = i.velY;

    if (!reducedMotion) {
      if (i.isDragging) {
        localVelXRef.current += deltaVelX;
        localVelYRef.current += deltaVelY;

        localRotXRef.current += localVelXRef.current;
        localRotYRef.current += localVelYRef.current;

        localVelXRef.current *= 0.86;
        localVelYRef.current *= 0.86;
      } else {
        localVelXRef.current += deltaVelX;
        localVelYRef.current += deltaVelY;

        localRotXRef.current += localVelXRef.current;
        localRotYRef.current += localVelYRef.current;

        localVelXRef.current *= 0.9;
        localVelYRef.current *= 0.9;
      }
    } else {
      localRotXRef.current = 0;
      localRotYRef.current = 0;
      localVelXRef.current = 0;
      localVelYRef.current = 0;
    }

    const hoverTarget = reducedMotion ? 0 : i.hover;
    const pulseTarget = i.pulse;

    hoverSmoothRef.current += (hoverTarget - hoverSmoothRef.current) * (reducedMotion ? 1 : 0.14);
    pulseSmoothRef.current += (pulseTarget - pulseSmoothRef.current) * (reducedMotion ? 1 : 0.22);

    const hover = hoverSmoothRef.current;
    const pulse = pulseSmoothRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.x =
        localRotXRef.current * 0.5 + Math.sin(t * 0.3) * 0.1;
      groupRef.current.rotation.y = t * 0.15 + localRotYRef.current * 0.5;

      const s = 1 + pulse * 0.05 + hover * 0.03;
      groupRef.current.scale.set(s, s, s);
    }

    if (outerGlassRef.current && innerCoreRef.current) {
      outerGlassRef.current.emissiveIntensity = 0.08 + hover * 0.22 + pulse * 0.3;
      innerCoreRef.current.emissiveIntensity = 0.42 + hover * 0.35 + pulse * 0.8;
    }
  });

  const knotSegments = isMobile ? 128 : 200;
  const knotSidesInner = isMobile ? 20 : 32;
  const knotSidesOuter = isMobile ? 28 : 48;

  return (
    <group ref={groupRef}>
      <Float
        speed={reducedMotion ? 0 : 2}
        rotationIntensity={0.18}
        floatIntensity={0.45}
      >
        <mesh scale={0.88}>
          <torusKnotGeometry args={[0.9, 0.25, knotSegments, knotSidesInner]} />
          <meshPhysicalMaterial
            ref={innerCoreRef}
            color="#220044"
            emissive="#7b2cbf"
            emissiveIntensity={0.42}
            roughness={0.22}
            metalness={0.75}
            clearcoat={1}
          />
        </mesh>

        <mesh scale={1}>
          <torusKnotGeometry args={[0.9, 0.3, knotSegments, knotSidesOuter]} />
          <meshPhysicalMaterial
            ref={outerGlassRef}
            color="#f8fbff"
            transmission={0.96}
            opacity={1}
            transparent
            thickness={1.1}
            roughness={0.08}
            ior={1.32}
            iridescence={0.45}
            iridescenceIOR={1.22}
            iridescenceThicknessRange={[120, 260]}
            clearcoat={1}
            envMapIntensity={0.65}
            depthWrite
          />
        </mesh>
      </Float>
    </group>
  );
}

function SceneContent({
  interactionRef,
  reducedMotion,
  isMobile,
}: {
  interactionRef: MutableRefObject<StoryInteractionValue>;
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  return (
    <>
      <TwinkleSpheresBackground reducedMotion={reducedMotion} isMobile={isMobile} />

      {!isMobile ? (
        <Environment
          preset="city"
          background={false}
          blur={0.6}
        />
      ) : null}

      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} color="#e0c3fc" />
      <pointLight position={[-5, -5, 2]} intensity={1.4} color="#8ec5fc" />

      <PremiumMobiusImpl
        interaction={interactionRef}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />

      {!isMobile ? <Preload all /> : null}
    </>
  );
}

function StoryAbstractSculpture({
  interactionRef,
  reducedMotion,
  isMobile,
}: {
  interactionRef: MutableRefObject<StoryInteractionValue>;
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const { isLowPowerMode } = usePerformanceMode();
  const mobileMode = isMobile || isLowPowerMode;

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={mobileMode ? [1, 1] : [1, 1.65]}
      gl={{ antialias: !mobileMode, alpha: true, powerPreference: mobileMode ? "high-performance" : "default" }}
      frameloop={reducedMotion ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Suspense fallback={null}>
        <SceneContent
          interactionRef={interactionRef}
          reducedMotion={reducedMotion}
          isMobile={mobileMode}
        />
      </Suspense>
    </Canvas>
  );
}

export default StoryAbstractSculpture;