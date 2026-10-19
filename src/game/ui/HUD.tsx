import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { Compass } from './Compass';
import { Minimap } from './Minimap';
import {
  Wind,
  Volume2,
  Shield,
  Zap,
  Eye,
} from 'lucide-react';

export const HUD: React.FC = () => {
  const health = useGameStore((s) => s.health);
  const stamina = useGameStore((s) => s.stamina);
  const isSprinting = useGameStore((s) => s.isSprinting);
  const isCrouched = useGameStore((s) => s.isCrouched);
  const isAiming = useGameStore((s) => s.isAiming);
  const isReloading = useGameStore((s) => s.isReloading);
  const isHunterSenseActive = useGameStore((s) => s.isHunterSenseActive);
  const noiseLevel = useGameStore((s) => s.noiseLevel);

  const windSpeed = useGameStore((s) => s.windSpeed);
  const timeOfDay = useGameStore((s) => s.timeOfDay);

  const equippedWeaponId = useGameStore((s) => s.equippedWeaponId);
  const weapons = useGameStore((s) => s.weapons);
  const currentWeapon = weapons[equippedWeaponId];

  const nearbyClue = useGameStore((s) => s.nearbyClue);
  const harvestableAnimal = useGameStore((s) => s.harvestableAnimal);
  const lastLookedAnimal = useGameStore((s) => s.lastLookedAnimal);
  const hitFeedback = useGameStore((s) => s.hitFeedback);
  const notification = useGameStore((s) => s.notification);
  const showCrosshair = useGameStore((s) => s.settings.showCrosshair);
  const activeMenu = useGameStore((s) => s.activeMenu);

  // If a full menu is open (Map, Inventory, Settings, Welcome), hide HUD
  if (activeMenu !== 'none') return null;

  // Format time of day (e.g. "08:30 AM")
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Noise meter bar count (1 to 5)
  const noiseBars = Math.min(5, Math.max(1, Math.ceil(noiseLevel * 5)));

  return (
    <div className={`hud-root ${isHunterSenseActive ? 'hunter-sense-active' : ''}`}>
      {/* 1. Top Compass Ribbon */}
      <Compass />

      {/* 2. Top-Right Minimap Radar */}
      <Minimap />

      {/* 3. Top-Center Time & Weather Badge */}
      <div className="hud-top-bar">
        <div className="hud-time-badge">
          <span className="time-clock">🕒 {timeStr}</span>
          <span className="weather-tag">🌲 Wilderness Open</span>
        </div>
      </div>

      {/* 4. Notification Banner */}
      {notification && (
        <div className={`hud-notification ${notification.type}`}>
          <div className="notif-pulse" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* 5. Center Reticle & ADS Optics Overlays */}
      {/* 5A. Fullscreen High-Powered Rifle Scope Overlay */}
      {isAiming && equippedWeaponId === 'rifle' && (
        <div className="ads-scope-overlay">
          <div className="scope-vignette-outer" />
          <div className="scope-lens">
            {/* Fine Reticle Crosshairs */}
            <div className="scope-hair-vert" />
            <div className="scope-hair-horiz" />
            {/* Mil-dot ticks */}
            <div className="scope-mil-ticks" />
            <div className="scope-center-dot" />
            {/* Elevation numbers */}
            <div className="scope-elevation-scale">
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
            </div>
            {/* Telemetry info */}
            <div className="scope-optic-tag">308-WIN • 8X MAG</div>
          </div>
        </div>
      )}

      {/* 5B. Binoculars Optic Viewfinder */}
      {isAiming && equippedWeaponId === 'binoculars' && (
        <div className="ads-binoculars-overlay">
          <div className="bino-mask-left" />
          <div className="bino-mask-right" />
          <div className="bino-telemetry">
            <div className="bino-grid-reticle" />
            <div className="bino-readout-card">
              <div className="bino-header">HIGHLAND 12x50 SPOTTER</div>
              {lastLookedAnimal ? (
                <div className="bino-species-info">
                  <div className="species-name">{lastLookedAnimal.species.toUpperCase()}</div>
                  <div className="species-meta">{lastLookedAnimal.rating}</div>
                  <div className="species-range">TARGET: {lastLookedAnimal.distance} m</div>
                </div>
              ) : (
                <div className="bino-searching">SEARCHING HORIZON...</div>
              )}
              <div className="bino-wind-data">WIND: {windSpeed} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* 5C. Dynamic Hipfire Crosshair (When not ADS) */}
      {!isAiming && showCrosshair && equippedWeaponId !== 'binoculars' && (
        <div className={`dynamic-crosshair ${isSprinting ? 'spread-wide' : isCrouched ? 'tight' : ''}`}>
          <div className="ch-line top" />
          <div className="ch-line bottom" />
          <div className="ch-line left" />
          <div className="ch-line right" />
          <div className="ch-dot" />
        </div>
      )}

      {/* 6. Hit Marker Feedback */}
      {hitFeedback && (
        <div className={`hit-feedback ${hitFeedback.isVital ? 'vital' : 'normal'}`}>
          <div className="hit-tick-mark">✕</div>
          <div className="hit-text">{hitFeedback.text}</div>
        </div>
      )}

      {/* 7. Action / Interaction Prompts */}
      <div className="hud-interaction-center">
        {harvestableAnimal ? (
          <div className="prompt-badge harvest">
            <span className="key-pill">E</span>
            <span>
              HARVEST {harvestableAnimal.gender.toUpperCase()} {harvestableAnimal.species.toUpperCase()}{' '}
              <strong className="trophy-gold">({harvestableAnimal.trophyRating} Trophy)</strong>
            </span>
          </div>
        ) : nearbyClue ? (
          <div className="prompt-badge clue">
            <span className="key-pill">E</span>
            <span>
              INVESTIGATE {nearbyClue.species.toUpperCase()} {nearbyClue.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        ) : null}
      </div>

      {/* 8. Bottom-Left: Health, Stamina, Stealth, Wind */}
      <div className="hud-bottom-left">
        {/* Health Bar */}
        <div className="stat-bar-row">
          <Shield size={16} className="stat-icon health-icon" />
          <div className="bar-track">
            <div className="bar-fill health-fill" style={{ width: `${health}%` }} />
          </div>
          <span className="stat-num">{Math.round(health)}</span>
        </div>

        {/* Stamina Bar */}
        <div className="stat-bar-row">
          <Zap size={16} className="stat-icon stamina-icon" />
          <div className="bar-track">
            <div className="bar-fill stamina-fill" style={{ width: `${stamina}%` }} />
          </div>
          <span className="stat-num">{Math.round(stamina)}</span>
        </div>

        {/* Tactical Indicators Panel */}
        <div className="hud-tactical-panel">
          {/* Stance Indicator */}
          <div className={`tactical-badge ${isCrouched ? 'crouched' : isSprinting ? 'sprinting' : ''}`}>
            {isCrouched ? 'CROUCH (STEALTH)' : isSprinting ? 'SPRINT' : 'STAND'}
          </div>

          {/* Noise Meter */}
          <div className="noise-meter" title="Player Footstep Noise">
            <Volume2 size={15} />
            <div className="noise-bars-track">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`noise-bar-segment ${i < noiseBars ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Wind & Scent Vector */}
          <div className="wind-badge">
            <Wind size={15} />
            <span>{windSpeed} km/h</span>
          </div>

          {/* Hunter Sense Toggle */}
          <div className={`hunter-sense-pill ${isHunterSenseActive ? 'active' : ''}`}>
            <Eye size={14} />
            <span>[Q] TRACKING</span>
          </div>
        </div>
      </div>

      {/* 9. Bottom-Right: Weapon, Ammo, Controls */}
      <div className="hud-bottom-right">
        <div className="weapon-card">
          <div className="weapon-info-header">
            <span className="weapon-name">{currentWeapon?.name}</span>
            <span className="weapon-type-tag">{equippedWeaponId.toUpperCase()}</span>
          </div>

          {equippedWeaponId !== 'binoculars' ? (
            <div className="ammo-counter">
              {isReloading ? (
                <span className="reloading-text">RELOADING...</span>
              ) : (
                <>
                  <span className="current-ammo">{currentWeapon?.ammo}</span>
                  <span className="ammo-divider">/</span>
                  <span className="max-mag">{currentWeapon?.magazineSize}</span>
                  <span className="reserve-ammo">[{currentWeapon?.reserveAmmo}]</span>
                </>
              )}
            </div>
          ) : (
            <div className="ammo-counter optic-only">
              <span className="optic-status">12x OPTICAL ZOOM</span>
            </div>
          )}

          {/* Key Prompts */}
          <div className="weapon-keybinds">
            <span>[RMB] Aim</span>
            <span>[R] Reload</span>
            <span>[1-3] Switch</span>
          </div>
        </div>

        {/* Global Menu Hotkeys Bar */}
        <div className="hud-hotkeys-row">
          <span>[M] Map</span>
          <span>[I] Inventory</span>
          <span>[L] Missions</span>
          <span>[K] Lodge Shop</span>
          <span>[P] Photo</span>
          <span>[ESC] Menu</span>
        </div>
      </div>
    </div>
  );
};
