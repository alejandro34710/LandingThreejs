import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Sparkles } from "@react-three/drei";
import {
  CanvasTexture,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NormalBlending,
  RepeatWrapping,
} from "three";
import type { OrbitVariant } from "./orbitVariants";
import type { MutableRefObject } from "react";
import type { OrbitStoryValues } from "../../hooks/useHeroScrollTimeline";

type OrbitCoreProps = {
  preset: OrbitVariant;
  mixRef: MutableRefObject<{ value: number }>;
  weightMode: "from" | "to";
  orbitStoryRef: MutableRefObject<OrbitStoryValues>;
};

function OrbitCore({ preset, mixRef, weightMode, orbitStoryRef }: OrbitCoreProps) {
  const AURA_SCALE = 2.08;
  const OUTER_SCALE = 1.08;
  const WIRE_SCALE = 0.54;
  const INNER_SCALE = 0.51;

  const sparkleOpacity = useMemo(() => {
    if (preset.visualPreset === "clean") return 0.34;
    if (preset.visualPreset === "energetic") return 0.46;
    return 0.58;
  }, [preset.visualPreset]);

  const auraMatRef = useRef<MeshBasicMaterial | null>(null);
  const outerMatRef = useRef<MeshPhysicalMaterial | null>(null);
  const mainMatRef = useRef<MeshPhysicalMaterial | null>(null);
  const innerMatRef = useRef<MeshPhysicalMaterial | null>(null);
  const rimMatRef = useRef<MeshBasicMaterial | null>(null);
  const haloMeshRefs = useRef<Array<import("three").Mesh | null>>([]);
  const haloMatRefs = useRef<Array<MeshStandardMaterial | null>>([]);
  const accentMatRefs = useRef<Array<MeshBasicMaterial | null>>([]);

  const presetRef = useRef(preset);
  const weightModeRef = useRef(weightMode);

  const detailEmissiveMap = useMemo(() => {
    // Textura procedural con estructura (ruido suave + “rings/veins”) para
    // que el core no se vea plano, pero sin dependencia del ángulo de cámara
    // como pasaba con normalMap/transmission.
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new CanvasTexture(canvas);

    const img = ctx.createImageData(size, size);

    // Hash determinista para value-noise 2D.
    const seed = 13371337;
    const hash2 = (x: number, y: number) => {
      let h = x * 374761393 + y * 668265263; // primos grandes
      h = (h ^ (h >>> 13)) * 1274126177;
      h = h ^ (h >>> 16);
      h ^= seed;
      return ((h >>> 0) % 100000) / 100000; // [0..1)
    };

    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const valueNoise2D = (x: number, y: number) => {
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const x1 = x0 + 1;
      const y1 = y0 + 1;

      const sx = smoothstep(x - x0);
      const sy = smoothstep(y - y0);

      const n00 = hash2(x0, y0);
      const n10 = hash2(x1, y0);
      const n01 = hash2(x0, y1);
      const n11 = hash2(x1, y1);

      const ix0 = lerp(n00, n10, sx);
      const ix1 = lerp(n01, n11, sx);
      return lerp(ix0, ix1, sy);
    };

    const fbm = (x: number, y: number) => {
      // 3 octavas: suficiente para “detalle” sin sobrecargar.
      let sum = 0;
      let amp = 0.55;
      let freq = 1;
      for (let i = 0; i < 3; i++) {
        sum += amp * valueNoise2D(x * freq, y * freq);
        freq *= 2.0;
        amp *= 0.55;
      }
      return sum; // ~[0..1]
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;

        // Aproximación de coordenadas esféricas en el mapa UV:
        // u -> longitude, v -> latitude (equirectangular).
        const lon = (u - 0.5) * Math.PI * 2;
        const lat = (v - 0.5) * Math.PI;

        // Estructura “tipo capas/veins”
        const rings = 0.5 + 0.5 * Math.sin(lat * 4.3 + Math.cos(lon * 1.5) * 2.2);

        // Ruido suave en espacio UV para granularidad consistente.
        const n = fbm(u * 5.0, v * 5.0);

        // Speckles: pequeñas chispas para que se sienta “energético”.
        const speckles = Math.pow(Math.max(0, n - 0.68) / (1 - 0.68), 2.2);

        // Mantener un mínimo alto para evitar zonas apagadas arriba/abajo.
        const structured = 0.55 * rings + 0.35 * n + 0.30 * speckles;
        const v01 = Math.min(1, Math.max(0, 0.58 + structured * 0.42));

        const vv = Math.floor(v01 * 255);
        const j = (y * size + x) * 4;
        img.data[j] = vv;
        img.data[j + 1] = vv;
        img.data[j + 2] = vv;
        img.data[j + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    const tex = new CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const initialWW = weightMode === "from" ? 0 : 1;
  const initialCoreFadeLift = 0.4 + 0.6 * initialWW;
  const initialGlowLift = 0.45 + 0.55 * initialWW;

  useEffect(() => {
    presetRef.current = preset;
    weightModeRef.current = weightMode;
    haloMatRefs.current.length = preset.visuals.halos.length;
    accentMatRefs.current.length = preset.visuals.accents.length;
  }, [preset, weightMode]);

  useFrame(({ clock }) => {
    const currentPreset = presetRef.current;
    const currentWeightMode = weightModeRef.current;

    const m = mixRef.current.value;
    const w = currentWeightMode === "from" ? 1 - m : m;
    const ww = Math.max(0, Math.min(1, w));

    const energy = orbitStoryRef.current.energy;
    const energyStrength = 0.78 + Math.max(0, Math.min(1.2, energy)) * 0.55;

    const coreFadeLift = 0.4 + 0.6 * ww;
    const glowLift = 0.45 + 0.55 * ww;
    const pulse = 0.98 + Math.sin(clock.getElapsedTime() * 1.2) * 0.015;
    const haloSpin =
      (0.0008 + 0.0014 * energyStrength) * (currentPreset.visuals.orbitSpeedMultiplier ?? 1);

    if (auraMatRef.current) {
      auraMatRef.current.opacity =
        currentPreset.visuals.auraOpacity * 0.07 * glowLift * energyStrength * 2.0;
    }

    if (outerMatRef.current) {
      // Hacer que el shell se sienta como “transmission glass” (no tan apagado).
      outerMatRef.current.opacity =
        currentPreset.visuals.outerOpacity * 1.32 * ww * energyStrength;
      outerMatRef.current.emissiveIntensity =
        currentPreset.visuals.emissiveMain * glowLift * (0.8 + energy * 0.25) * 1.25 * 16;
    }

    if (mainMatRef.current) {
      mainMatRef.current.opacity = currentPreset.visuals.mainOpacity * 0.95 * coreFadeLift;
      mainMatRef.current.emissiveIntensity =
        currentPreset.visuals.emissiveMain * glowLift * (1.35 + energy * 0.9) * 2.7 * 12;
    }

    if (innerMatRef.current) {
      // Menos “pasta luminosa”: controlar opacidad por preset y suavizar el glow.
      innerMatRef.current.opacity =
        currentPreset.visuals.innerOpacity * (1.05 + 0.45 * coreFadeLift);
      innerMatRef.current.emissiveIntensity =
        currentPreset.visuals.emissiveInner * glowLift * pulse * 1.15 * energyStrength * 2.4 * 14;
    }

    if (rimMatRef.current) {
      rimMatRef.current.color.set(currentPreset.theme.haloColorSecondary);
      rimMatRef.current.opacity =
        (0.012 + 0.03 * ww) * glowLift * (0.95 + energy * 0.55);
    }

    haloMatRefs.current.forEach((mat, idx) => {
      const halo = currentPreset.visuals.halos[idx];
      if (!mat || !halo) return;
      mat.opacity = halo.opacity * 1.35 * ww * energyStrength;
    });

    accentMatRefs.current.forEach((mat, idx) => {
      const accent = currentPreset.visuals.accents[idx];
      if (!mat || !accent) return;
      mat.opacity = accent.opacity * 0.28 * ww * energyStrength;
    });

    // Micro animación de los anillos (para acercarnos al “feel” de FeatureNetworkSphere).
    haloMeshRefs.current.forEach((haloMesh, idx) => {
      if (!haloMesh) return;
      const dir = idx % 2 === 0 ? 1 : -1;
      haloMesh.rotation.x += haloSpin * (0.45 + idx * 0.04);
      haloMesh.rotation.y += haloSpin * 0.9 * dir;
      haloMesh.rotation.z += haloSpin * 0.18 * dir;
    });
  });

  return (
    <group scale={preset.visuals.coreScale}>
      {/* AURA MUY SUAVE */}
      <mesh scale={AURA_SCALE}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          ref={auraMatRef}
          color={preset.theme.auraColor}
          transparent
          opacity={preset.visuals.auraOpacity * 0.07 * initialGlowLift}
          blending={NormalBlending}
          depthWrite={false}
          depthTest={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* SHELL EXTERNO (glass/transmission) */}
      <mesh scale={OUTER_SCALE}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshPhysicalMaterial
          ref={outerMatRef}
          color={preset.theme.coreOuterColor}
          emissive={preset.theme.auraColor}
          emissiveMap={detailEmissiveMap}
          transparent
          opacity={preset.visuals.outerOpacity * 0.65 * initialWW}
          metalness={0.05}
          roughness={0.55}
          transmission={0}
          ior={1.22}
          thickness={0.62}
          clearcoat={1}
          clearcoatRoughness={0.35}
          iridescence={0}
          depthWrite={false}
          depthTest={false}
          side={DoubleSide}
          toneMapped={false}
          envMapIntensity={0.15}
        />
      </mesh>

      {/* CORE WIRE (detalle/luminosidad) */}
      <mesh scale={WIRE_SCALE}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshPhysicalMaterial
          ref={mainMatRef}
          color={preset.theme.haloColorSecondary}
          transparent
          opacity={preset.visuals.mainOpacity * 0.78 * initialCoreFadeLift}
          metalness={0.15}
          roughness={0.85}
          transmission={0}
          ior={1.28}
          thickness={0.55}
          clearcoat={0.25}
          clearcoatRoughness={0.6}
          emissive={preset.theme.haloColorPrimary}
          emissiveIntensity={preset.visuals.emissiveMain * initialGlowLift * 2.4}
          emissiveMap={detailEmissiveMap}
          depthWrite={false}
          depthTest={false}
          side={DoubleSide}
          toneMapped={false}
          envMapIntensity={0.12}
          wireframe
        />
      </mesh>

      {/* RIM MUY DISCRETO */}
      <mesh scale={1.018}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshBasicMaterial
          ref={rimMatRef}
          color={preset.theme.haloColorSecondary}
          transparent
          opacity={(0.006 + 0.015 * initialWW) * initialGlowLift}
          blending={NormalBlending}
          depthWrite={false}
          depthTest={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* NÚCLEO INTERIOR DENSO */}
      <mesh scale={INNER_SCALE}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshPhysicalMaterial
          ref={innerMatRef}
          color={preset.theme.coreInnerColor}
          transparent
          opacity={preset.visuals.innerOpacity * (0.8 + 0.25 * initialCoreFadeLift)}
          metalness={0.25}
          roughness={0.95}
          clearcoat={0.2}
          clearcoatRoughness={0.75}
          emissive={preset.theme.haloColorPrimary}
          emissiveMap={detailEmissiveMap}
          emissiveIntensity={preset.visuals.emissiveInner * initialGlowLift * 1.1}
          side={DoubleSide}
          toneMapped={false}
          envMapIntensity={0.08}
          depthTest={false}
        />
      </mesh>

      {/* Sparkles (similar al showcase inferior) */}
      <Sparkles
        count={48}
        scale={2.45}
        size={1.4}
        speed={0.44}
        color={preset.theme.glowColor}
        opacity={sparkleOpacity}
        noise={0.55}
      />

      {preset.visuals.halos.map((halo, haloIndex) => (
        <mesh
          key={`${preset.id}-${halo.radius}-${halo.tube}`}
          ref={(node) => {
            haloMeshRefs.current[haloIndex] = node;
          }}
          rotation={halo.rotation}
        >
          <torusGeometry
            args={[halo.radius, halo.tube, halo.radialSegments ?? 16, halo.tubularSegments ?? 160]}
          />
          <meshStandardMaterial
            ref={(node) => {
              haloMatRefs.current[haloIndex] = node;
            }}
            color={halo.color}
            emissive={halo.color}
            transparent
            opacity={halo.opacity * 1.05 * initialWW}
            emissiveIntensity={1.25 * initialGlowLift}
            metalness={0.12}
            roughness={0.25}
            depthWrite={false}
            depthTest
          />
        </mesh>
      ))}

      {preset.visuals.accents.map((accent, idx) => (
        <mesh key={`${preset.id}-accent-${idx}`} position={accent.position}>
          <sphereGeometry args={[accent.size, 18, 18]} />
          <meshBasicMaterial
            ref={(node) => {
              accentMatRefs.current[idx] = node;
            }}
            color={accent.color}
            transparent
            opacity={accent.opacity * 0.28 * initialWW}
            blending={NormalBlending}
            depthWrite={false}
            depthTest
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default OrbitCore;