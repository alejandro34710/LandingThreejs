import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  PointsMaterial,
} from "three";
import type { ManifestMouseFieldValue } from "./useManifestMouseField";

function createRandomCenteredPositions(count: number, rangeX: number, rangeY: number, rangeZ: number) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * rangeX;
    positions[i * 3 + 1] = (Math.random() - 0.5) * rangeY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * rangeZ;
  }

  return positions;
}

function createRandomLinePositions(
  lineConnections: number,
  nodePositions: Float32Array,
  nodeCount: number,
) {
  const linePositions = new Float32Array(lineConnections * 2 * 3);

  for (let i = 0; i < lineConnections; i++) {
    const a = Math.floor(Math.random() * nodeCount);
    let b = Math.floor(Math.random() * nodeCount);
    if (b === a) b = (b + 1) % nodeCount;

    const ax = nodePositions[a * 3 + 0];
    const ay = nodePositions[a * 3 + 1];
    const az = nodePositions[a * 3 + 2];

    const bx = nodePositions[b * 3 + 0];
    const by = nodePositions[b * 3 + 1];
    const bz = nodePositions[b * 3 + 2];

    linePositions[i * 6 + 0] = ax;
    linePositions[i * 6 + 1] = ay;
    linePositions[i * 6 + 2] = az;
    linePositions[i * 6 + 3] = bx;
    linePositions[i * 6 + 4] = by;
    linePositions[i * 6 + 5] = bz;
  }

  return linePositions;
}

const MANIFEST_AMBIENT_PRECOMPUTED = {
  mobile: (() => {
    const particleCount = 70;
    const nodeCount = 10;
    const lineConnections = 18;
    const starsCount = 65;

    const particlePositions = createRandomCenteredPositions(
      particleCount,
      4.2,
      2.8,
      3.2,
    );
    const nodesPositions = createRandomCenteredPositions(nodeCount, 2.6, 1.8, 2.2);
    const linePositions = createRandomLinePositions(
      lineConnections,
      nodesPositions,
      nodeCount,
    );
    const starsPositions = createRandomCenteredPositions(
      starsCount,
      5.0,
      3.2,
      3.6,
    );

    return { particlePositions, nodesPositions, linePositions, starsPositions };
  })(),
  desktop: (() => {
    const particleCount = 130;
    const nodeCount = 18;
    const lineConnections = 36;
    const starsCount = 120;

    const particlePositions = createRandomCenteredPositions(
      particleCount,
      4.2,
      2.8,
      3.2,
    );
    const nodesPositions = createRandomCenteredPositions(nodeCount, 2.6, 1.8, 2.2);
    const linePositions = createRandomLinePositions(
      lineConnections,
      nodesPositions,
      nodeCount,
    );
    const starsPositions = createRandomCenteredPositions(
      starsCount,
      5.0,
      3.2,
      3.6,
    );

    return { particlePositions, nodesPositions, linePositions, starsPositions };
  })(),
} as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);

    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);

    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return isMobile;
}

