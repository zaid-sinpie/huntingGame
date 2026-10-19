import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getTerrainHeight, WORLD_SIZE, WATER_HEIGHT, LAKE_CENTER, LAKE_RADIUS } from '../terrain/terrainHeight';

export const Terrain: React.FC = () => {
  // Generate terrain geometry with vertex colors based on height, slope, and biome
  const { geometry } = useMemo(() => {
    const segments = 120;
    const geom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const posAttr = geom.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    const cWaterMud = new THREE.Color('#3d3224'); // Muddy bank
    const cGrass = new THREE.Color('#385e2c'); // Pine forest grass
    const cMeadow = new THREE.Color('#557a2e'); // Bright meadow grass
    const cRock = new THREE.Color('#5e6360'); // Granite rock
    const cHighSnow = new THREE.Color('#dce6ea'); // Mountain snow

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getTerrainHeight(x, z);
      posAttr.setY(i, y);

      // Color computation based on height, slope, and distance to lake
      const distToLake = Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z);

      let finalColor = cGrass.clone();

      if (y <= WATER_HEIGHT + 0.6 || distToLake < LAKE_RADIUS + 3) {
        // Mud / sand near water
        finalColor.copy(cWaterMud);
      } else if (z < -50 || y > 15) {
        // High mountains
        if (y > 24) {
          finalColor.copy(cHighSnow);
        } else {
          finalColor.copy(cRock);
        }
      } else if (x > 25 && z > 0) {
        // Golden meadow
        finalColor.copy(cMeadow);
      }

      colors[i * 3] = finalColor.r;
      colors[i * 3 + 1] = finalColor.g;
      colors[i * 3 + 2] = finalColor.b;
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    return { geometry: geom };
  }, []);

  return (
    <group>
      {/* 1. Open-World Terrain Surface */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.88}
          metalness={0.05}
          flatShading={false}
        />
      </mesh>

      {/* 2. Mirror Lake Water Surface */}
      <mesh
        position={[LAKE_CENTER.x, WATER_HEIGHT, LAKE_CENTER.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[LAKE_RADIUS + 6, 48]} />
        <meshStandardMaterial
          color="#1e485e"
          roughness={0.08}
          metalness={0.85}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Lake bed depth layer */}
      <mesh
        position={[LAKE_CENTER.x, WATER_HEIGHT - 0.2, LAKE_CENTER.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[LAKE_RADIUS, 32]} />
        <meshStandardMaterial color="#0f2632" roughness={0.9} />
      </mesh>
    </group>
  );
};
