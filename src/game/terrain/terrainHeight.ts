import { createNoise2D } from 'simplex-noise';
import type { BiomeType } from '../types';

// Deterministic 2D noise generator for consistent world generation
const noise2D = createNoise2D(() => 0.42857142857142855);
const detailNoise2D = createNoise2D(() => 0.8571428571428571);

export const WORLD_SIZE = 400;
export const WORLD_HALF = WORLD_SIZE / 2; // -200 to +200

export const LAKE_CENTER = { x: 30, z: -20 };
export const LAKE_RADIUS = 42;
export const WATER_HEIGHT = 1.6;

export const CABIN_POS = { x: -35, z: 65 };
export const TOWER_POS = { x: -75, z: 95 };

/**
 * Returns exact terrain height Y at any (x, z) coordinates.
 * Used identically by rendering, player physics, Rapier colliders, animal AI, and tracking.
 */
export function getTerrainHeight(x: number, z: number): number {
  // Clamping to world bounds
  const clampedX = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, x));
  const clampedZ = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, z));

  // Base rolling hills
  const scale1 = 0.007;
  const h1 = noise2D(clampedX * scale1, clampedZ * scale1) * 8;

  // Medium terrain variation
  const scale2 = 0.02;
  const h2 = noise2D(clampedX * scale2 + 100, clampedZ * scale2 + 100) * 4;

  // Fine terrain bumps (rocks, small mounds)
  const scale3 = 0.06;
  const h3 = detailNoise2D(clampedX * scale3, clampedZ * scale3) * 0.8;

  let baseHeight = 5 + h1 + h2 + h3;

  // 1. Whispering Ridge / Mountain Range in the North / North-East (Z < -40)
  if (clampedZ < -20) {
    const northFactor = Math.min(1, Math.max(0, (-clampedZ - 20) / 120));
    const mountainNoise = Math.abs(noise2D(clampedX * 0.015, clampedZ * 0.015)) * 25;
    const peakDetail = noise2D(clampedX * 0.04, clampedZ * 0.04) * 4;
    baseHeight += (mountainNoise + peakDetail + 6) * (northFactor * northFactor);
  }

  // 2. Lookout Ridge near Tower
  const distToTower = Math.hypot(clampedX - TOWER_POS.x, clampedZ - TOWER_POS.z);
  if (distToTower < 35) {
    const towerHump = (1 - distToTower / 35) * 7;
    baseHeight += towerHump;
  }

  // 3. Mirror Lake Basin Depression (Center / South-East)
  const distToLake = Math.hypot(clampedX - LAKE_CENTER.x, clampedZ - LAKE_CENTER.z);
  if (distToLake < LAKE_RADIUS + 25) {
    const lakeT = Math.min(1, Math.max(0, (distToLake - 10) / (LAKE_RADIUS + 15)));
    // Carve down below WATER_HEIGHT near center
    const lakeDepth = 0.4; // bottom of lake
    baseHeight = lakeDepth + (baseHeight - lakeDepth) * (lakeT * lakeT);
  }

  // 4. Hunting Camp / Cabin Plateau Flattening
  const distToCabin = Math.hypot(clampedX - CABIN_POS.x, clampedZ - CABIN_POS.z);
  if (distToCabin < 22) {
    const cabinT = Math.min(1, distToCabin / 22);
    const flatH = 6.2;
    baseHeight = flatH * (1 - cabinT) + baseHeight * cabinT;
  }

  return Math.max(0.2, baseHeight);
}

/**
 * Returns normal vector [nx, ny, nz] at (x, z)
 */
export function getTerrainNormal(x: number, z: number): [number, number, number] {
  const eps = 0.5;
  const hl = getTerrainHeight(x - eps, z);
  const hr = getTerrainHeight(x + eps, z);
  const hd = getTerrainHeight(x, z - eps);
  const hu = getTerrainHeight(x, z + eps);

  const dx = hr - hl;
  const dz = hu - hd;
  const dy = 2 * eps;

  const len = Math.hypot(dx, dy, dz);
  return [-dx / len, dy / len, -dz / len];
}

/**
 * Determines biome at (x, z)
 */
export function getBiomeAt(x: number, z: number): BiomeType {
  const distToCabin = Math.hypot(x - CABIN_POS.x, z - CABIN_POS.z);
  if (distToCabin < 30) return 'hunting_camp';

  const distToLake = Math.hypot(x - LAKE_CENTER.x, z - LAKE_CENTER.z);
  if (distToLake < LAKE_RADIUS + 10) return 'mirror_lake';

  if (z < -45 || (x > 60 && z < 0)) return 'rocky_mountains';
  if (x > 20 && z > 0) return 'golden_meadow';

  return 'pine_forest';
}

/**
 * Checks if a location is underwater
 */
export function isPositionWater(x: number, z: number): boolean {
  const h = getTerrainHeight(x, z);
  return h <= WATER_HEIGHT;
}
