import React from 'react';
import { useGameStore } from '../state/useGameStore';

export const Compass: React.FC = () => {
  const playerYaw = useGameStore((s) => s.playerYaw);

  // Convert player yaw to degrees (0 to 360)
  // yaw = 0 is facing North (towards -Z)
  const deg = ((-playerYaw * 180) / Math.PI + 360) % 360;

  return (
    <div className="compass-container">
      {/* Compass Tape Ribbon */}
      <div className="compass-tape">
        <div
          className="compass-strip"
          style={{ transform: `translateX(${-deg * 4}px)` }}
        >
          {/* Repeat tape 3 times for seamless wrapping */}
          {[-360, 0, 360].map((offset) => (
            <React.Fragment key={offset}>
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = i * 5;
                const isCardinal = angle % 90 === 0;
                const isSubCardinal = angle % 45 === 0 && !isCardinal;
                const label =
                  angle === 0
                    ? 'N'
                    : angle === 45
                    ? 'NE'
                    : angle === 90
                    ? 'E'
                    : angle === 135
                    ? 'SE'
                    : angle === 180
                    ? 'S'
                    : angle === 225
                    ? 'SW'
                    : angle === 270
                    ? 'W'
                    : angle === 315
                    ? 'NW'
                    : angle % 15 === 0
                    ? `${angle}°`
                    : '';

                return (
                  <div
                    key={`${offset}-${angle}`}
                    className={`compass-tick ${isCardinal ? 'cardinal' : isSubCardinal ? 'sub' : ''}`}
                    style={{ left: `${(angle + offset) * 4 + 720}px` }}
                  >
                    <div className="tick-mark" />
                    {label && <span className="tick-label">{label}</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Center Bearing Notch */}
        <div className="compass-center-notch" />
        <div className="compass-degree-badge">{Math.round(deg)}°</div>
      </div>
    </div>
  );
};
