function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.34} />
      <hemisphereLight intensity={0.3} groundColor="#050816" color="#dbe6ff" />
      <directionalLight
        position={[3.5, 4.5, 6]}
        intensity={0.8}
        color="#ffffff"
      />
      <pointLight position={[-3, 1.6, 3.8]} intensity={4.5} color="#7c5cff" />
      <pointLight position={[2.4, -1.4, 3.2]} intensity={3.5} color="#4da6ff" />
    </>
  );
}

export default SceneLights;
