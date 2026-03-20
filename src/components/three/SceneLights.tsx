function SceneLights() {
  return (
    <>
      {/* Luz base uniforme para evitar contraste fuerte arriba/abajo */}
      <ambientLight intensity={0.18} color="#dbe7ff" />
      <hemisphereLight intensity={0.22} color="#7dd3fc" groundColor="#4da6ff" />

      <directionalLight
        position={[5, 6, 4]}
        intensity={0.9}
        color="#ffffff"
      />

      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.3}
        color="#7aa2ff"
      />

      <pointLight
        position={[0, -3, 3]}
        intensity={0.24}
        color="#5d74ff"
        distance={12}
      />
    </>
  );
}

export default SceneLights;