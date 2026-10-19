import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../state/useGameStore';
import type { AnimalInstance } from '../types';

export const WildlifeRenderer: React.FC = () => {
  const animals = useGameStore((s) => s.animals);
  const playerPos = useGameStore((s) => s.playerPos);
  const setHarvestableAnimal = useGameStore((s) => s.setHarvestableAnimal);

  // Check harvestable distance to player
  useFrame(() => {
    let closestHarvestable: AnimalInstance | null = null;
    let closestDist = 3.5; // Harvest range

    for (let i = 0; i < animals.length; i++) {
      const a = animals[i];
      if (a.state === 'dead') {
        const [ax, , az] = a.position;
        const d = Math.hypot(playerPos[0] - ax, playerPos[2] - az);
        if (d < closestDist) {
          closestDist = d;
          closestHarvestable = a;
        }
      }
    }
    setHarvestableAnimal(closestHarvestable);
  });

  return (
    <group>
      {animals.map((animal) => {
        if (animal.state === 'harvested') return null;
        return <AnimalEntity key={animal.id} animal={animal} />;
      })}
    </group>
  );
};

const AnimalEntity: React.FC<{ animal: AnimalInstance }> = ({ animal }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const legFLRef = useRef<THREE.Mesh>(null);
  const legFRRef = useRef<THREE.Mesh>(null);
  const legBLRef = useRef<THREE.Mesh>(null);
  const legBRRef = useRef<THREE.Mesh>(null);

  const [x, y, z] = animal.position;
  const isDead = animal.state === 'dead';

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isDead) {
      // Lie flat on ground on side
      groupRef.current.position.set(x, y + 0.25, z);
      groupRef.current.rotation.set(0, animal.rotation, Math.PI / 2);
      return;
    }

    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.set(0, animal.rotation, 0);

    // Procedural Leg Swing Animation based on speed
    if (animal.speed > 0.1) {
      const legFreq = animal.speed * 2.2;
      const legAmp = 0.55;
      const swing = Math.sin(t * legFreq) * legAmp;

      if (legFLRef.current) legFLRef.current.rotation.x = swing;
      if (legFRRef.current) legFRRef.current.rotation.x = -swing;
      if (legBLRef.current) legBLRef.current.rotation.x = -swing;
      if (legBRRef.current) legBRRef.current.rotation.x = swing;
    } else {
      if (legFLRef.current) legFLRef.current.rotation.x = 0;
      if (legFRRef.current) legFRRef.current.rotation.x = 0;
      if (legBLRef.current) legBLRef.current.rotation.x = 0;
      if (legBRRef.current) legBRRef.current.rotation.x = 0;
    }

    // Head Posture (Graze vs Alert)
    if (headRef.current) {
      if (animal.state === 'graze') {
        headRef.current.rotation.x = 0.7; // Head down chewing grass
      } else if (animal.state === 'alert') {
        headRef.current.rotation.x = -0.35; // Head raised high, ears perked
      } else {
        headRef.current.rotation.x = 0;
      }
    }
  });

  // Render Species-Specific 3D Geometry
  if (animal.species === 'deer') {
    return (
      <group ref={groupRef} castShadow>
        {/* Torso */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.55, 0.6, 1.4]} />
          <meshStandardMaterial color="#8a532d" roughness={0.7} />
        </mesh>

        {/* White Rump Patch */}
        <mesh position={[0, 0.98, -0.68]}>
          <boxGeometry args={[0.35, 0.35, 0.08]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>

        {/* Neck & Head */}
        <group ref={headRef} position={[0, 1.15, 0.55]}>
          <mesh position={[0, 0.35, 0.2]} rotation={[-0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.22, 0.7, 8]} />
            <meshStandardMaterial color="#8a532d" roughness={0.7} />
          </mesh>
          {/* Head & Muzzle */}
          <mesh position={[0, 0.68, 0.42]} castShadow>
            <boxGeometry args={[0.26, 0.24, 0.42]} />
            <meshStandardMaterial color="#7a4623" roughness={0.65} />
          </mesh>
          {/* Antlers (If Male) */}
          {animal.gender === 'Male' && (
            <group position={[0, 0.88, 0.35]}>
              <mesh position={[-0.24, 0.3, -0.05]} rotation={[0.2, -0.3, -0.4]} castShadow>
                <cylinderGeometry args={[0.02, 0.035, 0.65, 6]} />
                <meshStandardMaterial color="#dcd0b2" roughness={0.6} />
              </mesh>
              <mesh position={[0.24, 0.3, -0.05]} rotation={[0.2, 0.3, 0.4]} castShadow>
                <cylinderGeometry args={[0.02, 0.035, 0.65, 6]} />
                <meshStandardMaterial color="#dcd0b2" roughness={0.6} />
              </mesh>
              {/* Brow Tines */}
              <mesh position={[-0.18, 0.45, 0.08]} rotation={[-0.4, -0.2, -0.2]}>
                <cylinderGeometry args={[0.015, 0.02, 0.25, 6]} />
                <meshStandardMaterial color="#dcd0b2" />
              </mesh>
              <mesh position={[0.18, 0.45, 0.08]} rotation={[-0.4, 0.2, 0.2]}>
                <cylinderGeometry args={[0.015, 0.02, 0.25, 6]} />
                <meshStandardMaterial color="#dcd0b2" />
              </mesh>
            </group>
          )}
        </group>

        {/* 4 Slender Legs */}
        <mesh ref={legFLRef} position={[-0.22, 0.45, 0.45]} castShadow>
          <cylinderGeometry args={[0.065, 0.045, 0.9, 6]} />
          <meshStandardMaterial color="#693b1c" roughness={0.8} />
        </mesh>
        <mesh ref={legFRRef} position={[0.22, 0.45, 0.45]} castShadow>
          <cylinderGeometry args={[0.065, 0.045, 0.9, 6]} />
          <meshStandardMaterial color="#693b1c" roughness={0.8} />
        </mesh>
        <mesh ref={legBLRef} position={[-0.22, 0.45, -0.45]} castShadow>
          <cylinderGeometry args={[0.075, 0.045, 0.9, 6]} />
          <meshStandardMaterial color="#693b1c" roughness={0.8} />
        </mesh>
        <mesh ref={legBRRef} position={[0.22, 0.45, -0.45]} castShadow>
          <cylinderGeometry args={[0.075, 0.045, 0.9, 6]} />
          <meshStandardMaterial color="#693b1c" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (animal.species === 'boar') {
    return (
      <group ref={groupRef} castShadow>
        {/* Stout Muscular Torso */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.65, 0.65, 1.2]} />
          <meshStandardMaterial color="#36322d" roughness={0.85} />
        </mesh>
        {/* Bristly Crest on Back */}
        <mesh position={[0, 1.0, 0.1]}>
          <boxGeometry args={[0.12, 0.15, 0.9]} />
          <meshStandardMaterial color="#1f1d1b" />
        </mesh>
        {/* Head & Snout */}
        <group ref={headRef} position={[0, 0.62, 0.55]}>
          <mesh position={[0, 0, 0.28]} castShadow>
            <coneGeometry args={[0.32, 0.6, 6]} />
            <meshStandardMaterial color="#2b2824" roughness={0.8} />
          </mesh>
          {/* Curved Tusks */}
          <mesh position={[-0.18, -0.06, 0.4]} rotation={[0.4, 0, -0.4]}>
            <cylinderGeometry args={[0.02, 0.03, 0.18, 6]} />
            <meshStandardMaterial color="#f0ede6" />
          </mesh>
          <mesh position={[0.18, -0.06, 0.4]} rotation={[0.4, 0, 0.4]}>
            <cylinderGeometry args={[0.02, 0.03, 0.18, 6]} />
            <meshStandardMaterial color="#f0ede6" />
          </mesh>
        </group>
        {/* Short Heavy Legs */}
        <mesh ref={legFLRef} position={[-0.24, 0.25, 0.38]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.52, 6]} />
          <meshStandardMaterial color="#2b2723" />
        </mesh>
        <mesh ref={legFRRef} position={[0.24, 0.25, 0.38]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.52, 6]} />
          <meshStandardMaterial color="#2b2723" />
        </mesh>
        <mesh ref={legBLRef} position={[-0.24, 0.25, -0.38]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.52, 6]} />
          <meshStandardMaterial color="#2b2723" />
        </mesh>
        <mesh ref={legBRRef} position={[0.24, 0.25, -0.38]} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 0.52, 6]} />
          <meshStandardMaterial color="#2b2723" />
        </mesh>
      </group>
    );
  }

  if (animal.species === 'wolf') {
    return (
      <group ref={groupRef} castShadow>
        {/* Lean Predator Torso */}
        <mesh position={[0, 0.68, 0]} castShadow>
          <boxGeometry args={[0.45, 0.5, 1.1]} />
          <meshStandardMaterial color="#505354" roughness={0.7} />
        </mesh>
        {/* Bushy Tail */}
        <mesh position={[0, 0.72, -0.65]} rotation={[-0.5, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.05, 0.55, 6]} />
          <meshStandardMaterial color="#3e4042" />
        </mesh>
        {/* Head & Muzzle */}
        <group ref={headRef} position={[0, 0.85, 0.45]}>
          <mesh position={[0, 0.12, 0.25]} castShadow>
            <boxGeometry args={[0.26, 0.24, 0.38]} />
            <meshStandardMaterial color="#5a5e61" />
          </mesh>
          {/* Pointed Ears */}
          <mesh position={[-0.11, 0.3, 0.16]}>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color="#36383a" />
          </mesh>
          <mesh position={[0.11, 0.3, 0.16]}>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color="#36383a" />
          </mesh>
        </group>
        {/* Legs */}
        <mesh ref={legFLRef} position={[-0.18, 0.35, 0.38]} castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.7, 6]} />
          <meshStandardMaterial color="#424547" />
        </mesh>
        <mesh ref={legFRRef} position={[0.18, 0.35, 0.38]} castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.7, 6]} />
          <meshStandardMaterial color="#424547" />
        </mesh>
        <mesh ref={legBLRef} position={[-0.18, 0.35, -0.38]} castShadow>
          <cylinderGeometry args={[0.065, 0.045, 0.7, 6]} />
          <meshStandardMaterial color="#424547" />
        </mesh>
        <mesh ref={legBRRef} position={[0.18, 0.35, -0.38]} castShadow>
          <cylinderGeometry args={[0.065, 0.045, 0.7, 6]} />
          <meshStandardMaterial color="#424547" />
        </mesh>
      </group>
    );
  }

  if (animal.species === 'bear') {
    return (
      <group ref={groupRef} castShadow>
        {/* Massive Body & Muscular Shoulder Hump */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.85, 0.9, 1.5]} />
          <meshStandardMaterial color="#3b2615" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.45, 0.3]} castShadow>
          <sphereGeometry args={[0.45, 8, 8]} />
          <meshStandardMaterial color="#342112" roughness={0.8} />
        </mesh>
        {/* Heavy Head */}
        <group ref={headRef} position={[0, 1.15, 0.78]}>
          <mesh position={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.42, 0.38, 0.45]} />
            <meshStandardMaterial color="#2d1c0f" roughness={0.75} />
          </mesh>
          {/* Rounded Ears */}
          <mesh position={[-0.18, 0.22, 0.15]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#2d1c0f" />
          </mesh>
          <mesh position={[0.18, 0.22, 0.15]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial color="#2d1c0f" />
          </mesh>
        </group>
        {/* Heavy Powerful Paws / Legs */}
        <mesh ref={legFLRef} position={[-0.32, 0.5, 0.48]} castShadow>
          <cylinderGeometry args={[0.14, 0.12, 1.0, 8]} />
          <meshStandardMaterial color="#2a1a0e" />
        </mesh>
        <mesh ref={legFRRef} position={[0.32, 0.5, 0.48]} castShadow>
          <cylinderGeometry args={[0.14, 0.12, 1.0, 8]} />
          <meshStandardMaterial color="#2a1a0e" />
        </mesh>
        <mesh ref={legBLRef} position={[-0.32, 0.5, -0.48]} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 1.0, 8]} />
          <meshStandardMaterial color="#2a1a0e" />
        </mesh>
        <mesh ref={legBRRef} position={[0.32, 0.5, -0.48]} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 1.0, 8]} />
          <meshStandardMaterial color="#2a1a0e" />
        </mesh>
      </group>
    );
  }

  // Rabbit
  return (
    <group ref={groupRef} castShadow>
      {/* Small Rounded Body */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.38]} />
        <meshStandardMaterial color="#917c67" roughness={0.7} />
      </mesh>
      {/* Fluffy Tail */}
      <mesh position={[0, 0.25, -0.2]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Head & Long Ears */}
      <group ref={headRef} position={[0, 0.3, 0.15]}>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.15, 0.14, 0.18]} />
          <meshStandardMaterial color="#806b57" />
        </mesh>
        {/* Long Upright Ears */}
        <mesh position={[-0.05, 0.16, -0.02]} rotation={[0.2, 0, -0.15]}>
          <cylinderGeometry args={[0.02, 0.025, 0.24, 6]} />
          <meshStandardMaterial color="#a8927b" />
        </mesh>
        <mesh position={[0.05, 0.16, -0.02]} rotation={[0.2, 0, 0.15]}>
          <cylinderGeometry args={[0.02, 0.025, 0.24, 6]} />
          <meshStandardMaterial color="#a8927b" />
        </mesh>
      </group>
      {/* Fast Paws */}
      <mesh ref={legFLRef} position={[-0.09, 0.08, 0.1]}>
        <cylinderGeometry args={[0.03, 0.025, 0.16, 6]} />
        <meshStandardMaterial color="#735f4c" />
      </mesh>
      <mesh ref={legFRRef} position={[0.09, 0.08, 0.1]}>
        <cylinderGeometry args={[0.03, 0.025, 0.16, 6]} />
        <meshStandardMaterial color="#735f4c" />
      </mesh>
      <mesh ref={legBLRef} position={[-0.09, 0.1, -0.1]}>
        <cylinderGeometry args={[0.04, 0.025, 0.2, 6]} />
        <meshStandardMaterial color="#735f4c" />
      </mesh>
      <mesh ref={legBRRef} position={[0.09, 0.1, -0.1]}>
        <cylinderGeometry args={[0.04, 0.025, 0.2, 6]} />
        <meshStandardMaterial color="#735f4c" />
      </mesh>
    </group>
  );
};
