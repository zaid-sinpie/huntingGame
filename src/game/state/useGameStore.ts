import { create } from 'zustand';
import type {
  AnimalInstance,
  AnimalSpecies,
  AnimalTrack,
  GameSettings,
  HarvestRecord,
  Mission,
  ShopItem,
  WeaponData,
  WeaponType,
  WeatherType,
} from '../types';

export const INITIAL_WEAPONS: Record<WeaponType, WeaponData> = {
  rifle: {
    id: 'rifle',
    name: 'M700 Hunter .308 Win',
    description: 'Precision bolt-action hunting rifle equipped with a 4x-8x optical scope. Ideal for medium to long-range big game.',
    damage: 100,
    range: 250,
    magazineSize: 5,
    ammo: 5,
    maxAmmo: 5,
    reserveAmmo: 30,
    fireRateRps: 1.0,
    reloadTimeMs: 2200,
    zoomFov: 24,
    recoil: 0.12,
    isUnlocked: true,
    price: 0,
    hasScope: true,
  },
  bow: {
    id: 'bow',
    name: 'Apex Carbon Hunting Bow',
    description: 'Silent composite hunting bow firing broadhead carbon arrows. Silent to distant animals, preventing spooking.',
    damage: 85,
    range: 65,
    magazineSize: 1,
    ammo: 1,
    maxAmmo: 1,
    reserveAmmo: 25,
    fireRateRps: 0.8,
    reloadTimeMs: 1200,
    zoomFov: 50,
    recoil: 0.04,
    isUnlocked: true,
    price: 500,
    hasScope: false,
  },
  binoculars: {
    id: 'binoculars',
    name: 'Highland 12x50 Spotter',
    description: 'High-magnification hunting optics with integrated rangefinder and species classification readout.',
    damage: 0,
    range: 400,
    magazineSize: 0,
    ammo: 0,
    maxAmmo: 0,
    reserveAmmo: 0,
    fireRateRps: 0,
    reloadTimeMs: 0,
    zoomFov: 14,
    recoil: 0,
    isUnlocked: true,
    price: 0,
    hasScope: true,
  },
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission_1',
    title: 'First Wilderness Hunt',
    description: 'Locate and harvest 1 Whitetail Deer in Pine Valley or the Golden Meadow.',
    targetSpecies: 'deer',
    requiredCount: 1,
    currentCount: 0,
    rewardCredits: 350,
    rewardXp: 150,
    isCompleted: false,
    isClaimed: false,
    type: 'hunt',
  },
  {
    id: 'mission_2',
    title: 'Precision Marksman',
    description: 'Execute a clean vital lung or heart shot on any large animal.',
    requiredCount: 1,
    currentCount: 0,
    rewardCredits: 450,
    rewardXp: 200,
    isCompleted: false,
    isClaimed: false,
    type: 'vital_shot',
  },
  {
    id: 'mission_3',
    title: 'Boar Menace in the Foothills',
    description: 'Track down and harvest 2 European Wild Boars roaming the rocky ridges.',
    targetSpecies: 'boar',
    requiredCount: 2,
    currentCount: 0,
    rewardCredits: 700,
    rewardXp: 350,
    isCompleted: false,
    isClaimed: false,
    type: 'hunt',
  },
  {
    id: 'mission_4',
    title: 'The Howling Shadow',
    description: 'Encounter and harvest a Grey Wolf stalking near Whispering Ridge.',
    targetSpecies: 'wolf',
    requiredCount: 1,
    currentCount: 0,
    rewardCredits: 900,
    rewardXp: 500,
    isCompleted: false,
    isClaimed: false,
    type: 'hunt',
  },
  {
    id: 'mission_5',
    title: 'Lookout Tower Reconnaissance',
    description: 'Ascend the Eagle Crest Watchtower overlooking Pine Valley.',
    requiredCount: 1,
    currentCount: 0,
    rewardCredits: 300,
    rewardXp: 150,
    isCompleted: false,
    isClaimed: false,
    type: 'explore',
    targetLocation: [-75, 95],
  },
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'item_rifle_scope_upgrade',
    name: 'Ballistic 12x Long-Range Scope',
    category: 'optics',
    description: 'Superior multi-coated glass offering 12x zoom magnification for high-distance shots.',
    price: 800,
    isPurchased: false,
    icon: 'Crosshair',
    effectDescription: 'Rifle zoom increases from 4x to 12x FOV.',
  },
  {
    id: 'item_scent_mask',
    name: 'Pine-Mist Scent Eliminator Spray',
    category: 'gear',
    description: 'Neutralizes human scent molecules, reducing animal detection range by 60%.',
    price: 450,
    isPurchased: false,
    icon: 'Wind',
    effectDescription: 'Animals smell you from 60% less distance.',
  },
  {
    id: 'item_rifle_suppressor',
    name: 'Titanium Whisper Suppressor',
    category: 'weapon',
    description: 'Dampens rifle muzzle report by 70%, preventing nearby herds from instantly scattering.',
    price: 1100,
    isPurchased: false,
    icon: 'VolumeX',
    effectDescription: 'Shot acoustic radius reduced from 160m to 50m.',
  },
  {
    id: 'item_camo_suit',
    name: 'Ghillie Burlap Camouflage Suit',
    category: 'gear',
    description: 'Blends player profile into forest brush and tall grass.',
    price: 650,
    isPurchased: false,
    icon: 'EyeOff',
    effectDescription: 'Visual detection distance reduced by 40%.',
  },
  {
    id: 'item_ammo_pack',
    name: '.308 Win High-Grade Box (x20)',
    category: 'ammo',
    description: '20 rounds of premium soft-point hunting cartridges.',
    price: 120,
    isPurchased: false,
    icon: 'ShieldAlert',
    effectDescription: '+20 rifle reserve ammunition.',
  },
];

