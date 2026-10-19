import type { AnimalInstance, AnimalSpecies, AnimalState, AnimalTrack } from '../types';
import { getTerrainHeight, isPositionWater, WORLD_HALF } from '../terrain/terrainHeight';
import { worldObstacles } from '../terrain/obstacles';
import { soundEngine } from '../audio/soundEngine';

export interface SpeciesProfile {
  species: AnimalSpecies;
  maxHealth: number;
  walkSpeed: number;
  runSpeed: number;
  baseWeight: number; // kg
  weightVariance: number;
  sightRange: number; // meters
  scentRange: number; // meters
  hearingRange: number; // meters
  isAggressive: boolean; // will charge player
  modelScale: number;
}

export const SPECIES_PROFILES: Record<AnimalSpecies, SpeciesProfile> = {
  deer: {
    species: 'deer',
    maxHealth: 100,
    walkSpeed: 2.4,
    runSpeed: 10.5,
    baseWeight: 85,
    weightVariance: 25,
    sightRange: 65,
    scentRange: 80,
    hearingRange: 75,
    isAggressive: false,
    modelScale: 1.0,
  },
  boar: {
    species: 'boar',
    maxHealth: 160,
    walkSpeed: 2.0,
    runSpeed: 8.5,
    baseWeight: 110,
    weightVariance: 35,
    sightRange: 45,
    scentRange: 70,
    hearingRange: 60,
    isAggressive: true,
    modelScale: 0.9,
  },
  wolf: {
    species: 'wolf',
    maxHealth: 120,
    walkSpeed: 3.2,
    runSpeed: 11.2,
    baseWeight: 45,
    weightVariance: 15,
    sightRange: 85,
    scentRange: 105,
    hearingRange: 90,
    isAggressive: true,
    modelScale: 0.85,
  },
  bear: {
    species: 'bear',
    maxHealth: 280,
    walkSpeed: 2.2,
    runSpeed: 9.8,
    baseWeight: 320,
    weightVariance: 80,
    sightRange: 55,
    scentRange: 120,
    hearingRange: 70,
    isAggressive: true,
    modelScale: 1.35,
  },
  rabbit: {
    species: 'rabbit',
    maxHealth: 30,
    walkSpeed: 1.8,
    runSpeed: 11.5,
    baseWeight: 3.5,
    weightVariance: 1.2,
    sightRange: 40,
    scentRange: 35,
    hearingRange: 50,
    isAggressive: false,
    modelScale: 0.45,
  },
};

/**
 * Generates initial wildlife population distributed throughout their native biomes
 */
export function generateInitialWildlife(): AnimalInstance[] {
  const list: AnimalInstance[] = [];
  let idCounter = 1;

  const spawnAnimal = (species: AnimalSpecies, cx: number, cz: number, spread: number) => {
    let valid = false;
    let x = cx;
    let z = cz;
    let attempts = 0;

    while (!valid && attempts < 25) {
      attempts++;
      x = cx + (Math.random() - 0.5) * spread * 2;
      z = cz + (Math.random() - 0.5) * spread * 2;

      // Keep within bounds
      x = Math.max(-WORLD_HALF + 15, Math.min(WORLD_HALF - 15, x));
      z = Math.max(-WORLD_HALF + 15, Math.min(WORLD_HALF - 15, z));

      // Must not be in water or inside cabin/camp
      if (!isPositionWater(x, z) && Math.hypot(x - (-35), z - 65) > 25) {
        valid = true;
      }
    }

    const y = getTerrainHeight(x, z);
    const prof = SPECIES_PROFILES[species];
    const weight = Math.round(prof.baseWeight + (Math.random() - 0.5) * prof.weightVariance);

    // Trophy rating based on weight distribution
    const norm = (weight - (prof.baseWeight - prof.weightVariance * 0.5)) / prof.weightVariance;
    let trophyRating: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
    if (norm > 0.85) trophyRating = 'Diamond';
    else if (norm > 0.65) trophyRating = 'Gold';
    else if (norm > 0.35) trophyRating = 'Silver';

    list.push({
      id: `animal_${idCounter++}_${species}`,
      species,
      position: [x, y, z],
      rotation: Math.random() * Math.PI * 2,
      state: Math.random() < 0.5 ? 'graze' : 'wander',
      health: prof.maxHealth,
      maxHealth: prof.maxHealth,
      speed: 0,
      weightKg: weight,
      trophyRating,
      gender: Math.random() < 0.5 ? 'Male' : 'Female',
      alertLevel: 0,
      targetPosition: null,
      stateTimer: 2 + Math.random() * 5,
      isWounded: false,
      bloodTrailTimer: 0,
    });
  };

  // 1. Deer herds (Pine Valley & Golden Meadow)
  for (let i = 0; i < 7; i++) spawnAnimal('deer', -60, -10, 45); // Pine Valley
  for (let i = 0; i < 6; i++) spawnAnimal('deer', 80, 50, 50); // Golden Meadow

  // 2. Wild Boar sounders (Rocky foothills and lake banks)
  for (let i = 0; i < 5; i++) spawnAnimal('boar', -10, -55, 35);
  for (let i = 0; i < 4; i++) spawnAnimal('boar', 55, -45, 30);

  // 3. Wolf pack (Whispering Ridge)
  for (let i = 0; i < 4; i++) spawnAnimal('wolf', 20, -120, 40);
  for (let i = 0; i < 3; i++) spawnAnimal('wolf', -80, -90, 35);

  // 4. Grizzly Bears (Solitary, mountain passes)
  spawnAnimal('bear', -40, -140, 30);
  spawnAnimal('bear', 70, -110, 30);

  // 5. Rabbits (Meadows & forest brush)
  for (let i = 0; i < 8; i++) spawnAnimal('rabbit', 30, 70, 45);
  for (let i = 0; i < 6; i++) spawnAnimal('rabbit', -80, 40, 40);

  return list;
}

