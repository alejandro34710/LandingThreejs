import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  Sphere,
  Torus,
  Sparkles,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Group, MathUtils, Mesh } from "three";

type FeatureNetworkSphereProps = {
  intensity: number;
  reducedMotion: boolean;
  onSphereClick?: () => void;
};

function CoreMesh({
  intensity,
  reducedMotion,
  onSphereClick,
}: FeatureNetworkSphereProps) {
  const rootRef = useRef<Group | null>(null);
  const orbRef = useRef<Mesh | null>(null);
  const coreRef = useRef<Mesh | null>(null);
  const ringARef = useRef<Mesh | null>(null);
  const ringBRef = useRef<Mesh | null>(null);

  const isDraggingRef = useRef(false);
  const isHoveringRef = useRef(false);

  const pointerIdRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const movedDistanceRef = useRef(0);

  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(0);

  const velYawRef = useRef(0);
  const velPitchRef = useRef(0);

  const clickBoostRef = useRef(0);

  const dragSensitivity = 0.0075;
  const pitchLimit = 1.08;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (reducedMotion) return;

    isDraggingRef.current = true;
    isHoveringRef.current = true;

    pointerIdRef.current = e.pointerId;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    movedDistanceRef.current = 0;

    velYawRef.current = 0;
    velPitchRef.current = 0;
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isHoveringRef.current = true;
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) {
      isHoveringRef.current = false;
    }
  };

  useEffect(() => {
    if (reducedMotion) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const last = lastPointerRef.current;
      if (!last) {
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;

      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      movedDistanceRef.current += Math.abs(dx) + Math.abs(dy);

      const yawDelta = dx * dragSensitivity;
      const pitchDelta = dy * dragSensitivity;

      targetYawRef.current += yawDelta;
      targetPitchRef.current += pitchDelta;
      targetPitchRef.current = MathUtils.clamp(
        targetPitchRef.current,
        -pitchLimit,
        pitchLimit,
      );

      velYawRef.current = yawDelta * 0.9;
      velPitchRef.current = pitchDelta * 0.9;
    };

    const handleWindowPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      lastPointerRef.current = null;
      pointerIdRef.current = null;
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [reducedMotion]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    if (reducedMotion) {
      onSphereClick?.();
      return;
    }

    // si arrastró, no lo tratamos como click
    if (movedDistanceRef.current > 10) return;

    clickBoostRef.current = 1;
    onSphereClick?.();
  };

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // idle base
    const idleYaw = reducedMotion ? 0 : t * 0.18;
    const idlePitch = reducedMotion ? 0 : Math.sin(t * 0.42) * 0.08;

    if (!reducedMotion && !isDraggingRef.current) {
      targetYawRef.current += velYawRef.current;
      targetPitchRef.current += velPitchRef.current;

      velYawRef.current = MathUtils.damp(velYawRef.current, 0, 3.2, delta);
      velPitchRef.current = MathUtils.damp(velPitchRef.current, 0, 3.2, delta);

      targetPitchRef.current = MathUtils.clamp(
        targetPitchRef.current,
        -pitchLimit,
        pitchLimit,
      );
    }

    yawRef.current = MathUtils.damp(
      yawRef.current,
      targetYawRef.current,
      10,
      delta,
    );
    pitchRef.current = MathUtils.damp(
      pitchRef.current,
      targetPitchRef.current,
      10,
      delta,
    );

    const hoverBoost = isHoveringRef.current ? 0.03 : 0;
    const pulse = 1 + Math.sin(t * 2.4) * 0.07 + Math.cos(t * 1.35) * 0.035;
    const clickBoost = clickBoostRef.current;

    if (rootRef.current) {
      rootRef.current.rotation.y = idleYaw + yawRef.current;
      rootRef.current.rotation.x = idlePitch + pitchRef.current;
      rootRef.current.rotation.z = Math.sin(t * 0.24) * 0.03;

      const s = 1 + hoverBoost + clickBoost * 0.05;
      rootRef.current.scale.setScalar(
        MathUtils.damp(rootRef.current.scale.x, s, 6, delta),
      );
    }

    if (orbRef.current) {
      const targetScale = pulse * (1 + clickBoost * 0.06);
      orbRef.current.scale.setScalar(
        MathUtils.damp(orbRef.current.scale.x, targetScale, 3.4, delta),
      );

      orbRef.current.rotation.y += reducedMotion ? 0 : 0.0045;
      orbRef.current.rotation.x += reducedMotion ? 0 : 0.0018;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += reducedMotion ? 0 : 0.016;
      coreRef.current.rotation.z -= reducedMotion ? 0 : 0.011;

      const material = coreRef.current.material as { emissiveIntensity?: number };
      if (typeof material.emissiveIntensity === "number") {
        const glowTarget = 1.7 + intensity * 3.2 + clickBoost * 2.4;
        material.emissiveIntensity = MathUtils.damp(
          material.emissiveIntensity,
          glowTarget,
          5.5,
          delta,
        );
      }
    }

    if (!reducedMotion && ringARef.current && ringBRef.current) {
      ringARef.current.rotation.x += 0.006;
      ringARef.current.rotation.y += 0.004;

      ringBRef.current.rotation.y -= 0.007;
      ringBRef.current.rotation.z += 0.005;
    }

    if (clickBoostRef.current > 0) {
      clickBoostRef.current = Math.max(0, clickBoostRef.current - delta * 1.6);
    }
  });

  return (
    <group ref={rootRef}>
      {/* esfera exterior interactiva */}
      <Sphere
        ref={orbRef}
        args={[0.9, 64, 64]}
        onPointerDown={handlePointerDown}
        onPointerUp={(e) => e.stopPropagation()}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.3}
          thickness={0.5}
          chromaticAberration={0.4}
          anisotropy={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={0}
          roughness={0.18}
          transmission={0.35}
          ior={1.32}
          color="#e0f2fe"
        />
      </Sphere>

      {/* núcleo wireframe */}
      <Sphere ref={coreRef} args={[0.45, 32, 32]}>
        <meshPhysicalMaterial
          color="#0ea5e9"
          emissive="#38bdf8"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </Sphere>

      {/* núcleo interno sólido */}
      <Sphere args={[0.42, 32, 32]}>
        <meshPhysicalMaterial
          color="#020617"
          emissive="#0284c7"
          emissiveIntensity={0.5}
          roughness={0.5}
          metalness={1}
        />
      </Sphere>

      {/* anillos */}
      <Torus
        ref={ringARef}
        args={[1.3, 0.015, 16, 100]}
        rotation={[Math.PI * 0.4, 0.2, 0]}
      >
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={2}
        />
      </Torus>

      <Torus
        ref={ringBRef}
        args={[1.1, 0.008, 16, 100]}
        rotation={[0.1, Math.PI * 0.6, 0.1]}
      >
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.5}
        />
      </Torus>

      {!reducedMotion && (
        <Sparkles
          count={60}
          scale={2.5}
          size={1.5}
          speed={0.4}
          color="#7dd3fc"
          opacity={0.6}
          noise={0.5}
        />
      )}
    </group>
  );
}

