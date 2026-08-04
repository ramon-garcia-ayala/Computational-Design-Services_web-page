"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#c8f94e";

/**
 * Slowly rotating wireframe mesh. Deliberately cheap: a single geometry, a
 * basic material, no lights and no post-processing.
 */
function Lattice() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // The geometry is created once and shared between the mesh and the points.
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
 * The hero's decorative layer. Loaded only from `HeroCanvas`, which imports it
 * dynamically so that three.js stays out of the initial bundle.
 */
export default function HeroScene() {
  return (
    <Canvas
      // Resolution ceiling: on retina screens the cost would blow up without it.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      // The scene is static apart from the rotation; no more precision needed.
      frameloop="always"
    >
      <Lattice />
    </Canvas>
  );
}