/**
 * Updates an animal's AI, senses, movement, obstacle steering, and ground clamping
 */
export function updateAnimalAI(
  animal: AnimalInstance,
  delta: number,
  playerPos: [number, number, number],
  playerNoise: number,
  isPlayerCrouched: boolean,
  windAngle: number,
  onDropTrack: (track: AnimalTrack) => void,
  onAttackPlayer: (damage: number) => void
): AnimalInstance {
  if (animal.state === 'dead' || animal.state === 'harvested') {
    return animal;
  }

  const prof = SPECIES_PROFILES[animal.species];
  let [ax, ay, az] = animal.position;
  let state: AnimalState = animal.state;
  let rotation = animal.rotation;
  let speed = animal.speed;
  let health = animal.health;
  let alertLevel = animal.alertLevel;
  let targetPosition = animal.targetPosition;
  let stateTimer = animal.stateTimer;
  let isWounded = animal.isWounded;
  let bloodTrailTimer = animal.bloodTrailTimer;

  stateTimer -= delta;

  // 1. Distance & Threat detection to player
  const [px, , pz] = playerPos;
  const dx = px - ax;
  const dz = pz - az;
  const distToPlayer = Math.hypot(dx, dz);

  // Calculate wind & scent detection
  // Wind vector: [cos(windAngle), sin(windAngle)]
  const windX = Math.cos(windAngle);
  const windZ = Math.sin(windAngle);
  // Vector from player to animal
  const pToAnimalDist = distToPlayer || 0.001;
  const normPToAnimalX = -dx / pToAnimalDist;
  const normPToAnimalZ = -dz / pToAnimalDist;
  const dotWind = normPToAnimalX * windX + normPToAnimalZ * windZ;
  // If dotWind > 0.3, the wind blows player scent toward animal
  const scentMultiplier = dotWind > 0.3 ? 1.6 : 0.7;

  // Noise factor
  const noiseDist = playerNoise * 75; // sprint footsteps heard up to 75m
  const visualFactor = isPlayerCrouched ? 0.5 : 1.0;

  const canSee = distToPlayer < prof.sightRange * visualFactor;
  const canSmell = distToPlayer < prof.scentRange * scentMultiplier;
  const canHear = distToPlayer < noiseDist;

  const playerThreat = canSee || canSmell || canHear;

  // 2. State Machine Transitions
  if (health <= 0) {
    state = 'dead';
    speed = 0;
    return {
      ...animal,
      position: [ax, ay, az],
      state,
      speed,
      health: 0,
    };
  }

  // Wounded flight
  if (isWounded) {
    state = 'wounded_flee';
  }

  if (state === 'wounded_flee') {
    speed = prof.runSpeed * 0.9;
    // Flee away from player
    rotation = Math.atan2(-dz, -dx);

    // Drop blood trail periodically
    bloodTrailTimer += delta;
    if (bloodTrailTimer > 2.5) {
      bloodTrailTimer = 0;
      onDropTrack({
        id: `track_blood_${Date.now()}_${Math.random()}`,
        species: animal.species,
        position: [ax, ay + 0.05, az],
        rotation,
        timestamp: Date.now(),
        type: 'blood',
        freshness: 'Very Fresh',
        direction: [Math.cos(rotation), Math.sin(rotation)],
      });
    }

    // Wounded animal gradually loses health if severely wounded
    health = Math.max(0, health - delta * 2.5);
  } else if (playerThreat && state !== 'flee' && state !== 'attack') {
    alertLevel = Math.min(1.0, alertLevel + delta * 1.5);

    if (alertLevel > 0.6) {
      // Periodic animal call when alarmed
      if (Math.random() < 0.008 && animal.species !== 'rabbit') {
        soundEngine.playAnimalCall(animal.species as 'deer' | 'boar' | 'wolf' | 'bear');
      }

      if (prof.isAggressive && distToPlayer < 20 && Math.random() < 0.65) {
        state = 'attack';
      } else {
        state = 'flee';
      }
    } else {
      state = 'alert';
      speed = 0;
      rotation = Math.atan2(dz, dx); // face player
    }
  } else if (state === 'flee') {
    speed = prof.runSpeed;
    // Run away from player vector
    const fleeAngle = Math.atan2(-dz, -dx);
    rotation = fleeAngle;

    if (distToPlayer > prof.sightRange * 1.6 && stateTimer <= 0) {
      state = 'wander';
      alertLevel = 0.2;
      stateTimer = 4 + Math.random() * 6;
    }
  } else if (state === 'attack') {
    speed = prof.runSpeed * 1.05;
    // Run directly at player
    rotation = Math.atan2(dz, dx);

    // Attack strike if within 2.2 meters!
    if (distToPlayer < 2.2) {
      const damage = animal.species === 'bear' ? 35 : animal.species === 'wolf' ? 22 : 18;
      onAttackPlayer(damage);
      // Brief pause after strike
      stateTimer = 1.2;
      state = 'alert';
    }

    if (distToPlayer > 40 && stateTimer <= 0) {
      state = 'wander';
      alertLevel = 0;
    }
  } else {
    // Peaceful behaviors: IDLE, GRAZE, WANDER
    alertLevel = Math.max(0, alertLevel - delta * 0.4);

    if (stateTimer <= 0) {
      const rand = Math.random();
      if (rand < 0.4) {
        state = 'graze';
        speed = 0;
        stateTimer = 3 + Math.random() * 5;
      } else if (rand < 0.7) {
        state = 'idle';
        speed = 0;
        stateTimer = 2 + Math.random() * 4;
      } else {
        state = 'wander';
        speed = prof.walkSpeed;
        stateTimer = 4 + Math.random() * 8;
        // Choose random wander destination
        const wanderDist = 12 + Math.random() * 20;
        const wanderAngle = Math.random() * Math.PI * 2;
        targetPosition = [ax + Math.cos(wanderAngle) * wanderDist, 0, az + Math.sin(wanderAngle) * wanderDist];
        rotation = wanderAngle;
      }
    }
  }

  // 3. Movement execution with obstacle avoidance and terrain steering
  if (speed > 0) {
    let moveDirX = Math.cos(rotation);
    let moveDirZ = Math.sin(rotation);

    // Obstacle avoidance: steer away from nearby trees, rocks, cabins
    for (let i = 0; i < worldObstacles.length; i++) {
      const obs = worldObstacles[i];
      const ox = ax - obs.x;
      const oz = az - obs.z;
      const dSq = ox * ox + oz * oz;
      const safeDist = obs.radius + 1.8;

      if (dSq < safeDist * safeDist) {
        const d = Math.sqrt(dSq) || 0.001;
        // Add repulsive force
        moveDirX += (ox / d) * 2.5;
        moveDirZ += (oz / d) * 2.5;
      }
    }

    // Lake water avoidance: herbivores and land animals avoid deep water
    const nextX = ax + moveDirX * speed * delta;
    const nextZ = az + moveDirZ * speed * delta;
    if (isPositionWater(nextX, nextZ)) {
      moveDirX = -moveDirX;
      moveDirZ = -moveDirZ;
    }

    // Normalize movement direction
    const moveLen = Math.hypot(moveDirX, moveDirZ) || 0.001;
    moveDirX /= moveLen;
    moveDirZ /= moveLen;
    rotation = Math.atan2(moveDirZ, moveDirX);

    // Apply movement
    ax += moveDirX * speed * delta;
    az += moveDirZ * speed * delta;

    // Boundary clamp
    ax = Math.max(-WORLD_HALF + 10, Math.min(WORLD_HALF - 10, ax));
    az = Math.max(-WORLD_HALF + 10, Math.min(WORLD_HALF - 10, az));

    // Periodic footprint track drop (every ~6-10 meters traveled)
    if (Math.random() < delta * 0.4) {
      const trackType =
        Math.random() < 0.75
          ? 'footprint'
          : Math.random() < 0.6
          ? 'droppings'
          : 'broken_twigs';

      onDropTrack({
        id: `track_${Date.now()}_${Math.random()}`,
        species: animal.species,
        position: [ax, ay + 0.03, az],
        rotation,
        timestamp: Date.now(),
        type: trackType,
        freshness: 'Fresh',
        direction: [moveDirX, moveDirZ],
      });
    }
  }

  // Exact terrain surface alignment
  ay = getTerrainHeight(ax, az);

  return {
    ...animal,
    position: [ax, ay, az],
    rotation,
    state,
    speed,
    health,
    alertLevel,
    targetPosition,
    stateTimer,
    isWounded,
    bloodTrailTimer,
  };
}