const DEFAULT_SETTINGS: GameSettings = {
  mouseSensitivity: 0.0022,
  fov: 75,
  masterVolume: 0.8,
  sfxVolume: 0.85,
  ambientVolume: 0.6,
  graphicsQuality: 'high',
  showCrosshair: true,
  showMinimap: true,
  invertY: false,
};

export interface GameState {
  // Player
  playerPos: [number, number, number];
  playerYaw: number;
  health: number;
  stamina: number;
  isSprinting: boolean;
  isCrouched: boolean;
  isAiming: boolean;
  isReloading: boolean;
  noiseLevel: number;
  isHunterSenseActive: boolean;

  // Environment
  timeOfDay: number; // 0 to 24 (hours)
  windAngle: number; // radians
  windSpeed: number; // km/h
  weather: WeatherType;

  // Weapons
  weapons: Record<WeaponType, WeaponData>;
  equippedWeaponId: WeaponType;

  // Wildlife & Tracking
  animals: AnimalInstance[];
  tracks: AnimalTrack[];
  nearbyClue: AnimalTrack | null;
  harvestableAnimal: AnimalInstance | null;
  lastLookedAnimal: { species: AnimalSpecies; distance: number; rating: string } | null;

  // Progression
  credits: number;
  xp: number;
  trophies: HarvestRecord[];
  missions: Mission[];
  shopItems: ShopItem[];

  // UI & Menus
  activeMenu: 'none' | 'map' | 'inventory' | 'shop' | 'missions' | 'settings' | 'photo' | 'pause' | 'welcome';
  isPointerLocked: boolean;
  hitFeedback: { visible: boolean; isVital: boolean; text: string; timer: number } | null;
  notification: { text: string; type: 'info' | 'success' | 'warning'; timer: number } | null;
  settings: GameSettings;

  // Actions
  setPlayerPos: (pos: [number, number, number]) => void;
  setPlayerYaw: (yaw: number) => void;
  setPlayerStats: (stats: Partial<{ health: number; stamina: number; isSprinting: boolean; isCrouched: boolean; noiseLevel: number }>) => void;
  setIsAiming: (aiming: boolean) => void;
  setIsReloading: (reloading: boolean) => void;
  toggleHunterSense: () => void;
  setTimeOfDay: (time: number) => void;
  setWeather: (weather: WeatherType) => void;

  setEquippedWeapon: (weaponId: WeaponType) => void;
  consumeAmmo: () => boolean;
  reloadWeapon: () => void;

  setAnimals: (animals: AnimalInstance[]) => void;
  updateAnimal: (id: string, updates: Partial<AnimalInstance>) => void;
  addTrack: (track: AnimalTrack) => void;
  setNearbyClue: (clue: AnimalTrack | null) => void;
  setHarvestableAnimal: (animal: AnimalInstance | null) => void;
  setLastLookedAnimal: (info: { species: AnimalSpecies; distance: number; rating: string } | null) => void;

  harvestAnimal: (animal: AnimalInstance, hitZone: 'vitals' | 'head' | 'flesh' | 'leg', dist: number) => void;
  claimMission: (missionId: string) => void;
  buyShopItem: (itemId: string) => void;

  setActiveMenu: (menu: GameState['activeMenu']) => void;
  setIsPointerLocked: (locked: boolean) => void;
  showHitFeedback: (isVital: boolean, text: string) => void;
  showNotification: (text: string, type?: 'info' | 'success' | 'warning') => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetGame: () => void;
}

const STORAGE_KEY = 'wildhunt_save_v1';

function loadSavedState(): Partial<GameState> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      credits: parsed.credits,
      xp: parsed.xp,
      trophies: parsed.trophies,
      missions: parsed.missions,
      shopItems: parsed.shopItems,
      weapons: parsed.weapons,
      settings: parsed.settings,
    };
  } catch {
    return {};
  }
}

