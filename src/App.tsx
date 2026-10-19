import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './game/state/useGameStore';

// 3D Scene Components
import { AtmosphereSky } from './game/components/AtmosphereSky';
import { Terrain } from './game/components/Terrain';
import { Vegetation } from './game/components/Vegetation';
import { HuntingCabin } from './game/components/HuntingCabin';
import { LookoutTower } from './game/components/LookoutTower';
import { WildlifeRenderer } from './game/components/WildlifeRenderer';
import { TrackingDecals } from './game/components/TrackingDecals';

// Controls & Systems
import { PlayerController } from './game/controls/PlayerController';
import { WeaponSystem } from './game/weapons/WeaponSystem';
import { WildlifeSystem } from './game/ai/WildlifeSystem';

// 2D Interface & Overlays
import { HUD } from './game/ui/HUD';
import { WorldMapModal } from './game/ui/WorldMapModal';
import { InventoryModal } from './game/ui/InventoryModal';
import { ShopModal } from './game/ui/ShopModal';
import { MissionsModal } from './game/ui/MissionsModal';
import { SettingsModal } from './game/ui/SettingsModal';
import { PhotoModeModal } from './game/ui/PhotoModeModal';
import { PauseMenu } from './game/ui/PauseMenu';
import { WelcomeModal } from './game/ui/WelcomeModal';

import './App.css';

export function App() {
  const settings = useGameStore((s) => s.settings);

  return (
    <div className="game-container">
      {/* 3D WebGL Canvas */}
      <Canvas
        className="webgl-canvas"
        shadows={settings.graphicsQuality !== 'low'}
        camera={{
          position: [-35, 7.8, 65],
          fov: settings.fov,
          near: 0.1,
          far: 500,
        }}
        gl={{
          antialias: settings.graphicsQuality === 'high',
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Atmospheric Sky, Moving Sun/Moon, Fog */}
          <AtmosphereSky />

          {/* Procedural Terrain & Lake */}
          <Terrain />

          {/* Instanced Pine Forests, Rocks, and Grass */}
          <Vegetation />

          {/* Pine Valley Hunting Lodge Outpost */}
          <HuntingCabin />

          {/* Eagle Crest Observation Watchtower */}
          <LookoutTower />

          {/* Wildlife 3D Entities */}
          <WildlifeRenderer />

          {/* Animal Footprints, Blood Trails & Clues */}
          <TrackingDecals />

          {/* First-Person Viewmodel, Ballistics, Recoil, ADS */}
          <WeaponSystem />

          {/* First-Person Character Controller & Ground Physics */}
          <PlayerController />

          {/* Wildlife AI Ticking System */}
          <WildlifeSystem />
        </Suspense>
      </Canvas>

      {/* 2D Game Tactical HUD */}
      <HUD />

      {/* Fullscreen Game Modals & Menus */}
      <WorldMapModal />
      <InventoryModal />
      <ShopModal />
      <MissionsModal />
      <SettingsModal />
      <PhotoModeModal />
      <PauseMenu />
      <WelcomeModal />
    </div>
  );
}

export default App;
