import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../state/useGameStore';
import { getTerrainHeight, getTerrainNormal, CABIN_POS, TOWER_POS, WORLD_HALF } from '../terrain/terrainHeight';
import { worldObstacles } from '../terrain/obstacles';
import { soundEngine } from '../audio/soundEngine';

const PLAYER_RADIUS = 0.45;
const STAND_EYE_HEIGHT = 1.65;
const CROUCH_EYE_HEIGHT = 1.0;
const WALK_SPEED = 3.6;
const SPRINT_SPEED = 7.0;
const CROUCH_SPEED = 1.8;
const GRAVITY = 22.0;
const JUMP_FORCE = 6.5;
const MAX_SLOPE_COS = 0.58; // ~54 degrees max walkable slope

export const PlayerController: React.FC = () => {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  // Physics state refs (kept out of React render cycles for 60fps responsiveness)
  const pos = useRef(new THREE.Vector3(-35, 6.2, 65));
  const velocityY = useRef(0);
  const isGrounded = useRef(true);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const currentEyeHeight = useRef(STAND_EYE_HEIGHT);
  const bobbingTimer = useRef(0);
  const stepTimer = useRef(0);
  const lastSafeGround = useRef(new THREE.Vector3(-35, 6.2, 65));

  // Store actions
  const setPlayerPos = useGameStore((s) => s.setPlayerPos);
  const setPlayerYaw = useGameStore((s) => s.setPlayerYaw);
  const setPlayerStats = useGameStore((s) => s.setPlayerStats);
  const setIsAiming = useGameStore((s) => s.setIsAiming);
  const toggleHunterSense = useGameStore((s) => s.toggleHunterSense);
  const setEquippedWeapon = useGameStore((s) => s.setEquippedWeapon);
  const reloadWeapon = useGameStore((s) => s.reloadWeapon);
  const setActiveMenu = useGameStore((s) => s.setActiveMenu);
  const setIsPointerLocked = useGameStore((s) => s.setIsPointerLocked);

  // Settings & active menu
  const activeMenu = useGameStore((s) => s.activeMenu);
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);
  const settings = useGameStore((s) => s.settings);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Menu toggles
      if (e.code === 'Escape') {
        if (activeMenu === 'none') {
          setActiveMenu('pause');
        } else if (activeMenu !== 'welcome') {
          setActiveMenu('none');
        }
        return;
      }

      if (activeMenu !== 'none') {
        // Close menu with its respective hotkey
        if (e.code === 'KeyM' && activeMenu === 'map') setActiveMenu('none');
        if (e.code === 'KeyI' && activeMenu === 'inventory') setActiveMenu('none');
        if (e.code === 'KeyL' && activeMenu === 'missions') setActiveMenu('none');
        if (e.code === 'KeyK' && activeMenu === 'shop') setActiveMenu('none');
        if (e.code === 'KeyP' && activeMenu === 'photo') setActiveMenu('none');
        return;
      }

      // In-game hotkeys
      if (e.code === 'KeyM') {
        setActiveMenu('map');
        return;
      }
      if (e.code === 'KeyI' || e.code === 'Tab') {
        e.preventDefault();
        setActiveMenu('inventory');
        return;
      }
      if (e.code === 'KeyL') {
        setActiveMenu('missions');
        return;
      }
      if (e.code === 'KeyK') {
        setActiveMenu('shop');
        return;
      }
      if (e.code === 'KeyP') {
        setActiveMenu('photo');
        return;
      }
      if (e.code === 'KeyQ') {
        toggleHunterSense();
        return;
      }
      if (e.code === 'KeyR') {
        reloadWeapon();
        return;
      }
      if (e.code === 'Digit1') setEquippedWeapon('rifle');
      if (e.code === 'Digit2') setEquippedWeapon('bow');
      if (e.code === 'Digit3') setEquippedWeapon('binoculars');

      keys.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      setIsPointerLocked(isLocked);
      if (!isLocked && useGameStore.getState().activeMenu === 'none') {
        setActiveMenu('pause');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === null || useGameStore.getState().activeMenu !== 'none') return;

      const sens = settings.mouseSensitivity;
      const isAiming = useGameStore.getState().isAiming;
      // Reduce mouse sensitivity when aiming through optic
      const aimFactor = isAiming ? 0.35 : 1.0;

      yaw.current -= e.movementX * sens * aimFactor;
      const invert = settings.invertY ? -1 : 1;
      pitch.current -= e.movementY * sens * aimFactor * invert;

      // Clamp pitch (-85 to +85 degrees)
      const maxPitch = (85 * Math.PI) / 180;
      pitch.current = Math.max(-maxPitch, Math.min(maxPitch, pitch.current));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement === null || useGameStore.getState().activeMenu !== 'none') return;

      if (e.button === 2) {
        // Right click ADS (Aim Down Sights)
        e.preventDefault();
        setIsAiming(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        setIsAiming(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [activeMenu, settings, setActiveMenu, setIsAiming, setIsPointerLocked, toggleHunterSense, reloadWeapon, setEquippedWeapon]);

  // Game Loop: Physics, Swept Collisions, Camera Alignment
  useFrame((_, delta) => {
    // Clamp delta to avoid physics instability on tab switch or frame drops
    const dt = Math.min(delta, 0.05);

    if (activeMenu !== 'none' || !isPointerLocked) {
      return;
    }

    const { stamina } = useGameStore.getState();
    const isAiming = useGameStore.getState().isAiming;

    // 1. Movement Inputs
    const k = keys.current;
    let forward = 0;
    let strafe = 0;
    if (k['KeyW'] || k['ArrowUp']) forward += 1;
    if (k['KeyS'] || k['ArrowDown']) forward -= 1;
    if (k['KeyA'] || k['ArrowLeft']) strafe -= 1;
    if (k['KeyD'] || k['ArrowRight']) strafe += 1;

    const isMoving = forward !== 0 || strafe !== 0;
    const wantsSprint = (k['ShiftLeft'] || k['ShiftRight']) && forward > 0 && !isAiming;
    const canSprint = wantsSprint && stamina > 5;
    const isCrouched = k['KeyC'] || k['ControlLeft'] || k['ControlRight'];

    // Speed calculation
    let currentSpeed = WALK_SPEED;
    if (isCrouched) {
      currentSpeed = CROUCH_SPEED;
    } else if (canSprint && isMoving) {
      currentSpeed = SPRINT_SPEED;
    }
    if (isAiming) {
      currentSpeed = CROUCH_SPEED * 0.85; // slower when ADS
    }

    // Stamina drain & recovery
    let newStamina = stamina;
    if (canSprint && isMoving) {
      newStamina = Math.max(0, stamina - dt * 22);
    } else {
      newStamina = Math.min(100, stamina + dt * (isCrouched ? 25 : 16));
    }

    // Noise calculation (for animal detection)
    let noise = 0.05;
    if (isMoving) {
      if (canSprint) noise = 0.95;
      else if (isCrouched) noise = 0.15;
      else noise = 0.45;
    }
    setPlayerStats({ stamina: newStamina, isSprinting: canSprint && isMoving, isCrouched, noiseLevel: noise });

    // 2. Direction vectors derived from camera yaw
    const forwardX = -Math.sin(yaw.current);
    const forwardZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = -Math.sin(yaw.current);

    let moveX = forward * forwardX + strafe * rightX;
    let moveZ = forward * forwardZ + strafe * rightZ;

    const moveLen = Math.hypot(moveX, moveZ);
    if (moveLen > 0.001) {
      moveX = (moveX / moveLen) * currentSpeed * dt;
      moveZ = (moveZ / moveLen) * currentSpeed * dt;
    } else {
      moveX = 0;
      moveZ = 0;
    }

    // 3. Slope check & cliff handling
    const [nx, ny, nz] = getTerrainNormal(pos.current.x, pos.current.z);
    if (ny < MAX_SLOPE_COS) {
      // Slope is too steep to climb - apply downward slide
      moveX += nx * dt * 4.5;
      moveZ += nz * dt * 4.5;
    }

    // 4. Swept Obstacle Collision Resolution against Trees, Rocks, Cabin, Tower
    let targetX = pos.current.x + moveX;
    let targetZ = pos.current.z + moveZ;

    // Check multiple iterations for stable corner sliding
    for (let iter = 0; iter < 3; iter++) {
      let collided = false;
      for (let i = 0; i < worldObstacles.length; i++) {
        const obs = worldObstacles[i];
        const dx = targetX - obs.x;
        const dz = targetZ - obs.z;
        const minDist = obs.radius + PLAYER_RADIUS;
        const distSq = dx * dx + dz * dz;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const overlap = minDist - dist;
          // Push player out along collision normal
          targetX += (dx / dist) * overlap;
          targetZ += (dz / dist) * overlap;
          collided = true;
        }
      }
      if (!collided) break;
    }

    // Boundary constraints (-WORLD_HALF to +WORLD_HALF)
    targetX = Math.max(-WORLD_HALF + 5, Math.min(WORLD_HALF - 5, targetX));
    targetZ = Math.max(-WORLD_HALF + 5, Math.min(WORLD_HALF - 5, targetZ));

    // 5. Vertical Terrain & Floor Ground Collision
    const terrainY = getTerrainHeight(targetX, targetZ);
    let surfaceGroundY = terrainY;

    // Cabin floor collision: Porch / cabin interior is at fixed elevated height (6.2m)
    const distToCabin = Math.hypot(targetX - CABIN_POS.x, targetZ - CABIN_POS.z);
    if (distToCabin < 5.8) {
      surfaceGroundY = Math.max(terrainY, 6.2);
    }

    // Lookout Tower collision & platform:
    const distToTower = Math.hypot(targetX - TOWER_POS.x, targetZ - TOWER_POS.z);
    if (distToTower < 3.8 && pos.current.y > terrainY + 12) {
      surfaceGroundY = Math.max(terrainY, 21.0); // top lookout platform
    }

    // Jump handling
    if (k['Space'] && isGrounded.current && newStamina > 15) {
      velocityY.current = JUMP_FORCE;
      isGrounded.current = false;
      setPlayerStats({ stamina: Math.max(0, newStamina - 15) });
      soundEngine.playFootstep('grass', false);
    }

    // Apply gravity
    if (!isGrounded.current) {
      velocityY.current -= GRAVITY * dt;
      pos.current.y += velocityY.current * dt;

      // Landing check
      if (pos.current.y <= surfaceGroundY) {
        pos.current.y = surfaceGroundY;
        velocityY.current = 0;
        isGrounded.current = true;
        soundEngine.playFootstep('grass', false);
      }
    } else {
      // Step up/down handling smoothly
      const groundDiff = surfaceGroundY - pos.current.y;
      if (groundDiff > 0 && groundDiff < 0.65) {
        // Step up
        pos.current.y = surfaceGroundY;
      } else if (groundDiff < -0.65) {
        // Step off ledge into free fall
        isGrounded.current = false;
      } else {
        // Smoothly adhere to ground
        pos.current.y = surfaceGroundY;
      }
    }

    // CRITICAL REQUIREMENT: Anti-Tunneling Safe Recovery System
    // If player somehow penetrates below ground or falls out of world, recover safely
    if (pos.current.y < terrainY - 0.5) {
      pos.current.copy(lastSafeGround.current);
      pos.current.y = getTerrainHeight(pos.current.x, pos.current.z);
      velocityY.current = 0;
      isGrounded.current = true;
    } else if (isGrounded.current) {
      lastSafeGround.current.copy(pos.current);
    }

    pos.current.x = targetX;
    pos.current.z = targetZ;

    // 6. Camera Eye Height & Crouching Transition
    const targetEyeH = isCrouched ? CROUCH_EYE_HEIGHT : STAND_EYE_HEIGHT;
    currentEyeHeight.current += (targetEyeH - currentEyeHeight.current) * Math.min(1.0, dt * 10);

    // 7. Head Bobbing & Footsteps
    let bobX = 0;
    let bobY = 0;
    if (isMoving && isGrounded.current) {
      const bobFreq = canSprint ? 14 : 9;
      const bobAmp = canSprint ? 0.055 : 0.028;
      bobbingTimer.current += dt * bobFreq;
      bobY = Math.sin(bobbingTimer.current) * bobAmp;
      bobX = Math.cos(bobbingTimer.current * 0.5) * (bobAmp * 0.6);

      // Footstep audio timing
      stepTimer.current += dt * (canSprint ? 1.8 : 1.2);
      if (stepTimer.current > 0.45) {
        stepTimer.current = 0;
        let surface: 'grass' | 'rock' | 'wood' | 'water' = 'grass';
        if (distToCabin < 5.8) surface = 'wood';
        else if (pos.current.z < -45) surface = 'rock';
        else if (surfaceGroundY <= 1.6) surface = 'water';

        soundEngine.playFootstep(surface, canSprint);
      }
    }

    // 8. Apply Camera Position and Rotation
    camera.position.set(pos.current.x + bobX, pos.current.y + currentEyeHeight.current + bobY, pos.current.z);

    // Set rotation from yaw and pitch (Euler YXZ)
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    // Update global store
    setPlayerPos([pos.current.x, pos.current.y, pos.current.z]);
    setPlayerYaw(yaw.current);

    // Update ambient audio with elevation and distance to lake
    const lakeDist = Math.hypot(pos.current.x - 30, pos.current.z - (-20));
    soundEngine.updateAmbientPosition(pos.current.x, pos.current.y, pos.current.z, lakeDist);
  });

  return null;
};
