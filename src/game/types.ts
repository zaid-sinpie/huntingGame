// Complete TypeScript definitions for WildHunt 3D

export type BiomeType = 'pine_forest' | 'rocky_mountains' | 'mirror_lake' | 'golden_meadow' | 'hunting_camp';

export type WeatherType = 'clear' | 'foggy' | 'misty_rain';

export type AnimalSpecies = 'deer' | 'boar' | 'wolf' | 'bear' | 'rabbit';

export type AnimalState =
  | 'idle'
  | 'graze'
  | 'wander'
  | 'alert'
  | 'flee'
  | 'attack'
  | 'wounded_flee'
  | 'dead'
  | 'harvested';

export interface AnimalHitZone {
  zone: 'vitals' | 'head' | 'flesh' | 'leg';
  multiplier: number;
}

export interface AnimalInstance {
  id: string;
  species: AnimalSpecies;
  position: [number, number, number];
  rotation: number; // yaw in radians
  state: AnimalState;
  health: number;
  maxHealth: number;
  speed: number;
  weightKg: number;
  trophyRating: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  gender: 'Male' | 'Female';
  alertLevel: number; // 0 to 1
  targetPosition: [number, number, number] | null;
  stateTimer: number;
  isWounded: boolean;
  bloodTrailTimer: number;
}

export interface AnimalTrack {
  id: string;
  species: AnimalSpecies;
  position: [number, number, number];
  rotation: number;
  timestamp: number;
  type: 'footprint' | 'droppings' | 'blood' | 'broken_twigs';
  freshness: 'Very Fresh' | 'Fresh' | 'Old';
  direction: [number, number]; // 2D normalized direction
}

export type WeaponType = 'rifle' | 'bow' | 'binoculars';

export interface WeaponData {
  id: WeaponType;
  name: string;
  description: string;
  damage: number;
  range: number;
  magazineSize: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  fireRateRps: number; // rounds per second
  reloadTimeMs: number;
  zoomFov: number;
  recoil: number;
  isUnlocked: boolean;
  price: number;
  hasScope: boolean;
}

export interface HarvestRecord {
  id: string;
  species: AnimalSpecies;
  weightKg: number;
  trophyRating: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  distanceMeters: number;
  hitZone: 'vitals' | 'head' | 'flesh' | 'leg';
  rewardCredits: number;
  rewardXp: number;
  timestamp: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetSpecies?: AnimalSpecies;
  requiredCount: number;
  currentCount: number;
  rewardCredits: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  type: 'hunt' | 'explore' | 'vital_shot' | 'photo';
  targetLocation?: [number, number]; // [x, z]
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'weapon' | 'optics' | 'gear' | 'ammo';
  description: string;
  price: number;
  isPurchased: boolean;
  icon: string;
  effectDescription: string;
}

export interface GameSettings {
  mouseSensitivity: number;
  fov: number;
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  showCrosshair: boolean;
  showMinimap: boolean;
  invertY: boolean;
}

export interface WorldObstacle {
  x: number;
  z: number;
  radius: number;
  height: number;
  type: 'tree' | 'rock' | 'cabin' | 'tower' | 'fence';
}
