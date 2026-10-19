import React from 'react';
import { CABIN_POS } from '../terrain/terrainHeight';

export const HuntingCabin: React.FC = () => {
  const [cx, cz] = [CABIN_POS.x, CABIN_POS.z];
  const cy = 6.2; // Cabin floor height

  return (
    <group position={[cx, cy, cz]}>
      {/* 1. Wood Foundation & Deck */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[9.5, 0.4, 8.5]} />
        <meshStandardMaterial color="#3b2614" roughness={0.85} />
      </mesh>

      {/* 2. Cabin Main Log Walls */}
      <mesh position={[0, 1.6, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 3.2, 5.2]} />
        <meshStandardMaterial color="#53371f" roughness={0.8} />
      </mesh>

      {/* 3. Pitched Wooden Roof */}
      <mesh position={[0, 3.7, -1.0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[5.2, 1.8, 4]} />
        <meshStandardMaterial color="#2d1c10" roughness={0.7} />
      </mesh>

      {/* 4. Covered Front Porch Roof */}
      <mesh position={[0, 2.7, 2.3]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[8.0, 0.15, 2.6]} />
        <meshStandardMaterial color="#362214" roughness={0.75} />
      </mesh>

      {/* Porch Timber Posts */}
      <mesh position={[-3.6, 1.3, 3.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 8]} />
        <meshStandardMaterial color="#3a2414" roughness={0.8} />
      </mesh>
      <mesh position={[3.6, 1.3, 3.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 8]} />
        <meshStandardMaterial color="#3a2414" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.3, 3.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 8]} />
        <meshStandardMaterial color="#3a2414" roughness={0.8} />
      </mesh>

      {/* Porch Railing */}
      <mesh position={[-2.0, 0.6, 3.2]}>
        <boxGeometry args={[3.0, 0.08, 0.06]} />
        <meshStandardMaterial color="#3a2414" />
      </mesh>
      <mesh position={[2.0, 0.6, 3.2]}>
        <boxGeometry args={[3.0, 0.08, 0.06]} />
        <meshStandardMaterial color="#3a2414" />
      </mesh>

      {/* Wooden Steps to Porch */}
      <mesh position={[0, -0.15, 4.4]} receiveShadow>
        <boxGeometry args={[2.2, 0.18, 0.9]} />
        <meshStandardMaterial color="#422916" />
      </mesh>
      <mesh position={[0, -0.32, 5.0]} receiveShadow>
        <boxGeometry args={[2.5, 0.18, 0.9]} />
        <meshStandardMaterial color="#422916" />
      </mesh>

      {/* 5. Rustic Stone Chimney */}
      <mesh position={[3.7, 2.5, -1.5]} castShadow>
        <boxGeometry args={[1.0, 5.4, 1.2]} />
        <meshStandardMaterial color="#4a4d4e" roughness={0.9} />
      </mesh>

      {/* 6. Front Cabin Door & Windows */}
      <mesh position={[0, 1.2, 1.62]}>
        <boxGeometry args={[1.2, 2.2, 0.08]} />
        <meshStandardMaterial color="#2b1a0d" roughness={0.6} />
      </mesh>
      {/* Brass Door Handle */}
      <mesh position={[0.42, 1.2, 1.68]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#c59b27" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Windows with warm cabin glow */}
      <mesh position={[-2.2, 1.6, 1.62]}>
        <boxGeometry args={[1.2, 1.0, 0.06]} />
        <meshStandardMaterial color="#ffc107" emissive="#ffaa00" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[2.2, 1.6, 1.62]}>
        <boxGeometry args={[1.2, 1.0, 0.06]} />
        <meshStandardMaterial color="#ffc107" emissive="#ffaa00" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>

      {/* 7. Porch Lantern (Warm Amber Glow) */}
      <group position={[0.9, 2.0, 1.7]}>
        <mesh>
          <boxGeometry args={[0.15, 0.25, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </mesh>
        <pointLight color="#ff9933" intensity={2.0} distance={10} decay={2} castShadow />
      </group>

      {/* 8. Antler Mount Above Cabin Door */}
      <mesh position={[0, 2.55, 1.65]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#d4cebe" roughness={0.6} />
      </mesh>

      {/* 9. Sign: "PINE VALLEY LODGE" */}
      <mesh position={[0, 2.9, 1.66]}>
        <boxGeometry args={[2.0, 0.35, 0.04]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.8} />
      </mesh>

      {/* 10. Firewood Stack Beside Porch */}
      <group position={[-4.2, 0.3, 1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.12, 1.8, 8]} />
          <meshStandardMaterial color="#4d301b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 1.8, 8]} />
          <meshStandardMaterial color="#55351e" roughness={0.9} />
        </mesh>
      </group>

      {/* Picnic Table in yard */}
      <group position={[4.5, 0.4, 4.0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[2.2, 0.08, 1.0]} />
          <meshStandardMaterial color="#422a17" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, -0.65]} castShadow>
          <boxGeometry args={[2.2, 0.06, 0.35]} />
          <meshStandardMaterial color="#422a17" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.65]} castShadow>
          <boxGeometry args={[2.2, 0.06, 0.35]} />
          <meshStandardMaterial color="#422a17" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