export const useGameStore = create<GameState>((set, get) => {
  const saved = loadSavedState();

  return {
    playerPos: [-35, 6.2, 65], // Spawns right in front of the hunting cabin
    playerYaw: 0,
    health: 100,
    stamina: 100,
    isSprinting: false,
    isCrouched: false,
    isAiming: false,
    isReloading: false,
    noiseLevel: 0.1,
    isHunterSenseActive: false,

    timeOfDay: 8.5, // 8:30 AM morning mist
    windAngle: 0.75, // blowing North-East
    windSpeed: 14, // 14 km/h
    weather: 'clear',

    weapons: saved.weapons || INITIAL_WEAPONS,
    equippedWeaponId: 'rifle',

    animals: [],
    tracks: [],
    nearbyClue: null,
    harvestableAnimal: null,
    lastLookedAnimal: null,

    credits: saved.credits ?? 250,
    xp: saved.xp ?? 0,
    trophies: saved.trophies || [],
    missions: saved.missions || INITIAL_MISSIONS,
    shopItems: saved.shopItems || INITIAL_SHOP_ITEMS,

    activeMenu: 'welcome',
    isPointerLocked: false,
    hitFeedback: null,
    notification: null,
    settings: { ...DEFAULT_SETTINGS, ...saved.settings },

    setPlayerPos: (playerPos) => set({ playerPos }),
    setPlayerYaw: (playerYaw) => set({ playerYaw }),
    setPlayerStats: (stats) => set((prev) => ({ ...prev, ...stats })),
    setIsAiming: (isAiming) => set({ isAiming }),
    setIsReloading: (isReloading) => set({ isReloading }),
    toggleHunterSense: () => set((prev) => ({ isHunterSenseActive: !prev.isHunterSenseActive })),
    setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
    setWeather: (weather) => set({ weather }),

    setEquippedWeapon: (weaponId) => {
      const state = get();
      if (state.weapons[weaponId]?.isUnlocked) {
        set({ equippedWeaponId: weaponId, isAiming: false, isReloading: false });
      }
    },

    consumeAmmo: () => {
      const state = get();
      const current = state.weapons[state.equippedWeaponId];
      if (!current || current.ammo <= 0) return false;

      const updatedWeapons = {
        ...state.weapons,
        [state.equippedWeaponId]: {
          ...current,
          ammo: current.ammo - 1,
        },
      };
      set({ weapons: updatedWeapons });
      return true;
    },

    reloadWeapon: () => {
      const state = get();
      const current = state.weapons[state.equippedWeaponId];
      if (!current || current.ammo >= current.magazineSize || current.reserveAmmo <= 0 || state.isReloading) {
        return;
      }

      set({ isReloading: true });
      setTimeout(() => {
        const cur = get().weapons[get().equippedWeaponId];
        if (!cur) {
          set({ isReloading: false });
          return;
        }
        const needed = cur.magazineSize - cur.ammo;
        const available = Math.min(needed, cur.reserveAmmo);
        set((s) => ({
          isReloading: false,
          weapons: {
            ...s.weapons,
            [s.equippedWeaponId]: {
              ...cur,
              ammo: cur.ammo + available,
              reserveAmmo: cur.reserveAmmo - available,
            },
          },
        }));
      }, current.reloadTimeMs);
    },

    setAnimals: (animals) => set({ animals }),
    updateAnimal: (id, updates) =>
      set((s) => ({
        animals: s.animals.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      })),
    addTrack: (track) =>
      set((s) => ({
        // Keep max 80 tracks to preserve performance
        tracks: [track, ...s.tracks].slice(0, 80),
      })),
    setNearbyClue: (nearbyClue) => set({ nearbyClue }),
    setHarvestableAnimal: (harvestableAnimal) => set({ harvestableAnimal }),
    setLastLookedAnimal: (lastLookedAnimal) => set({ lastLookedAnimal }),

    harvestAnimal: (animal, hitZone, dist) => {
      const state = get();
      // Calculate reward based on species & trophy tier
      const baseRewards: Record<AnimalSpecies, { cred: number; xp: number }> = {
        rabbit: { cred: 75, xp: 40 },
        deer: { cred: 320, xp: 160 },
        boar: { cred: 450, xp: 220 },
        wolf: { cred: 600, xp: 320 },
        bear: { cred: 1000, xp: 600 },
      };

      const multipliers = { Bronze: 1.0, Silver: 1.3, Gold: 1.7, Diamond: 2.5 };
      const rating = animal.trophyRating;
      const base = baseRewards[animal.species];
      const mult = multipliers[rating];

      const rewardCredits = Math.round(base.cred * mult);
      const rewardXp = Math.round(base.xp * mult);

      const record: HarvestRecord = {
        id: `harvest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        species: animal.species,
        weightKg: animal.weightKg,
        trophyRating: rating,
        distanceMeters: Math.round(dist),
        hitZone,
        rewardCredits,
        rewardXp,
        timestamp: Date.now(),
      };

      // Update missions progress
      const updatedMissions = state.missions.map((m) => {
        if (m.isCompleted) return m;
        let newCount = m.currentCount;
        if (m.type === 'hunt' && (!m.targetSpecies || m.targetSpecies === animal.species)) {
          newCount += 1;
        } else if (m.type === 'vital_shot' && (hitZone === 'vitals' || hitZone === 'head')) {
          newCount += 1;
        }
        const isCompleted = newCount >= m.requiredCount;
        return { ...m, currentCount: newCount, isCompleted };
      });

      // Mark animal as harvested
      const updatedAnimals = state.animals.map((a) => (a.id === animal.id ? { ...a, state: 'harvested' as const } : a));

      const newCredits = state.credits + rewardCredits;
      const newXp = state.xp + rewardXp;
      const newTrophies = [record, ...state.trophies];

      set({
        credits: newCredits,
        xp: newXp,
        trophies: newTrophies,
        missions: updatedMissions,
        animals: updatedAnimals,
        harvestableAnimal: null,
      });

      get().showNotification(
        `Harvested ${animal.gender} ${animal.species.toUpperCase()} (${rating} Trophy, +${rewardCredits} Credits, +${rewardXp} XP)`,
        'success'
      );

      // Auto save
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              credits: newCredits,
              xp: newXp,
              trophies: newTrophies,
              missions: updatedMissions,
              shopItems: state.shopItems,
              weapons: state.weapons,
              settings: state.settings,
            })
          );
        } catch (e) {
          console.warn('Failed to save to localStorage:', e);
        }
      }
    },

    claimMission: (missionId) => {
      const state = get();
      const mission = state.missions.find((m) => m.id === missionId);
      if (!mission || !mission.isCompleted || mission.isClaimed) return;

      const updatedMissions = state.missions.map((m) => (m.id === missionId ? { ...m, isClaimed: true } : m));

      const newCredits = state.credits + mission.rewardCredits;
      const newXp = state.xp + mission.rewardXp;

      set({
        credits: newCredits,
        xp: newXp,
        missions: updatedMissions,
      });

      get().showNotification(`Claimed Contract: "${mission.title}" (+${mission.rewardCredits} Credits)`, 'success');
    },

    buyShopItem: (itemId) => {
      const state = get();
      const item = state.shopItems.find((i) => i.id === itemId);
      if (!item || item.isPurchased || state.credits < item.price) {
        get().showNotification('Insufficient Credits!', 'warning');
        return;
      }

      const newCredits = state.credits - item.price;
      const updatedItems = state.shopItems.map((i) => (i.id === itemId ? { ...i, isPurchased: true } : i));

      // Apply upgrades
      const updatedWeapons = { ...state.weapons };
      if (itemId === 'item_rifle_scope_upgrade') {
        updatedWeapons.rifle = { ...updatedWeapons.rifle, zoomFov: 14 };
      } else if (itemId === 'item_ammo_pack') {
        updatedWeapons.rifle = { ...updatedWeapons.rifle, reserveAmmo: updatedWeapons.rifle.reserveAmmo + 20 };
      }

      set({
        credits: newCredits,
        shopItems: updatedItems,
        weapons: updatedWeapons,
      });

      get().showNotification(`Purchased ${item.name}!`, 'success');
    },

    setActiveMenu: (activeMenu) => {
      set({ activeMenu });
      // Release or request pointer lock based on menu
      if (activeMenu !== 'none') {
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
      }
    },

    setIsPointerLocked: (isPointerLocked) => set({ isPointerLocked }),

    showHitFeedback: (isVital, text) => {
      set({ hitFeedback: { visible: true, isVital, text, timer: Date.now() } });
      setTimeout(() => {
        set((s) => (s.hitFeedback?.text === text ? { hitFeedback: null } : s));
      }, 1200);
    },

    showNotification: (text, type = 'info') => {
      set({ notification: { text, type, timer: Date.now() } });
      setTimeout(() => {
        set((s) => (s.notification?.text === text ? { notification: null } : s));
      }, 3500);
    },

    updateSettings: (newSettings) => {
      set((s) => ({
        settings: { ...s.settings, ...newSettings },
      }));
    },

    resetGame: () => {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      set({
        credits: 250,
        xp: 0,
        trophies: [],
        missions: INITIAL_MISSIONS,
        shopItems: INITIAL_SHOP_ITEMS,
        weapons: INITIAL_WEAPONS,
        playerPos: [-35, 6.2, 65],
        activeMenu: 'none',
      });
      get().showNotification('Game progress reset.', 'info');
    },
  };
});
