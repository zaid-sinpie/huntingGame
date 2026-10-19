import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { Play, Map, Package, Target, ShoppingBag, Camera, Sliders, Home } from 'lucide-react';
import { CABIN_POS } from '../terrain/terrainHeight';

export const PauseMenu: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const setPlayerPos = useGameStore((s) => s.setPlayerPos);

  if (activeMenu !== 'pause') return null;

  const handleReturnToCamp = () => {
    setPlayerPos([CABIN_POS.x, 6.2, CABIN_POS.z + 2.5]);
    setActiveMenu('none');
  };

  return (
    <div className="modal-backdrop">
      <div className="pause-menu-card">
        <div className="pause-menu-left">
          <div className="game-brand">
            <h1>WILDHUNT</h1>
            <p className="game-tagline">3D Wilderness Simulation</p>
          </div>

          <div className="menu-btn-group">
            <button className="menu-action-btn primary" onClick={() => setActiveMenu('none')}>
              <Play size={18} />
              <span>Resume Hunt</span>
            </button>

            <button className="menu-action-btn" onClick={() => setActiveMenu('map')}>
              <Map size={18} />
              <span>World Map [M]</span>
            </button>

            <button className="menu-action-btn" onClick={() => setActiveMenu('inventory')}>
              <Package size={18} />
              <span>Inventory & Trophies [I]</span>
            </button>

            <button className="menu-action-btn" onClick={() => setActiveMenu('missions')}>
              <Target size={18} />
              <span>Hunting Contracts [L]</span>
            </button>

            <button className="menu-action-btn" onClick={() => setActiveMenu('shop')}>
              <ShoppingBag size={18} />
              <span>Lodge Outfitter Shop [K]</span>
            </button>

            <button className="menu-action-btn" onClick={() => setActiveMenu('photo')}>
              <Camera size={18} />
              <span>Photo Mode [P]</span>
            </button>

            <button className="menu-action-btn" onClick={() => setActiveMenu('settings')}>
              <Sliders size={18} />
              <span>Settings</span>
            </button>

            <button className="menu-action-btn camp" onClick={handleReturnToCamp}>
              <Home size={18} />
              <span>Fast Return to Camp</span>
            </button>
          </div>
        </div>

        {/* Controls Guide Column */}
        <div className="pause-menu-right">
          <h3>CONTROLS GUIDE</h3>
          <div className="controls-grid">
            <div className="ctrl-row">
              <span className="key-cap">W A S D</span>
              <span className="ctrl-desc">Move character</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Mouse</span>
              <span className="ctrl-desc">Look around (Pointer Lock)</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Left Click</span>
              <span className="ctrl-desc">Fire equipped weapon</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Right Click</span>
              <span className="ctrl-desc">Aim Down Sights (ADS) / Scope</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Shift</span>
              <span className="ctrl-desc">Sprint (drains stamina)</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Ctrl / C</span>
              <span className="ctrl-desc">Crouch (Stealth, reduces noise)</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Space</span>
              <span className="ctrl-desc">Jump</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">R</span>
              <span className="ctrl-desc">Reload weapon</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">E</span>
              <span className="ctrl-desc">Harvest animal / Investigate track</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">Q</span>
              <span className="ctrl-desc">Toggle Hunter Sense (Tracking)</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">1 2 3</span>
              <span className="ctrl-desc">Rifle / Bow / Binoculars</span>
            </div>
            <div className="ctrl-row">
              <span className="key-cap">M / I / L</span>
              <span className="ctrl-desc">Map / Inventory / Contracts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
