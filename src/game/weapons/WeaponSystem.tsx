import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../state/useGameStore';
import { soundEngine } from '../audio/soundEngine';
import type { AnimalHitZone, AnimalInstance } from '../types';

interface ImpactParticle {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  color: string;
  life: number;
}

export const WeaponSystem: React.FC = () => {
  const { camera, scene } = useThree();

  const weaponRef = useRef<THREE.Group>(null);
  const recoilOffset = useRef(new THREE.Vector3(0, 0, 0));
  const recoilRotation = useRef(new THREE.Vector3(0, 0, 0));
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const lastShotTime = useRef(0);
  const impacts = useRef<ImpactParticle[]>([]);

  // Zustand Store selectors
  const equippedWeaponId = useGameStore((s) => s.equippedWeaponId);
  const isAiming = useGameStore((s) => s.isAiming);
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);
  const activeMenu = useGameStore((s) => s.activeMenu);
  const animals = useGameStore((s) => s.animals);

  const consumeAmmo = useGameStore((s) => s.consumeAmmo);
  const reloadWeapon = useGameStore((s) => s.reloadWeapon);
  const updateAnimal = useGameStore((s) => s.updateAnimal);
  const showHitFeedback = useGameStore((s) => s.showHitFeedback);
  const setLastLookedAnimal = useGameStore((s) => s.setLastLookedAnimal);

  // Weapon Fire Handler (Left Click)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || !isPointerLocked || activeMenu !== 'none') return;

      const now = performance.now();
      const weapon = useGameStore.getState().weapons[useGameStore.getState().equippedWeaponId];

      if (!weapon) return;
      if (weapon.id === 'binoculars') return; // binoculars don't fire

      // Check fire rate
      const minInterval = 1000 / weapon.fireRateRps;
      if (now - lastShotTime.current < minInterval) return;

      if (useGameStore.getState().isReloading) return;

      if (weapon.ammo <= 0) {
        soundEngine.playEmptyClick();
        reloadWeapon();
        return;
      }

      // Fire weapon!
      lastShotTime.current = now;
      const fired = consumeAmmo();
      if (!fired) return;

      // Recoil impulse
      recoilOffset.current.z = 0.08 * (weapon.id === 'rifle' ? 1.5 : 0.8);
      recoilRotation.current.x = 0.12 * (weapon.id === 'rifle' ? 1.5 : 0.6);

      if (weapon.id === 'rifle') {
        soundEngine.playRifleShot();
        setMuzzleFlash(true);
        setTimeout(() => setMuzzleFlash(false), 60);

        // Bolt cycle sound after shot
        setTimeout(() => {
          soundEngine.playBoltAction();
        }, 380);
      } else if (weapon.id === 'bow') {
        soundEngine.playBowRelease();
      }

      // Perform Raycast Ballistics
      executeShotRaycast(weapon.damage, weapon.range);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [isPointerLocked, activeMenu, consumeAmmo, reloadWeapon]);

  /**
   * Raycast shot hit detection against animals and world
   */
  const executeShotRaycast = (baseDamage: number, maxRange: number) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.far = maxRange;

    const currentAnimals = useGameStore.getState().animals;
    let closestHit: {
      animal: AnimalInstance;
      distance: number;
      hitZone: AnimalHitZone['zone'];
      point: THREE.Vector3;
    } | null = null;

    // Check hit against each live animal
    for (let i = 0; i < currentAnimals.length; i++) {
      const a = currentAnimals[i];
      if (a.state === 'dead' || a.state === 'harvested') continue;

      const [ax, ay, az] = a.position;
      const animalPos = new THREE.Vector3(ax, ay + 0.9, az); // animal center
      const toAnimal = new THREE.Vector3().subVectors(animalPos, camera.position);
      const dist = toAnimal.length();

      if (dist > maxRange) continue;

      // Ray distance to line
      const ray = raycaster.ray;
      const projDist = ray.distanceToPoint(animalPos);

      // Hit radius based on animal species size
      const hitRadius =
        a.species === 'bear'
          ? 1.4
          : a.species === 'deer'
          ? 1.0
          : a.species === 'boar'
          ? 0.9
          : a.species === 'wolf'
          ? 0.75
          : 0.45;

      if (projDist < hitRadius) {
        if (!closestHit || dist < closestHit.distance) {
          // Determine hit zone (Head, Vitals, Flesh, Leg)
          const hitPoint = new THREE.Vector3();
          ray.closestPointToPoint(animalPos, hitPoint);
          const heightOffset = hitPoint.y - ay;

          let hitZone: AnimalHitZone['zone'] = 'flesh';
          if (heightOffset > 1.25) {
            hitZone = 'head';
          } else if (heightOffset > 0.65 && heightOffset <= 1.25) {
            hitZone = 'vitals';
          } else if (heightOffset <= 0.4) {
            hitZone = 'leg';
          }

          closestHit = {
            animal: a,
            distance: dist,
            hitZone,
            point: hitPoint,
          };
        }
      }
    }

    if (closestHit) {
      // Animal Hit!
      const { animal, distance, hitZone, point } = closestHit;

      const multipliers = { vitals: 2.5, head: 3.0, flesh: 1.0, leg: 0.5 };
      const mult = multipliers[hitZone];
      const damage = Math.round(baseDamage * mult);

      const newHealth = Math.max(0, animal.health - damage);
      const isFatal = newHealth <= 0;

      // Update animal state
      updateAnimal(animal.id, {
        health: newHealth,
        isWounded: !isFatal,
        state: isFatal ? 'dead' : 'wounded_flee',
      });

      // Sound & HUD feedback
      soundEngine.playHitMarker();
      const zoneText =
        hitZone === 'vitals'
          ? 'VITALS HIT!'
          : hitZone === 'head'
          ? 'HEADSHOT!'
          : hitZone === 'flesh'
          ? 'FLESH HIT'
          : 'LEG HIT';
      showHitFeedback(hitZone === 'vitals' || hitZone === 'head', `${zoneText} (${damage} DMG • ${Math.round(distance)}m)`);

      // Spawn blood particles
      for (let p = 0; p < 8; p++) {
        impacts.current.push({
          pos: point.clone(),
          dir: new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2).normalize(),
          color: '#8b0000',
          life: 0.6,
        });
      }
    } else {
      // Missed animal: check terrain/environment hit for dust puff
      const hits = raycaster.intersectObjects(scene.children, true);
      if (hits.length > 0) {
        const hit = hits[0];
        for (let p = 0; p < 5; p++) {
          impacts.current.push({
            pos: hit.point.clone(),
            dir: hit.face ? hit.face.normal.clone().multiplyScalar(1.5) : new THREE.Vector3(0, 1, 0),
            color: '#c2b280',
            life: 0.4,
          });
        }
      }
    }
  };

  // Frame update: Weapon ADS positioning, sway, and recoil spring
  useFrame((_, delta) => {
    if (!weaponRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Spring recovery for recoil
    recoilOffset.current.z *= Math.max(0, 1 - dt * 18);
    recoilRotation.current.x *= Math.max(0, 1 - dt * 18);

    // Default hipfire vs ADS target positions relative to camera
    const isRifle = equippedWeaponId === 'rifle';
    const isBow = equippedWeaponId === 'bow';
    const isBino = equippedWeaponId === 'binoculars';

    let targetX = isRifle ? 0.28 : isBow ? 0.22 : 0.0;
    let targetY = isRifle ? -0.22 : isBow ? -0.18 : -0.24;
    let targetZ = isRifle ? -0.45 : isBow ? -0.4 : -0.38;

    if (isAiming) {
      if (isRifle) {
        // Center scope directly in view
        targetX = 0.0;
        targetY = -0.178;
        targetZ = -0.32;
      } else if (isBow) {
        targetX = 0.08;
        targetY = -0.12;
        targetZ = -0.35;
      } else if (isBino) {
        targetX = 0.0;
        targetY = -0.14;
        targetZ = -0.28;
      }
    }

    // Apply recoil offset
    targetZ += recoilOffset.current.z;

    // Smooth lerp to target transform
    weaponRef.current.position.x += (targetX - weaponRef.current.position.x) * dt * 14;
    weaponRef.current.position.y += (targetY - weaponRef.current.position.y) * dt * 14;
    weaponRef.current.position.z += (targetZ - weaponRef.current.position.z) * dt * 14;

    weaponRef.current.rotation.x = recoilRotation.current.x;

    // Binoculars Optics target tagging
    if (isBino && isAiming) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      raycaster.far = 400;

      let found = false;
      for (const a of animals) {
        if (a.state === 'dead' || a.state === 'harvested') continue;
        const [ax, ay, az] = a.position;
        const d = camera.position.distanceTo(new THREE.Vector3(ax, ay + 0.9, az));
        const proj = raycaster.ray.distanceToPoint(new THREE.Vector3(ax, ay + 0.9, az));
        if (proj < 1.8 && d < 350) {
          setLastLookedAnimal({
            species: a.species,
            distance: Math.round(d),
            rating: `${a.trophyRating} (${a.weightKg}kg)`,
          });
          found = true;
          break;
        }
      }
      if (!found) setLastLookedAnimal(null);
    } else {
      setLastLookedAnimal(null);
    }
  });

  return (
    <group ref={weaponRef}>
      {/* 1. M700 HUNTING RIFLE VIEWMODEL */}
      {equippedWeaponId === 'rifle' && (
        <group scale={[0.85, 0.85, 0.85]}>
          {/* Walnut Wooden Stock & Grip */}
          <mesh position={[0, -0.06, 0.15]}>
            <boxGeometry args={[0.048, 0.09, 0.48]} />
            <meshStandardMaterial color="#4a2e18" roughness={0.65} metalness={0.1} />
          </mesh>

          {/* Receiver / Action & Chamber */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.044, 0.065, 0.22]} />
            <meshStandardMaterial color="#1f2326" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Bolt Handle */}
          <mesh position={[0.035, 0.02, 0.02]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.007, 0.007, 0.06, 8]} />
            <meshStandardMaterial color="#2c3035" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Precision Steel Fluted Barrel */}
          <mesh position={[0, 0.012, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.018, 0.58, 16]} />
            <meshStandardMaterial color="#1b1e22" roughness={0.25} metalness={0.85} />
          </mesh>

          {/* 4x-8x Optical Scope */}
          <group position={[0, 0.062, -0.06]}>
            {/* Scope Tube */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.019, 0.019, 0.28, 16]} />
              <meshStandardMaterial color="#111315" roughness={0.2} metalness={0.85} />
            </mesh>
            {/* Objective Bell (front lens) */}
            <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.026, 0.019, 0.06, 16]} />
              <meshStandardMaterial color="#0e1012" roughness={0.2} metalness={0.85} />
            </mesh>
            {/* Ocular Bell (rear eyepiece) */}
            <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.019, 0.024, 0.05, 16]} />
              <meshStandardMaterial color="#0e1012" roughness={0.2} metalness={0.85} />
            </mesh>
            {/* Front & Rear Glass Lenses with subtle blue/green optical antireflective sheen */}
            <mesh position={[0, 0, -0.165]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.024, 16]} />
              <meshStandardMaterial color="#2d7cba" roughness={0.05} metalness={0.95} />
            </mesh>
            <mesh position={[0, 0, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.022, 16]} />
              <meshStandardMaterial color="#1e5482" roughness={0.05} metalness={0.95} />
            </mesh>
            {/* Scope Mount Rings */}
            <mesh position={[0, -0.022, -0.07]}>
              <boxGeometry args={[0.038, 0.045, 0.024]} />
              <meshStandardMaterial color="#151719" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.022, 0.07]}>
              <boxGeometry args={[0.038, 0.045, 0.024]} />
              <meshStandardMaterial color="#151719" metalness={0.9} roughness={0.3} />
            </mesh>
          </group>

          {/* Trigger Guard & Magazine Plate */}
          <mesh position={[0, -0.06, 0.0]}>
            <boxGeometry args={[0.032, 0.04, 0.12]} />
            <meshStandardMaterial color="#181a1d" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Muzzle Flash Light */}
          {muzzleFlash && (
            <pointLight position={[0, 0.012, -0.7]} color="#ffaa33" intensity={4.5} distance={15} decay={2} />
          )}
        </group>
      )}

      {/* 2. COMPOSITE HUNTING BOW VIEWMODEL */}
      {equippedWeaponId === 'bow' && (
        <group scale={[0.8, 0.8, 0.8]}>
          {/* Carbon Riser (Handle) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.035, 0.32, 0.055]} />
            <meshStandardMaterial color="#222428" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Upper & Lower Cam Limbs */}
          <mesh position={[0, 0.28, -0.06]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.03, 0.28, 0.025]} />
            <meshStandardMaterial color="#2d5a37" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.28, -0.06]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.03, 0.28, 0.025]} />
            <meshStandardMaterial color="#2d5a37" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Bowstring */}
          <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.72, 6]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.8} />
          </mesh>
          {/* Nocked Carbon Arrow with Broadhead */}
          <mesh position={[0.015, 0.02, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.65, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Arrow Fletching */}
          <mesh position={[0.015, 0.02, 0.14]}>
            <boxGeometry args={[0.02, 0.035, 0.08]} />
            <meshStandardMaterial color="#e65100" />
          </mesh>
        </group>
      )}

      {/* 3. HIGHLAND 12x50 SPOTTER BINOCULARS VIEWMODEL */}
      {equippedWeaponId === 'binoculars' && (
        <group scale={[0.75, 0.75, 0.75]}>
          {/* Left Barrel */}
          <mesh position={[-0.055, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.18, 16]} />
            <meshStandardMaterial color="#2b332b" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Right Barrel */}
          <mesh position={[0.055, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.18, 16]} />
            <meshStandardMaterial color="#2b332b" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Center Bridge & Focus Knob */}
          <mesh position={[0, 0.01, 0.01]}>
            <boxGeometry args={[0.06, 0.02, 0.08]} />
            <meshStandardMaterial color="#151716" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Coated Lenses */}
          <mesh position={[-0.055, 0, -0.092]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#1b4b72" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[0.055, 0, -0.092]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#1b4b72" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      )}
    </group>
  );
};
