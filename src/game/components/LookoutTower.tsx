import React from 'react';
import { TOWER_POS, getTerrainHeight } from '../terrain/terrainHeight';

export const LookoutTower: React.FC = () => {
  const [tx, tz] = [TOWER_POS.x, TOWER_POS.z];
  const ty = getTerrainHeight(tx, tz);
  const towerHeight = 15;

  return (
    <group position={[tx, ty, tz]}>
      {/* 4 Heavy Timber Legs */}
      <mesh position={[-2.2, towerHeight / 2, -2.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, towerHeight, 8]} />
        <meshStandardMaterial color="#3b2514" roughness={0.9} />
      </mesh>
      <mesh position={[2.2, towerHeight / 2, -2.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, towerHeight, 8]} />
        <meshStandardMaterial color="#3b2514" roughness={0.9} />
      </mesh>
      <mesh position={[-2.2, towerHeight / 2, 2.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, towerHeight, 8]} />
        <meshStandardMaterial color="#3b2514" roughness={0.9} />
      </mesh>
      <mesh position={[2.2, towerHeight / 2, 2.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, towerHeight, 8]} />
        <meshStandardMaterial color="#3b2514" roughness={0.9} />
      </mesh>

      {/* Horizontal & Diagonal Bracing Beams */}
      {[4, 8, 12].map((lvl) => (
        <group key={lvl} position={[0, lvl, 0]}>
          <mesh position={[0, 0, -2.2]}>
            <boxGeometry args={[4.4, 0.15, 0.15]} />
            <meshStandardMaterial color="#301d0f" />
          </mesh>
          <mesh position={[0, 0, 2.2]}>
            <boxGeometry args={[4.4, 0.15, 0.15]} />
            <meshStandardMaterial color="#301d0f" />
          </mesh>
          <mesh position={[-2.2, 0, 0]}>
            <boxGeometry args={[0.15, 0.15, 4.4]} />
            <meshStandardMaterial color="#301d0f" />
          </mesh>
          <mesh position={[2.2, 0, 0]}>
            <boxGeometry args={[0.15, 0.15, 4.4]} />
            <meshStandardMaterial color="#301d0f" />
          </mesh>
        </group>
      ))}

      {/* Observation Platform at Top */}
      <group position={[0, towerHeight, 0]}>
        {/* Catwalk Deck */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[6.4, 0.25, 6.4]} />
          <meshStandardMaterial color="#422916" roughness={0.8} />
        </mesh>

        {/* Observation Room Cabin */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[4.2, 2.6, 4.2]} />
          <meshStandardMaterial color="#2c1a0e" roughness={0.8} />
        </mesh>

        {/* Observation Cabin Glass Windows (Panoramic View) */}
        <mesh position={[0, 1.6, 2.12]}>
          <boxGeometry args={[3.8, 1.1, 0.05]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.6, -2.12]}>
          <boxGeometry args={[3.8, 1.1, 0.05]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[2.12, 1.6, 0]}>
          <boxGeometry args={[0.05, 1.1, 3.8]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[-2.12, 1.6, 0]}>
          <boxGeometry args={[0.05, 1.1, 3.8]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
        </mesh>

        {/* Catwalk Guardrails */}
        <mesh position={[0, 0.6, 3.1]}>
          <boxGeometry args={[6.2, 0.9, 0.08]} />
          <meshStandardMaterial color="#241409" />
        </mesh>
        <mesh position={[0, 0.6, -3.1]}>
          <boxGeometry args={[6.2, 0.9, 0.08]} />
          <meshStandardMaterial color="#241409" />
        </mesh>
        <mesh position={[3.1, 0.6, 0]}>
          <boxGeometry args={[0.08, 0.9, 6.2]} />
          <meshStandardMaterial color="#241409" />
        </mesh>
        <mesh position={[-3.1, 0.6, 0]}>
          <boxGeometry args={[0.08, 0.9, 6.2]} />
          <meshStandardMaterial color="#241409" />
        </mesh>

        {/* Overhanging Pyramid Roof */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <coneGeometry args={[4.2, 1.4, 4]} />
          <meshStandardMaterial color="#1b2e21" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