function AmbientRig({
  isMobile,
  reducedMotion,
  mouseFieldRef,
  scrollPulseRef,
}: {
  isMobile: boolean;
  reducedMotion: boolean;
  mouseFieldRef: MutableRefObject<ManifestMouseFieldValue>;
  scrollPulseRef: MutableRefObject<{ value: number }>;
}) {
  const groupRef = useRef<Group | null>(null);
  const pointsMaterialRef = useRef<PointsMaterial | null>(null);
  const nodesMaterialRef = useRef<PointsMaterial | null>(null);
  const lineMaterialRef = useRef<LineBasicMaterial | null>(null);
  const starsMaterialRef = useRef<PointsMaterial | null>(null);

  const {
    particlesGeometry,
    nodesGeometry,
    linesGeometry,
    particlesBase,
    nodesBase,
    starsGeometry,
    starsBase,
  } = useMemo(() => {
    const template = isMobile
      ? MANIFEST_AMBIENT_PRECOMPUTED.mobile
      : MANIFEST_AMBIENT_PRECOMPUTED.desktop;

    // Copiamos los buffers para que las mutaciones de `useFrame` no afecten
    // los valores precomputados (y así el resize móvil/desktop se mantiene estable).
    const particlePositions = template.particlePositions.slice();
    const nodesPositions = template.nodesPositions.slice();
    const linePositions = template.linePositions.slice();
    const starsPositions = template.starsPositions.slice();

    const particlesBase = particlePositions.slice();
    const nodesBase = nodesPositions.slice();
    const starsBase = starsPositions.slice();

    const particlesGeometry = new BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(particlePositions, 3)
    );

    const nodesGeometry = new BufferGeometry();
    nodesGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(nodesPositions, 3)
    );

    const linesGeometry = new BufferGeometry();
    linesGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(linePositions, 3)
    );

    const starsGeometry = new BufferGeometry();
    starsGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(starsPositions, 3)
    );

    return {
      particlesGeometry,
      nodesGeometry,
      linesGeometry,
      particlesBase,
      nodesBase,
      starsGeometry,
      starsBase,
    };
  }, [isMobile]);

  // En Three.js mutamos buffers en cada frame (comportamiento esperado).
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const rig = groupRef.current;
    if (!rig) return;

    if (reducedMotion) {
      rig.rotation.y = 0;
      rig.rotation.x = 0;
      rig.position.y = 0;
      return;
    }

    const t = clock.getElapsedTime();
    const mouse = mouseFieldRef.current;
    const cursorStrength = mouse.strength;
    const scrollStrength = scrollPulseRef.current.value;

    rig.rotation.y = t * 0.035;
    rig.rotation.x = Math.sin(t * 0.22) * 0.04;
    // Pulso sutil cuando la sección entra por scroll.
    rig.position.y =
      Math.sin(t * 0.26) * 0.045 +
      mouse.normY * 0.018 * cursorStrength +
      scrollStrength * 0.07;

    // Breathing muy sutil para que no parezca "estático"
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.opacity =
        0.45 +
        Math.sin(t * 0.4) * 0.035 +
        cursorStrength * 0.12 +
        scrollStrength * 0.08;
    }
    if (nodesMaterialRef.current) {
      nodesMaterialRef.current.opacity =
        0.68 +
        Math.cos(t * 0.32) * 0.04 +
        cursorStrength * 0.08 +
        scrollStrength * 0.07;
    }
    if (starsMaterialRef.current) {
      starsMaterialRef.current.opacity =
        0.2 + cursorStrength * 0.12 + scrollStrength * 0.08;
    }

    // Líneas: base baja por defecto (para no interferir con cards).
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.02 + scrollStrength * 0.05;
    }

    // Campo de influencia del cursor (partículas y líneas cercanas).
    if (!reducedMotion && cursorStrength > 0.001) {
      const particlesPos = particlesGeometry.attributes.position
        .array as Float32Array;
      const nodesPos = nodesGeometry.attributes.position.array as Float32Array;
      const starsPos = starsGeometry.attributes.position.array as Float32Array;

      // Mapeo del cursor a coordenadas locales (plano frente a cámara).
      const px = mouse.normX * 1.9;
      const py = mouse.normY * 1.15;

      const particleRadius = isMobile ? 1.05 : 1.25;
      const particleRadiusSq = particleRadius * particleRadius;
      const particleMaxOffset = (isMobile ? 0.065 : 0.08) * cursorStrength;

      const nodeRadius = isMobile ? 0.92 : 1.02;
      const nodeRadiusSq = nodeRadius * nodeRadius;
      const nodeMaxOffset = (isMobile ? 0.032 : 0.04) * cursorStrength;

      let nearness = 0;

      // Partículas
      for (let i = 0; i < particlesBase.length / 3; i++) {
        const idx = i * 3;
        const bx = particlesBase[idx + 0];
        const by = particlesBase[idx + 1];
        const bz = particlesBase[idx + 2];

        const dx = bx - px;
        const dy = by - py;
        const distSq = dx * dx + dy * dy;

        // Restauramos siempre al estado base; así evitamos "drift".
        let outX = bx;
        let outY = by;
        let outZ = bz;

        if (distSq < particleRadiusSq) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const k = 1 - dist / particleRadius; // 0..1
          const ax = -dx / dist;
          const ay = -dy / dist;
          const amount = particleMaxOffset * k;

          outX = bx + ax * amount;
          outY = by + ay * amount * 0.32;
          outZ = bz + amount * 0.015; // leve empuje de profundidad
          nearness = Math.max(nearness, k);
        }

        particlesPos[idx + 0] = outX;
        particlesPos[idx + 1] = outY;
        particlesPos[idx + 2] = outZ;
      }

      particlesGeometry.attributes.position.needsUpdate = true;

      // Nodos
      for (let i = 0; i < nodesBase.length / 3; i++) {
        const idx = i * 3;
        const bx = nodesBase[idx + 0];
        const by = nodesBase[idx + 1];
        const bz = nodesBase[idx + 2];

        const dx = bx - px;
        const dy = by - py;
        const distSq = dx * dx + dy * dy;

        let outX = bx;
        let outY = by;
        let outZ = bz;

        if (distSq < nodeRadiusSq) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const k = 1 - dist / nodeRadius;
          const ax = -dx / dist;
          const ay = -dy / dist;
          const amount = nodeMaxOffset * k;

          outX = bx + ax * amount;
          outY = by + ay * amount * 0.36;
          outZ = bz + amount * 0.015;
          nearness = Math.max(nearness, k);
        }

        nodesPos[idx + 0] = outX;
        nodesPos[idx + 1] = outY;
        nodesPos[idx + 2] = outZ;
      }

      nodesGeometry.attributes.position.needsUpdate = true;

      // Estrellas: aún más sutil, solo sube un poco cerca del cursor.
      for (let i = 0; i < starsBase.length / 3; i++) {
        const idx = i * 3;
        const bx = starsBase[idx + 0];
        const by = starsBase[idx + 1];
        const bz = starsBase[idx + 2];

        const dx = bx - px;
        const dy = by - py;
        const distSq = dx * dx + dy * dy;

        let outX = bx;
        let outY = by;
        let outZ = bz;

        const starRadius = isMobile ? 0.85 : 1.0;
        const starRadiusSq = starRadius * starRadius;

        if (distSq < starRadiusSq) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const k = 1 - dist / starRadius;
          const amount = (isMobile ? 0.02 : 0.025) * cursorStrength * k;

          const ax = -dx / dist;
          const ay = -dy / dist;
          outX = bx + ax * amount;
          outY = by + ay * amount;
          outZ = bz + amount * 0.3;
          nearness = Math.max(nearness, k);
        }

        starsPos[idx + 0] = outX;
        starsPos[idx + 1] = outY;
        starsPos[idx + 2] = outZ;
      }

      starsGeometry.attributes.position.needsUpdate = true;

      if (lineMaterialRef.current) {
        const near01 = Math.max(0, Math.min(1, nearness));
        lineMaterialRef.current.opacity =
          0.02 + scrollStrength * 0.07 + near01 * 0.16 * cursorStrength;
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={groupRef}>
      <points geometry={particlesGeometry}>
        <pointsMaterial
          ref={pointsMaterialRef}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0.55}
          color="#7aa2ff"
          size={0.035}
          sizeAttenuation
        />
      </points>

      <points geometry={nodesGeometry}>
        <pointsMaterial
          ref={nodesMaterialRef}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0.85}
          color={"#c7f9ff"}
          size={0.095}
          sizeAttenuation
        />
      </points>

      <points geometry={starsGeometry}>
        <pointsMaterial
          ref={starsMaterialRef}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0.25}
          color={"#ffffff"}
          size={0.015}
          sizeAttenuation
        />
      </points>

      {!isMobile ? (
        <lineSegments geometry={linesGeometry}>
          <lineBasicMaterial
            ref={lineMaterialRef}
            transparent
            opacity={0.03}
            color={"#b9a8ff"}
            blending={AdditiveBlending}
          />
        </lineSegments>
      ) : null}
    </group>
  );
}

function ManifestAmbientScene({
  mouseFieldRef,
  scrollPulseRef,
}: {
  mouseFieldRef: MutableRefObject<ManifestMouseFieldValue>;
  scrollPulseRef: MutableRefObject<{ value: number }>;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  return (
    <Canvas
      className="pointer-events-none absolute inset-0"
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reducedMotion ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={0.02} />
      <AmbientRig
        isMobile={isMobile}
        reducedMotion={reducedMotion}
        mouseFieldRef={mouseFieldRef}
        scrollPulseRef={scrollPulseRef}
      />
    </Canvas>
  );
}

export default ManifestAmbientScene;

