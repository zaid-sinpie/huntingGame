import React from 'react';
import { useGameStore } from '../state/useGameStore';
import { CABIN_POS, TOWER_POS, LAKE_CENTER, LAKE_RADIUS, WORLD_SIZE, WORLD_HALF } from '../terrain/terrainHeight';
import { X, Compass as CompassIcon, Wind, MapPin } from 'lucide-react';

export const WorldMapModal: React.FC = () => {
  const activeMenu = useGameStore((s) => s.activeMenu);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const playerPos = useGameStore((s) => s.playerPos);
  const playerYaw = useGameStore((s) => s.playerYaw);
  const windSpeed = useGameStore((s) => s.windSpeed);
  const missions = useGameStore((s) => s.missions);

  if (activeMenu !== 'map') return null;

  // Convert world coordinate (-200 to +200) to map percentage (0% to 100%)
  const toMapPct = (wx: number, wz: number) => {
    const xPct = ((wx + WORLD_HALF) / WORLD_SIZE) * 100;
    const zPct = ((wz + WORLD_HALF) / WORLD_SIZE) * 100;
    return { x: xPct, y: zPct };
  };

  const playerMap = toMapPct(playerPos[0], playerPos[2]);
  const cabinMap = toMapPct(CABIN_POS.x, CABIN_POS.z);
  const towerMap = toMapPct(TOWER_POS.x, TOWER_POS.z);
  const lakeMap = toMapPct(LAKE_CENTER.x, LAKE_CENTER.z);

  return (
    <div className="modal-backdrop">
      <div className="map-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <CompassIcon size={24} className="accent-icon" />
            <div>
              <h2>WILDERNESS TOPOGRAPHIC MAP</h2>
              <p className="subtext">Silver Ridge Reserve • GPS Coordinates: X:{Math.round(playerPos[0])} Z:{Math.round(playerPos[2])}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveMenu('none')}>
            <X size={20} />
          </button>
        </div>

        {/* Map Viewport */}
        <div className="map-canvas-container">
          <div className="map-terrain-surface">
            {/* Topographic Contour Background */}
            <div className="map-grid-overlay" />

            {/* Biome Region Labels */}
            <div className="map-region-label north-mountains">WHISPERING RIDGE (CRAGS)</div>
            <div className="map-region-label pine-valley">PINE VALLEY (DENSE FOREST)</div>
            <div className="map-region-label golden-meadow">GOLDEN MEADOW (GRASSLANDS)</div>
            <div className="map-region-label mirror-lake-label">MIRROR LAKE</div>

            {/* Lake Surface on Map */}
            <div
              className="map-lake-feature"
              style={{
                left: `${lakeMap.x}%`,
                top: `${lakeMap.y}%`,
                width: `${(LAKE_RADIUS / WORLD_HALF) * 50}%`,
                height: `${(LAKE_RADIUS / WORLD_HALF) * 50}%`,
              }}
            />

            {/* Landmarks */}
            <div
              className="map-pin cabin-pin"
              style={{ left: `${cabinMap.x}%`, top: `${cabinMap.y}%` }}
              title="Pine Valley Hunting Lodge"
            >
              <div className="pin-icon">⌂</div>
              <span>Pine Valley Lodge</span>
            </div>

            <div
              className="map-pin tower-pin"
              style={{ left: `${towerMap.x}%`, top: `${towerMap.y}%` }}
              title="Eagle Crest Lookout Tower"
            >
              <div className="pin-icon">▲</div>
              <span>Eagle Crest Tower</span>
            </div>

            {/* Mission Objective Pins */}
            {missions
              .filter((m) => !m.isCompleted && m.targetLocation)
              .map((m) => {
                const pin = toMapPct(m.targetLocation![0], m.targetLocation![1]);
                return (
                  <div
                    key={m.id}
                    className="map-pin mission-pin"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  >
                    <MapPin size={18} />
                    <span>{m.title}</span>
                  </div>
                );
              })}

            {/* Player Marker with Heading Cone */}
            <div
              className="map-player-marker"
              style={{
                left: `${playerMap.x}%`,
                top: `${playerMap.y}%`,
              }}
            >
              <div
                className="map-player-cone"
                style={{ transform: `rotate(${playerYaw}rad)` }}
              />
              <div className="map-player-core" />
              <div className="map-player-tag">YOU</div>
            </div>
          </div>

          {/* Map Side Legend & Telemetry */}
          <div className="map-sidebar">
            <div className="sidebar-section">
              <h3>WEATHER & WIND</h3>
              <div className="sidebar-metric">
                <Wind size={18} />
                <span>Speed: {windSpeed} km/h</span>
              </div>
              <p className="hint-text">
                Always hunt downwind of wildlife to prevent scent detection!
              </p>
            </div>

            <div className="sidebar-section">
              <h3>MAP LEGEND</h3>
              <div className="legend-item">
                <span className="legend-badge lodge">⌂</span>
                <span>Hunting Lodge (Spawn / Camp)</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge tower">▲</span>
                <span>Eagle Crest Lookout Tower</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge water">●</span>
                <span>Mirror Lake & River Delta</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge forest">▲</span>
                <span>Pine Valley (Deer & Wolf territory)</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge mountain">▲</span>
                <span>Whispering Ridge (Bear habitat)</span>
              </div>
            </div>

            <div className="sidebar-actions">
              <button
                className="action-btn-primary"
                onClick={() => setActiveMenu('none')}
              >
                Close Map [M]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
