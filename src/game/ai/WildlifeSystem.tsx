import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../state/useGameStore';
import { generateInitialWildlife, updateAnimalAI } from './wildlifeManager';
import { soundEngine } from '../audio/soundEngine';

export const WildlifeSystem: React.FC = () => {
  const animals = useGameStore((s) => s.animals);
  const setAnimals = useGameStore((s) => s.setAnimals);
  const playerPos = useGameStore((s) => s.playerPos);
  const noiseLevel = useGameStore((s) => s.noiseLevel);
  const isCrouched = useGameStore((s) => s.isCrouched);
  const windAngle = useGameStore((s) => s.windAngle);
  const activeMenu = useGameStore((s) => s.activeMenu);
  const addTrack = useGameStore((s) => s.addTrack);
  const setPlayerStats = useGameStore((s) => s.setPlayerStats);
  const showNotification = useGameStore((s) => s.showNotification);

  // Initialize wildlife population once on start
  useEffect(() => {
    if (animals.length === 0) {
      const initial = generateInitialWildlife();
      setAnimals(initial);
    }
  }, [animals.length, setAnimals]);

  // Main AI loop
  useFrame((_, delta) => {
    if (activeMenu !== 'none') return;
    const dt = Math.min(delta, 0.05);

    const onDropTrack = (track: any) => {
      addTrack(track);
    };

    const onAttackPlayer = (damage: number) => {
      const currentHealth = useGameStore.getState().health;
      const nextHealth = Math.max(0, currentHealth - damage);
      setPlayerStats({ health: nextHealth });
      soundEngine.playFootstep('wood', true);
      showNotification(`ATTACKED! Took ${damage} damage!`, 'warning');
    };

    // Update animals
    const updated = animals.map((animal) => {
      // Spatial distance check: animals very far away (>280m) can skip full logic
      const d = Math.hypot(animal.position[0] - playerPos[0], animal.position[2] - playerPos[2]);
      if (d > 280) return animal;

      return updateAnimalAI(
        animal,
        dt,
        playerPos,
        noiseLevel,
        isCrouched,
        windAngle,
        onDropTrack,
        onAttackPlayer
      );
    });

    setAnimals(updated);
  });

  return null;
};
