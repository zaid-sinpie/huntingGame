import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { CABIN_POS, TOWER_POS, LAKE_CENTER, LAKE_RADIUS } from '../terrain/terrainHeight';

export const Minimap: React.FC = () => {
  const playerPos = useGameStore((s) => s.playerPos);
  const playerYaw = useGameStore((s) => s.playerYaw);
  const windAngle = useGameStore((s) => s.windAngle);
  const isHunterSenseActive = useGameStore((s) => s.isHunterSenseActive);
  const animals = useGameStore((s) => s.animals);
  const showMinimap = useGameStore((s) => s.settings.showMinimap);

  if (!showMinimap) return null;

  const [px, , pz] = playerPos;
  const radarScale = 0.9; // 1 meter = 0.9px on radar (radius 100px = ~110m radar view)
  const radarRadius = 80;

  // Transform world (wx, wz) to radar coordinates (rx, ry) relative to player
  const toRadar = (wx: number, wz: number) => {
    const dx = (wx - px) * radarScale;
    const dz = (wz - pz) * radarScale;
    return { x: dx, y: dz };
  };

  const lakeRadar = toRadar(LAKE_CENTER.x, LAKE_CENTER.z);
  const cabinRadar = toRadar(CABIN_POS.x, CABIN_POS.z);
  const towerRadar = toRadar(TOWER_POS.x, TOWER_POS.z);

  return (
    <div className="minimap-container">
      <div className="minimap-frame">
        {/* World features */}
        <div className="minimap-radar">
          {/* Lake polygon / circle */}
          <div
            className="minimap-lake"
            style={{
              left: `calc(50% + ${lakeRadar.x}px)`,
              top: `calc(50% + ${lakeRadar.y}px)`,
              width: `${LAKE_RADIUS * 2 * radarScale}px`,
              height: `${LAKE_RADIUS * 2 * radarScale}px`,
            }}
          />

          {/* Cabin Icon */}
          <div
            className="minimap-landmark cabin"
            style={{
              left: `calc(50% + ${cabinRadar.x}px)`,
              top: `calc(50% + ${cabinRadar.y}px)`,
            }}
            title="Hunting Lodge"
          >
            ⌂
          </div>

          {/* Tower Icon */}
          <div
            className="minimap-landmark tower"
            style={{
              left: `calc(50% + ${towerRadar.x}px)`,
              top: `calc(50% + ${towerRadar.y}px)`,
            }}
            title="Eagle Crest Tower"
          >
            ▲
          </div>

          {/* Animals (Highlighted in Hunter Sense mode) */}
          {animals.map((a) => {
            if (a.state === 'dead' || a.state === 'harvested') return null;
            const r = toRadar(a.position[0], a.position[2]);
            const dist = Math.hypot(r.x, r.y);
            if (dist > radarRadius - 5) return null; // out of radar circle

            // Only show if Hunter Sense active OR very close (< 25m)
            if (!isHunterSenseActive && dist > 25) return null;

            return (
              <div
                key={a.id}
                className={`minimap-blip ${a.isWounded ? 'wounded' : a.species}`}
                style={{
                  left: `calc(50% + ${r.x}px)`,
                  top: `calc(50% + ${r.y}px)`,
                }}
              />
            );
          })}

          {/* Center Player Marker & Cone of Sight */}
          <div
            className="minimap-player"
            style={{ transform: `translate(-50%, -50%) rotate(${playerYaw}rad)` }}
          >
            <div className="player-cone" />
            <div className="player-dot" />
          </div>
        </div>

        {/* Compass Cardinal Marks on Rim */}
        <div className="minimap-rim-cardinals">
          <span className="cardinal-n">N</span>
          <span className="cardinal-e">E</span>
          <span className="cardinal-s">S</span>
          <span className="cardinal-w">W</span>
        </div>

        {/* Dynamic Wind Indicator Arrow */}
        <div
          className="minimap-wind-arrow"
          style={{ transform: `rotate(${windAngle}rad)` }}
          title="Wind Direction"
        >
          <div className="wind-feather" />
          <div className="wind-tip" />
        </div>
      </div>
      <div className="minimap-coords">
        <span>X: {Math.round(px)}</span>
        <span>Z: {Math.round(pz)}</span>
      </div>
    </div>
  );
};
