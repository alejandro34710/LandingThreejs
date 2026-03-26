import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, MathUtils, Vector3 } from "three";
import OrbitCore from "./OrbitCore";
import OrbitParticles from "./OrbitParticles";
import SceneLights from "./SceneLights";
import type { OrbitVariant } from "./orbitVariants";
import type { MutableRefObject } from "react";
import type { OrbitStoryValues } from "../../hooks/useHeroScrollTimeline";

type RotationOffset = { x: number; y: number };

type OrbitSceneProps = {
  className?: string;
  isMobile?: boolean;
  fromPreset: OrbitVariant;
  toPreset: OrbitVariant;
  mixRef: MutableRefObject<{ value: number }>;

  rotationOffsetRef: MutableRefObject<RotationOffset>;
  velocityRef: MutableRefObject<RotationOffset>;
  isDraggingRef: MutableRefObject<boolean>;
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
  orbitStoryRef: MutableRefObject<OrbitStoryValues>;
};

function OrbitRig({
  isMobile = false,
  fromPreset,
  toPreset,
  mixRef,
  rotationOffsetRef,
  velocityRef,
  isDraggingRef,
  parallaxRef,
  orbitStoryRef,
}: Omit<OrbitSceneProps, "className">) {
  const rigRef = useRef<Group | null>(null);
  const fromGroupRef = useRef<Group | null>(null);
  const toGroupRef = useRef<Group | null>(null);

  // Reducir draw calls: cuando el preset "from" está casi totalmente cruzado,
  // lo ocultamos para evitar que se rendericen materiales caros (transmission/normal).
  const visibilityEps = 0.01;

  const cameraLookAtRef = useRef(new Vector3(0, 0, 0));
  const parallaxCurrent = useRef({ x: 0, y: 0 });

  const basePos = useMemo(
    () => (isMobile ? new Vector3(0, -0.02, 0) : new Vector3(0.38, -0.04, 0)),
    [isMobile],
  );
  const baseRigScale = isMobile ? 1.5 : 1.08;
  const baseCameraZ = isMobile ? 8.5 : 10.4;

  const fromPresetRef = useRef(fromPreset);
  const toPresetRef = useRef(toPreset);

  useEffect(() => {
    fromPresetRef.current = fromPreset;
    toPresetRef.current = toPreset;
  }, [fromPreset, toPreset]);

  useFrame((state) => {
    const { clock, camera } = state;
    const rig = rigRef.current;
    if (!rig) return;

    const mix = mixRef.current.value;
    const wTo = Math.max(0, Math.min(1, mix));
    const wFrom = 1 - wTo;

    if (fromGroupRef.current) fromGroupRef.current.visible = wFrom > visibilityEps;
    if (toGroupRef.current) toGroupRef.current.visible = wTo > visibilityEps;

    // Crossfade scaling (tiny “expensive” feel)
    if (fromGroupRef.current) fromGroupRef.current.scale.setScalar(0.98 + wFrom * 0.02);
    if (toGroupRef.current) toGroupRef.current.scale.setScalar(0.98 + wTo * 0.02);

    // Parallax smoothing
    const pxT = parallaxRef.current.x;
    const pyT = parallaxRef.current.y;
    parallaxCurrent.current.x = MathUtils.lerp(parallaxCurrent.current.x, pxT, 0.08);
    parallaxCurrent.current.y = MathUtils.lerp(parallaxCurrent.current.y, pyT, 0.08);

    const t = clock.getElapsedTime();
    const currentFrom = fromPresetRef.current;
    const currentTo = toPresetRef.current;
    const speed = MathUtils.lerp(currentFrom.visuals.orbitSpeedMultiplier, currentTo.visuals.orbitSpeedMultiplier, wTo);

    // Idle motion (subtle + premium)
    const idleYaw = t * 0.055 * speed;
    const idlePitch = Math.sin(t * 0.42) * 0.06;
    const idleRoll = Math.sin(t * 0.31) * 0.012;
    const floatY = Math.sin(t * 0.65) * 0.015;

    // Drag inertia + easing back to idle
    const rotOffset = rotationOffsetRef.current;
    const vel = velocityRef.current;
    const isDragging = isDraggingRef.current;

    // Integración de offset (los deltas vienen de drag en el hook)
    rotOffset.x += vel.x;
    rotOffset.y += vel.y;

    if (isDragging) {
      vel.x *= 0.86;
      vel.y *= 0.86;
    } else {
      vel.x *= 0.93;
      vel.y *= 0.9;
      // Return suave al centro (sin “reset brusco”)
      rotOffset.x += (0 - rotOffset.x) * 0.045;
      rotOffset.y += (0 - rotOffset.y) * 0.045;
    }

    // Clamp vertical (pitch)
    const pitchLimit = 0.7;
    rotOffset.x = Math.max(-pitchLimit, Math.min(pitchLimit, rotOffset.x));

    const story = orbitStoryRef.current;
    const energySafe = Math.max(0, Math.min(1.5, story.energy));

    // Rig transform
    // Multiplicador leve para que el “handoff” lateral se perciba sin saltos.
    rig.position.x = basePos.x + parallaxCurrent.current.x * 0.12 + story.offsetX * 1.15;
    rig.position.y = basePos.y + parallaxCurrent.current.y * 0.08 + floatY + story.offsetY;
    rig.position.z = basePos.z + parallaxCurrent.current.x * 0.03 + story.offsetZ;
    rig.scale.setScalar(baseRigScale * story.scaleMul);
    rig.rotation.x = idlePitch * story.motionMul + rotOffset.x + story.rotAddX;
    rig.rotation.y = idleYaw * story.motionMul + rotOffset.y + story.rotAddY;
    rig.rotation.z = idleRoll * story.motionMul + story.rotAddZ;

    // Micro “depth cues”: nudge de cámara por preset + parallax
    const camNudge = {
      x: MathUtils.lerp(currentFrom.visuals.cameraNudge[0], currentTo.visuals.cameraNudge[0], wTo),
      y: MathUtils.lerp(currentFrom.visuals.cameraNudge[1], currentTo.visuals.cameraNudge[1], wTo),
      z: MathUtils.lerp(currentFrom.visuals.cameraNudge[2], currentTo.visuals.cameraNudge[2], wTo),
    };
    camera.position.x =
      camNudge.x + parallaxCurrent.current.x * 0.22 + story.offsetX * (0.52 + energySafe * 0.2);
    camera.position.y = camNudge.y + parallaxCurrent.current.y * 0.18 + story.offsetY * (0.5 + energySafe * 0.2);
    camera.position.z = baseCameraZ + camNudge.z + story.offsetZ * (0.9 + energySafe * 0.25);
    camera.lookAt(cameraLookAtRef.current);
  });

  return (
    <group ref={rigRef} position={[basePos.x, basePos.y, basePos.z]} scale={baseRigScale}>
      <SceneLights />

      {/* Variant “from” */}
      <group ref={fromGroupRef}>
        <OrbitCore preset={fromPreset} mixRef={mixRef} weightMode="from" orbitStoryRef={orbitStoryRef} />
        <OrbitParticles preset={fromPreset} mixRef={mixRef} weightMode="from" orbitStoryRef={orbitStoryRef} />
      </group>

      {/* Variant “to” */}
      <group ref={toGroupRef}>
        <OrbitCore preset={toPreset} mixRef={mixRef} weightMode="to" orbitStoryRef={orbitStoryRef} />
        <OrbitParticles preset={toPreset} mixRef={mixRef} weightMode="to" orbitStoryRef={orbitStoryRef} />
      </group>
    </group>
  );
}

function OrbitScene({
  className = "h-full w-full",
  isMobile = false,
  fromPreset,
  toPreset,
  mixRef,
  rotationOffsetRef,
  velocityRef,
  isDraggingRef,
  parallaxRef,
  orbitStoryRef,
}: OrbitSceneProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 10.4], fov: 34 }}
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={["#050816", 10, 18]} />
      <OrbitRig
        isMobile={isMobile}
        fromPreset={fromPreset}
        toPreset={toPreset}
        mixRef={mixRef}
        rotationOffsetRef={rotationOffsetRef}
        velocityRef={velocityRef}
        isDraggingRef={isDraggingRef}
        parallaxRef={parallaxRef}
        orbitStoryRef={orbitStoryRef}
      />
    </Canvas>
  );
}

export default OrbitScene;