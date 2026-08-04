"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#c8f94e";

/**
 * Malla en wireframe que rota lentamente. Deliberadamente barata: una sola
 * geometría, material básico, sin luces ni post-procesado.
 */
function Lattice() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // La geometría se crea una vez y se comparte entre malla y puntos.
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.6, 3), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x += delta * 0.03;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x -= delta * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          color={ACCENT}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
      <points ref={pointsRef} geometry={geometry} scale={1.25}>
        <pointsMaterial color={ACCENT} size={0.015} transparent opacity={0.5} />
      </points>
    </group>
  );
}

/**
 * Capa decorativa del hero. Se carga solo desde `HeroCanvas`, que la importa de
 * forma dinámica para que three.js quede fuera del bundle inicial.
 */
export default function HeroScene() {
  return (
    <Canvas
      // Techo de resolución: en pantallas retina el coste se dispararía sin esto.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      // La escena es estática salvo la rotación; no necesita más precisión.
      frameloop="always"
    >
      <Lattice />
    </Canvas>
  );
}
