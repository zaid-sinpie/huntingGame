import { getTerrainHeight, isPositionWater, CABIN_POS, TOWER_POS, LAKE_CENTER, LAKE_RADIUS, WORLD_HALF } from './terrainHeight';
import type { WorldObstacle } from '../types';

export interface TreeData {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotation: number;
  radius: number;
  type: 'pine_tall' | 'pine_bushy' | 'birch';
}

export interface RockData {
  x: number;
  z: number;
  y: number;
  scale: [number, number, number];
  rotation: [number, number, number];
  radius: number;
}

export interface GrassCluster {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotation: number;
  type: 'tall_grass' | 'wildflower' | 'fern' | 'reed';
}

// Pseudorandom seeded generator for deterministic wilderness placement
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createSeededRandom(1337);

// Generate deterministic trees, rocks, and structures
export const trees: TreeData[] = [];
export const rocks: RockData[] = [];
export const grassClusters: GrassCluster[] = [];
export const worldObstacles: WorldObstacle[] = [];

// 1. Cabin bounds & Tower obstacles
worldObstacles.push({
  x: CABIN_POS.x,
  z: CABIN_POS.z,
  radius: 6.5,
  height: 6,
  type: 'cabin',
});

worldObstacles.push({
  x: TOWER_POS.x,
  z: TOWER_POS.z,
  radius: 4.5,
  height: 18,
  type: 'tower',
});

// Generate Trees
const TOTAL_TREES = 750;
let attempts = 0;
while (trees.length < TOTAL_TREES && attempts < 4000) {
  attempts++;
  const x = (rng() - 0.5) * (WORLD_HALF * 1.85);
  const z = (rng() - 0.5) * (WORLD_HALF * 1.85);

  // Avoid lake water
  if (isPositionWater(x, z)) continue;
  const distToLake = Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z);
  if (distToLake < LAKE_RADIUS + 4) continue;

  // Avoid cabin clearings
  const distToCabin = Math.hypot(x - CABIN_POS.x, z - CABIN_POS.z);
  if (distToCabin < 14) continue;

  // Avoid tower clearing
  const distToTower = Math.hypot(x - TOWER_POS.x, z - TOWER_POS.z);
  if (distToTower < 9) continue;

  const y = getTerrainHeight(x, z);

  // Mountains have fewer trees, dense forests have many
  if (z < -80 && rng() > 0.35) continue; // High rock peaks have sparse trees
  if (x > 40 && z > 10 && rng() > 0.45) continue; // Golden meadow has open meadows

  const scale = 0.8 + rng() * 0.7;
  const rotation = rng() * Math.PI * 2;
  const radius = 0.55 * scale; // collision radius of the trunk
  const treeType = rng() < 0.65 ? 'pine_tall' : rng() < 0.85 ? 'pine_bushy' : 'birch';

  const tree: TreeData = { x, y, z, scale, rotation, radius, type: treeType };
  trees.push(tree);

  worldObstacles.push({
    x,
    z,
    radius,
    height: 10 * scale,
    type: 'tree',
  });
}

// Generate Large Rocks / Boulders
const TOTAL_ROCKS = 220;
attempts = 0;
while (rocks.length < TOTAL_ROCKS && attempts < 2000) {
  attempts++;
  const x = (rng() - 0.5) * (WORLD_HALF * 1.85);
  const z = (rng() - 0.5) * (WORLD_HALF * 1.85);

  if (isPositionWater(x, z) && rng() > 0.4) continue; // some rocks in shallow water are great
  const distToCabin = Math.hypot(x - CABIN_POS.x, z - CABIN_POS.z);
  if (distToCabin < 12) continue;

  const y = getTerrainHeight(x, z);
  const baseScale = 1.0 + rng() * 2.2;
  const sx = baseScale * (0.8 + rng() * 0.5);
  const sy = baseScale * (0.6 + rng() * 0.8);
  const sz = baseScale * (0.8 + rng() * 0.5);
  const radius = Math.max(sx, sz) * 0.75;

  const rock: RockData = {
    x,
    y: y - 0.2,
    z,
    scale: [sx, sy, sz],
    rotation: [rng() * 0.4, rng() * Math.PI * 2, rng() * 0.4],
    radius,
  };
  rocks.push(rock);

  worldObstacles.push({
    x,
    z,
    radius,
    height: sy,
    type: 'rock',
  });
}

// Generate Grass / Wildflower Clusters (Instanced)
const TOTAL_GRASS = 1200;
attempts = 0;
while (grassClusters.length < TOTAL_GRASS && attempts < 4000) {
  attempts++;
  const x = (rng() - 0.5) * (WORLD_HALF * 1.8);
  const z = (rng() - 0.5) * (WORLD_HALF * 1.8);

  const isWater = isPositionWater(x, z);
  const distToLake = Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z);

  const y = getTerrainHeight(x, z);

  let type: 'tall_grass' | 'wildflower' | 'fern' | 'reed' = 'tall_grass';

  if (distToLake < LAKE_RADIUS + 8 && distToLake > LAKE_RADIUS - 6) {
    type = 'reed'; // Reeds by lake shore
  } else if (x > 30 && z > 0) {
    type = rng() < 0.4 ? 'wildflower' : 'tall_grass';
  } else if (z < -50) {
    if (rng() > 0.4) continue; // sparse grass on rocky mountain
    type = 'tall_grass';
  } else {
    type = rng() < 0.35 ? 'fern' : 'tall_grass';
  }

  grassClusters.push({
    x,
    y: isWater ? 1.5 : y,
    z,
    scale: 0.7 + rng() * 0.6,
    rotation: rng() * Math.PI * 2,
    type,
  });
}

/**
 * Fast spatial obstacle check: returns closest obstacle colliding with circle (px, pz, radius)
 */
export function getCollidingObstacle(
  px: number,
  pz: number,
  playerRadius: number
): { obstacle: WorldObstacle; dist: number; pushX: number; pushZ: number } | null {
  for (let i = 0; i < worldObstacles.length; i++) {
    const obs = worldObstacles[i];
    const dx = px - obs.x;
    const dz = pz - obs.z;
    const minDist = obs.radius + playerRadius;
    const distSq = dx * dx + dz * dz;

    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq) || 0.001;
      const pushDist = minDist - dist;
      return {
        obstacle: obs,
        dist,
        pushX: (dx / dist) * pushDist,
        pushZ: (dz / dist) * pushDist,
      };
    }
  }
  return null;
}