function FeatureNetworkSphere({
  intensity,
  reducedMotion,
  onSphereClick,
}: FeatureNetworkSphereProps) {
  const dpr = useMemo<[number, number]>(
    () => (reducedMotion ? [1, 1] : [1, 1.5]),
    [reducedMotion],
  );

  return (
    <Canvas
      className="h-full w-full"
      dpr={dpr}
      camera={{ position: [0, 0, 3.5], fov: 45 }}
      gl={{
        antialias: !reducedMotion,
        alpha: true,
        powerPreference: "high-performance",
      }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 0, 2]}
        intensity={5 + intensity * 3}
        color="#38bdf8"
        distance={10}
      />
      <spotLight
        position={[3, 3, 4]}
        intensity={4}
        color="#60a5fa"
        angle={0.5}
        penumbra={1}
        castShadow
      />
      <spotLight
        position={[-3, -3, 4]}
        intensity={3}
        color="#8b5cf6"
        angle={0.5}
        penumbra={1}
      />
      <spotLight
        position={[0, -4, 0]}
        intensity={2}
        color="#0284c7"
        angle={0.8}
        penumbra={1}
      />

      <CoreMesh
        intensity={intensity}
        reducedMotion={reducedMotion}
        onSphereClick={onSphereClick}
      />
    </Canvas>
  );
}

export default FeatureNetworkSphere;