import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../state/useGameStore';
import type { AnimalTrack } from '../types';

export const TrackingDecals: React.FC = () => {
  const tracks = useGameStore((s) => s.tracks);
  const playerPos = useGameStore((s) => s.playerPos);
  const isHunterSenseActive = useGameStore((s) => s.isHunterSenseActive);
  const setNearbyClue = useGameStore((s) => s.setNearbyClue);
  const showNotification = useGameStore((s) => s.showNotification);

  // Proximity check to track clues
  useFrame(() => {
    let closestTrack: AnimalTrack | null = null;
    let closestDist = 3.2; // Interaction distance

    for (let i = 0; i < tracks.length; i++) {
      const tr = tracks[i];
      const d = Math.hypot(playerPos[0] - tr.position[0], playerPos[2] - tr.position[2]);
      if (d < closestDist) {
        closestDist = d;
        closestTrack = tr;
      }
    }

    setNearbyClue(closestTrack);
  });

  // Handle [E] key for inspecting clue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        const clue = useGameStore.getState().nearbyClue;
        const harvestable = useGameStore.getState().harvestableAnimal;

        // If there's an animal to harvest, that takes priority
        if (harvestable) {
          const d = Math.hypot(
            playerPos[0] - harvestable.position[0],
            playerPos[2] - harvestable.position[2]
          );
          useGameStore.getState().harvestAnimal(harvestable, 'vitals', d);
          return;
        }

        if (clue) {
          const speciesName = clue.species.toUpperCase();
          const info =
            clue.type === 'blood'
              ? `[WOUNDED TRAIL] ${speciesName} • Fresh Blood Trail • High Bleed Rate`
              : clue.type === 'droppings'
              ? `[SCENT CLUE] ${speciesName} Droppings • ${clue.freshness} • Animal nearby`
              : `[TRACK] ${speciesName} Footprint • ${clue.freshness} • Heading along trail`;

          showNotification(info, 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, showNotification]);

  return (
    <group>
      {tracks.map((track) => (
        <TrackItem key={track.id} track={track} isHunterSense={isHunterSenseActive} />
      ))}
    </group>
  );
};

const TrackItem: React.FC<{ track: AnimalTrack; isHunterSense: boolean }> = ({ track, isHunterSense }) => {
  const [tx, ty, tz] = track.position;
  const isBlood = track.type === 'blood';
  const isDroppings = track.type === 'droppings';

  const defaultColor = isBlood ? '#8b0000' : isDroppings ? '#382512' : '#22301c';
  const glowColor = isBlood ? '#ff2222' : '#ff9900';

  return (
    <group position={[tx, ty + 0.02, tz]} rotation={[0, track.rotation, 0]}>
      {/* Track Decal Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.45]} />
        <meshStandardMaterial
          color={isHunterSense ? glowColor : defaultColor}
          emissive={isHunterSense ? glowColor : '#000000'}
          emissiveIntensity={isHunterSense ? 1.6 : 0.0}
          roughness={0.9}
          transparent
          opacity={isHunterSense ? 0.95 : 0.65}
        />
      </mesh>

      {/* Directional Trajectory Indicator in Hunter Sense Mode */}
      {isHunterSense && (
        <mesh position={[0, 0.04, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.3, 3]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={2.0}
          />
        </mesh>
      )}
    </group>
  );
};
