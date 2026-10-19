import React from 'react';
import { useGameStore } from '../state/useGameStore';

export const AtmosphereSky: React.FC = () => {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const weather = useGameStore((s) => s.weather);

  // Compute sun elevation and azimuth from time of day (0 to 24h)
  // 6:00 is sunrise, 12:00 is solar noon, 18:00 is sunset
  const timeRad = ((timeOfDay - 6) / 12) * Math.PI;
  const sunElevation = Math.sin(timeRad);
  const sunAzimuth = Math.cos(timeRad);

  const isDay = sunElevation > -0.05;

  // Sun / Sky colors
  let skyColor = '#87ceeb';
  let sunColor = '#fff5d6';
  let ambientColor = '#8ab4c9';
  let fogColor = '#bdd2db';
  let sunIntensity = 1.6;
  let ambientIntensity = 0.55;

  if (timeOfDay >= 5 && timeOfDay < 8) {
    // Dawn / Sunrise
    skyColor = '#d99879';
    sunColor = '#ffaa55';
    ambientColor = '#947063';
    fogColor = '#c99f8f';
    sunIntensity = 1.3;
    ambientIntensity = 0.45;
  } else if (timeOfDay >= 8 && timeOfDay < 17) {
    // Clear Day
    skyColor = '#7cb8e8';
    sunColor = '#fffbe8';
    ambientColor = '#8fb8db';
    fogColor = '#bfdcf5';
    sunIntensity = 1.8;
    ambientIntensity = 0.6;
  } else if (timeOfDay >= 17 && timeOfDay < 20) {
    // Sunset / Golden hour
    skyColor = '#d46e46';
    sunColor = '#ff7733';
    ambientColor = '#804f43';
    fogColor = '#ba7768';
    sunIntensity = 1.4;
    ambientIntensity = 0.45;
  } else {
    // Night
    skyColor = '#0b131e';
    sunColor = '#8ab5d6'; // Moonlight
    ambientColor = '#132130';
    fogColor = '#0f1a26';
    sunIntensity = 0.35;
    ambientIntensity = 0.22;
  }

  // Fog density adjustment for weather
  const fogDensity = weather === 'foggy' ? 0.016 : 0.0055;

  const sunX = sunAzimuth * 180;
  const sunY = Math.max(10, sunElevation * 160);
  const sunZ = -120;

  return (
    <group>
      {/* Exponential Atmospheric Distance Fog */}
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      {/* Background Sky Dome Color */}
      <color attach="background" args={[skyColor]} />

      {/* Ambient Hemisphere Light (Sky & Ground bounce) */}
      <hemisphereLight
        color={ambientColor}
        groundColor="#3d4a36"
        intensity={ambientIntensity}
      />

      {/* Main Celestial Sun / Moon Directional Light */}
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={10}
        shadow-camera-far={350}
        shadow-bias={-0.0003}
      />

      {/* Sun / Moon Visible Mesh Disk */}
      <mesh position={[sunX * 1.5, sunY * 1.5, sunZ * 1.5]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial color={isDay ? '#fff8db' : '#d2e4f0'} />
      </mesh>
    </group>
  );
};
