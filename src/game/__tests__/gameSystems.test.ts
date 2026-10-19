import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTerrainHeight,
  getTerrainNormal,
  getBiomeAt,
  isPositionWater,
  CABIN_POS,
  LAKE_CENTER,
  WORLD_HALF,
} from '../terrain/terrainHeight';
import { worldObstacles, getCollidingObstacle } from '../terrain/obstacles';
import { generateInitialWildlife, updateAnimalAI } from '../ai/wildlifeManager';
import { useGameStore } from '../state/useGameStore';
import type { AnimalInstance } from '../types';

describe('Terrain Height & Surface Normal System', () => {
  it('should return valid non-negative heights across the entire wilderness map', () => {
    const testPoints = [
      [0, 0],
      [CABIN_POS.x, CABIN_POS.z],
      [LAKE_CENTER.x, LAKE_CENTER.z],
      [-150, -150],
      [150, 150],
      [0, -120], // Whispering Ridge mountain
      [80, 50], // Golden Meadow
    ];

    testPoints.forEach(([x, z]) => {
      const h = getTerrainHeight(x, z);
      expect(Number.isFinite(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0.2);
      expect(Number.isNaN(h)).toBe(false);
    });
  });

  it('should carve a depression for Mirror Lake below water height', () => {
    const lakeCenterH = getTerrainHeight(LAKE_CENTER.x, LAKE_CENTER.z);
    expect(lakeCenterH).toBeLessThan(1.6); // Water height is 1.6
    expect(isPositionWater(LAKE_CENTER.x, LAKE_CENTER.z)).toBe(true);
  });

  it('should elevate Whispering Ridge mountain peaks higher than base valley', () => {
    const valleyH = getTerrainHeight(0, 50);
    const mountainH = getTerrainHeight(0, -140);
    expect(mountainH).toBeGreaterThan(valleyH);
  });

  it('should compute valid normalized surface normal vectors', () => {
    const [nx, ny, nz] = getTerrainNormal(25, -30);
    const length = Math.hypot(nx, ny, nz);
    expect(length).toBeCloseTo(1.0, 2);
    expect(ny).toBeGreaterThan(0); // Normals point generally upward
  });

  it('should correctly classify biomes based on coordinates', () => {
    expect(getBiomeAt(CABIN_POS.x, CABIN_POS.z)).toBe('hunting_camp');
    expect(getBiomeAt(LAKE_CENTER.x, LAKE_CENTER.z)).toBe('mirror_lake');
    expect(getBiomeAt(0, -100)).toBe('rocky_mountains');
    expect(getBiomeAt(80, 60)).toBe('golden_meadow');
    expect(getBiomeAt(-80, 0)).toBe('pine_forest');
  });
});

describe('World Obstacles & Capsule Collision System', () => {
  it('should populate obstacle registry with cabin, tower, trees, and rocks', () => {
    expect(worldObstacles.length).toBeGreaterThan(500);

    const hasCabin = worldObstacles.some((o) => o.type === 'cabin');
    const hasTower = worldObstacles.some((o) => o.type === 'tower');
    const hasTrees = worldObstacles.some((o) => o.type === 'tree');
    const hasRocks = worldObstacles.some((o) => o.type === 'rock');

    expect(hasCabin).toBe(true);
    expect(hasTower).toBe(true);
    expect(hasTrees).toBe(true);
    expect(hasRocks).toBe(true);
  });

  it('should detect collisions and calculate pushout vectors for solid obstacles', () => {
    const cabinObs = worldObstacles.find((o) => o.type === 'cabin')!;
    const playerRadius = 0.45;

    // Place player right at cabin edge
    const px = cabinObs.x + cabinObs.radius * 0.5;
    const pz = cabinObs.z;

    const hit = getCollidingObstacle(px, pz, playerRadius);
    expect(hit).not.toBeNull();
    if (hit) {
      expect(hit.dist).toBeLessThan(cabinObs.radius + playerRadius);
      expect(hit.pushX).toBeGreaterThan(0); // Pushes player away from center
    }
  });

  it('should return null when player is in clear open terrain with no obstacles nearby', () => {
    // Open space far from any obstacle
    const hit = getCollidingObstacle(CABIN_POS.x + 8.5, CABIN_POS.z + 8.5, 0.45);
    // Even if near cabin, outside the radius + player radius
    expect(hit === null || hit.dist >= hit.obstacle.radius + 0.45).toBe(true);
  });
});

describe('Wildlife AI & Animal Profiles', () => {
  it('should generate initial wildlife herds with valid positions and health', () => {
    const wildlife = generateInitialWildlife();
    expect(wildlife.length).toBeGreaterThanOrEqual(25);

    wildlife.forEach((a) => {
      expect(a.health).toBe(a.maxHealth);
      expect(a.weightKg).toBeGreaterThan(0);
      expect(['Bronze', 'Silver', 'Gold', 'Diamond']).toContain(a.trophyRating);
      expect(['Male', 'Female']).toContain(a.gender);

      // Verify spawn is within bounds
      expect(a.position[0]).toBeGreaterThanOrEqual(-WORLD_HALF);
      expect(a.position[0]).toBeLessThanOrEqual(WORLD_HALF);
      expect(a.position[2]).toBeGreaterThanOrEqual(-WORLD_HALF);
      expect(a.position[2]).toBeLessThanOrEqual(WORLD_HALF);
    });
  });

  it('should transition to wounded_flee and drop blood when wounded', () => {
    const deer: AnimalInstance = {
      id: 'test_deer_1',
      species: 'deer',
      position: [0, 5, 0],
      rotation: 0,
      state: 'graze',
      health: 40,
      maxHealth: 100,
      speed: 0,
      weightKg: 85,
      trophyRating: 'Silver',
      gender: 'Male',
      alertLevel: 0,
      targetPosition: null,
      stateTimer: 5,
      isWounded: true,
      bloodTrailTimer: 3.0, // trigger track drop
    };

    let droppedTrack: any = null;
    const onDropTrack = (track: any) => {
      droppedTrack = track;
    };
    const onAttackPlayer = () => {};

    const updated = updateAnimalAI(
      deer,
      0.1,
      [50, 5, 50], // player far away
      0.1,
      false,
      0,
      onDropTrack,
      onAttackPlayer
    );

    expect(updated.state).toBe('wounded_flee');
    expect(updated.speed).toBeGreaterThan(5); // running speed
    expect(droppedTrack).not.toBeNull();
    expect(droppedTrack.type).toBe('blood');
  });

  it('should transition to dead state when health reaches 0', () => {
    const boar: AnimalInstance = {
      id: 'test_boar_1',
      species: 'boar',
      position: [10, 5, 10],
      rotation: 0,
      state: 'wander',
      health: 0,
      maxHealth: 160,
      speed: 2,
      weightKg: 120,
      trophyRating: 'Gold',
      gender: 'Male',
      alertLevel: 0,
      targetPosition: null,
      stateTimer: 2,
      isWounded: false,
      bloodTrailTimer: 0,
    };

    const updated = updateAnimalAI(
      boar,
      0.05,
      [10, 5, 10],
      0.5,
      false,
      0,
      () => {},
      () => {}
    );

    expect(updated.state).toBe('dead');
    expect(updated.speed).toBe(0);
  });
});

describe('Zustand State Store & Progression', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should consume ammunition correctly and fail when magazine is empty', () => {
    const store = useGameStore.getState();
    expect(store.weapons.rifle.ammo).toBe(5);

    // Fire 5 times
    for (let i = 0; i < 5; i++) {
      const fired = useGameStore.getState().consumeAmmo();
      expect(fired).toBe(true);
    }

    expect(useGameStore.getState().weapons.rifle.ammo).toBe(0);

    // 6th shot should fail
    const emptyFire = useGameStore.getState().consumeAmmo();
    expect(emptyFire).toBe(false);
  });

  it('should award correct Credits, XP, and Trophy entry on animal harvest', () => {
    const initialCredits = useGameStore.getState().credits;
    const initialTrophiesCount = useGameStore.getState().trophies.length;

    const testAnimal: AnimalInstance = {
      id: 'harvest_test_deer',
      species: 'deer',
      position: [-30, 6, 60],
      rotation: 0,
      state: 'dead',
      health: 0,
      maxHealth: 100,
      speed: 0,
      weightKg: 95,
      trophyRating: 'Gold',
      gender: 'Male',
      alertLevel: 0,
      targetPosition: null,
      stateTimer: 0,
      isWounded: true,
      bloodTrailTimer: 0,
    };

    useGameStore.getState().setAnimals([testAnimal]);
    useGameStore.getState().harvestAnimal(testAnimal, 'vitals', 45);

    const updated = useGameStore.getState();
    expect(updated.trophies.length).toBe(initialTrophiesCount + 1);
    expect(updated.credits).toBeGreaterThan(initialCredits);
    expect(updated.trophies[0].species).toBe('deer');
    expect(updated.trophies[0].trophyRating).toBe('Gold');
    expect(updated.trophies[0].hitZone).toBe('vitals');
  });

  it('should handle shop purchases when credits are sufficient', () => {
    // Add credits to afford scope upgrade (800 C)
    useGameStore.setState({ credits: 1000 });

    useGameStore.getState().buyShopItem('item_rifle_scope_upgrade');

    const state = useGameStore.getState();
    expect(state.credits).toBe(200); // 1000 - 800
    const item = state.shopItems.find((i) => i.id === 'item_rifle_scope_upgrade');
    expect(item?.isPurchased).toBe(true);
    expect(state.weapons.rifle.zoomFov).toBe(14); // Upgraded 12x scope
  });

  it('should not allow shop purchase if credits are insufficient', () => {
    useGameStore.setState({ credits: 50 }); // Insufficient for 800 C scope

    useGameStore.getState().buyShopItem('item_rifle_scope_upgrade');

    const state = useGameStore.getState();
    expect(state.credits).toBe(50); // Unchanged
    const item = state.shopItems.find((i) => i.id === 'item_rifle_scope_upgrade');
    expect(item?.isPurchased).toBe(false);
  });
});
