import { Canvas } from "@react-three/fiber";
import OrbitCore from "./OrbitCore";
import OrbitParticles from "./OrbitParticles";
import SceneLights from "./SceneLights";

type OrbitSceneProps = {
  className?: string;
};

function OrbitScene({ className = "h-full w-full" }: OrbitSceneProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 7], fov: 35 }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneLights />
      <OrbitCore />
      <OrbitParticles />
    </Canvas>
  );
}

export default OrbitScene;
